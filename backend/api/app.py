import os
import logging
import json
import re
import time
from datetime import date, datetime, time as dtime, timezone
from decimal import Decimal
from uuid import UUID
import threading
from time import sleep
from collections import defaultdict
from typing import Any, Dict, Iterable, List, Optional, Tuple
from flask import Flask, jsonify, request, abort, g, Response
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from typing import Optional
from ua_parser import user_agent_parser
from user_agents import parse as ua_parse
import ipaddress
import requests
from functools import lru_cache

# -------------------- Prometheus --------------------
from prometheus_client import (
    Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST,
    CollectorRegistry, multiprocess, PROCESS_COLLECTOR, PLATFORM_COLLECTOR
)

# -------------------- Config --------------------
API_TOKEN = os.getenv("API_TOKEN", "").strip()
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "pldashboard")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "")

GEO_URL = os.getenv("GEO_URL", "http://ipgeo.epl-data.svc.cluster.local:8080")
GEO_TIMEOUT = float(os.getenv("GEO_TIMEOUT", "0.35"))
GEO_CACHE_TTL = int(os.getenv("GEO_CACHE_TTL", "1800")) 

POOL: Optional[SimpleConnectionPool] = None
POOL_LOCK = threading.Lock()


POOL_MIN = int(os.getenv("DB_POOL_MIN", "1"))
POOL_MAX = int(os.getenv("DB_POOL_MAX", "10"))

CORS_ENABLED = os.getenv("CORS_ENABLED", "false").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []

IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,63}$")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_JSON  = os.getenv("LOG_JSON", "true").lower() == "true"

# Prometheus multiprocess (Gunicorn) support
PROM_MULTI_DIR = os.getenv("PROMETHEUS_MULTIPROC_DIR")  # set in k8s
if PROM_MULTI_DIR:
    registry = CollectorRegistry()
    multiprocess.MultiProcessCollector(registry)
else:
    registry = CollectorRegistry()

PUBLIC_PATHS = {
    "/health",
    "/readyz",
    "/metrics",
}

# -------------------- App --------------------
app = Flask(__name__)
app.url_map.strict_slashes = False
if CORS_ENABLED:
    CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}})

# -------------------- Structured logging --------------------
class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        # Safely access Flask's g object - only available in request context
        try:
            rid = getattr(g, "request_id", None)
            if rid:
                payload["request_id"] = rid
            path = getattr(g, "request_path", None)
            if path:
                payload["path"] = path
            method = getattr(g, "request_method", None)
            if method:
                payload["method"] = method
            status = getattr(g, "response_status", None)
            if status is not None:
                payload["status"] = status
        except RuntimeError:
            # Outside request context - skip request-specific fields
            pass
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)

def _setup_logging():
    gunicorn_logger = logging.getLogger("gunicorn.error")
    root = logging.getLogger()
    for h in list(root.handlers):
        root.removeHandler(h)
    handler = logging.StreamHandler()
    if LOG_JSON:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root.addHandler(handler)
    root.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    if gunicorn_logger and gunicorn_logger.handlers:
        root.handlers = gunicorn_logger.handlers
        root.setLevel(gunicorn_logger.level)

_setup_logging()
logger = logging.getLogger(__name__)

def _is_public(path: str) -> bool:
    return path in PUBLIC_PATHS

def _device_family(ua_str: str) -> str:
    ua = ua_parse(ua_str or "")
    if ua.is_bot:    return "Bot"
    if ua.is_mobile: return "Mobile"
    if ua.is_tablet: return "Tablet"
    if ua.is_pc:     return "Desktop"
    return "Other"

def _parse_ua(ua_str: str):
    p = user_agent_parser.Parse(ua_str or "")
    browser = (p["user_agent"]["family"] or "unknown").lower()
    browser_major = p["user_agent"]["major"] or "0"
    os_fam = (p["os"]["family"] or "unknown").lower()
    os_major = p["os"]["major"] or "0"
    dev = _device_family(ua_str or "")
    return dev, os_fam, os_major, browser, browser_major

_geo_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
def _geo_cache_get(ip: str) -> Optional[Dict[str, Any]]:
    now = time.time()
    ent = _geo_cache.get(ip)
    if not ent: return None
    ts, val = ent
    if now - ts > GEO_CACHE_TTL:
        _geo_cache.pop(ip, None)
        return None
    return val

def _geo_cache_put(ip: str, val: Dict[str, Any]) -> None:
    _geo_cache[ip] = (time.time(), val)

def _is_public_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
        return not (addr.is_private or addr.is_loopback or addr.is_reserved or addr.is_link_local)
    except Exception:
        return False

def _geo_lookup(ip: str) -> Dict[str, Any]:

    if not ip or not _is_public_ip(ip):
        return {}
    hit = _geo_cache_get(ip)
    if hit is not None:
        return hit

    try:
        r = requests.get(f"{GEO_URL}/lookup", params={"ip": ip}, timeout=GEO_TIMEOUT)
        if r.ok:
            data = r.json() or {}
            out = {
                "country_iso2": (data.get("country_iso2") or data.get("country_code") or "").upper(),
                "country_name": data.get("country_name") or "",
                "region":       data.get("region") or data.get("region_name") or "",
                "city":         data.get("city") or "",
                "latitude":     data.get("latitude"),
                "longitude":    data.get("longitude"),
                "asn":          data.get("asn") or data.get("as") or "",
                "isp":          data.get("isp") or data.get("org") or "",
            }
            _geo_cache_put(ip, out)
            return out
    except Exception:
        pass

    return {}



# -------------------- Security headers --------------------
@app.after_request
def add_security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Cache-Control"] = "no-store"
    return resp

# -------------------- Prometheus metrics --------------------
REQUESTS = Counter(
    "api_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
    registry=registry,
)
REQ_LATENCY = Histogram(
    "api_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
    registry=registry,
)
INFLIGHT = Gauge(
    "api_inflight_requests",
    "In-flight requests",
    registry=registry,
)

REBUILD_COUNT = Counter(
    "weekly_table_rebuild_total",
    "Weekly table rebuilds",
    ["result"],  # success|error
    registry=registry,
)
REBUILD_DURATION = Histogram(
    "weekly_table_rebuild_duration_seconds",
    "Duration of weekly table rebuilds",
    registry=registry,
)

DB_POOL_AVAILABLE = Gauge(
    "db_pool_available_connections",
    "Connections currently available in pool",
    registry=registry,
)
DB_POOL_INUSE = Gauge(
    "db_pool_inuse_connections",
    "Connections currently in use",
    registry=registry,
)
VISITS_TOTAL = Counter(
    "web_visits_total",
    "Total visits (all API hits counted)",
    registry=registry,
)

VISITS_BY_COUNTRY = Counter(
    "web_visits_by_country_total",
    "Visits by country (from Cloudflare header if available)",
    ["country"],
    registry=registry,
)

VISITS_BY_UA = Counter(
    "web_visits_by_ua_total",
    "Visits by coarse UA buckets",
    ["device", "os", "os_major", "browser", "browser_major"],
    registry=registry,
)

def _endpoint_label():
    # use rule endpoint if available; fallback to path
    if request.url_rule and request.url_rule.rule:
        return request.url_rule.rule
    return request.path or "unknown"

@app.before_request
def _api_token_gate():
    if request.method == "OPTIONS" or _is_public(request.path):
        return

    token = request.headers.get("X-API-Token") or request.args.get("api_token")
    if not API_TOKEN or token != API_TOKEN:
        abort(401, description="Missing or Invalid API token")


@app.before_request
def _start_timer_and_request_id():
    g.start_time = time.time()
    g.request_id = request.headers.get("X-Request-ID") or request.headers.get("X-Cf-Ray") or os.urandom(6).hex()
    g.request_path = request.path
    g.request_method = request.method
    INFLIGHT.inc()

@app.before_request
def _visit_enrich_and_count():
    try:
        client_ip = request.headers.get("CF-Connecting-IP") \
                    or request.headers.get("X-Forwarded-For","").split(",")[0].strip() \
                    or request.remote_addr

        cf_country = (request.headers.get("CF-IPCountry") or "").strip().upper()
        geo = _geo_lookup(client_ip) if _is_public_ip(client_ip) else {}

        country = (geo.get("country_iso2") or cf_country or "UNKNOWN").upper()

        ua_str = request.headers.get("User-Agent","")
        dev, os_fam, os_major, browser, browser_major = _parse_ua(ua_str)

        g._visit = {
            "ts": int(time.time()),
            "path": request.path,
            "method": request.method,
            "ip": client_ip,
            "country": country,
            "city": geo.get("city") or "",
            "region": geo.get("region") or "",
            "asn": geo.get("asn") or "",
            "isp": geo.get("isp") or "",
            "lat": geo.get("latitude"),
            "lon": geo.get("longitude"),
            "device": dev,
            "os": f"{os_fam} {os_major}",
            "browser": f"{browser} {browser_major}",
        }

        VISITS_TOTAL.inc()
        if country != "UNKNOWN":
            VISITS_BY_COUNTRY.labels(country=country).inc()
        VISITS_BY_UA.labels(
            device=dev, os=os_fam, os_major=os_major,
            browser=browser, browser_major=browser_major
        ).inc()

    except Exception:
        pass


@app.after_request
def _record_metrics_and_log(resp):
    try:
        duration = max(time.time() - getattr(g, "start_time", time.time()), 0)
        endpoint = _endpoint_label()
        REQ_LATENCY.labels(request.method, endpoint).observe(duration)
        REQUESTS.labels(request.method, endpoint, str(resp.status_code)).inc()
        g.response_status = resp.status_code
        logger.info(f"{request.method} {request.path} -> {resp.status_code} in {duration:.4f}s")
    finally:
        INFLIGHT.dec()
    resp.headers["X-Request-ID"] = g.request_id
    try:
        v = getattr(g, "_visit", None)
        if v:
            v = dict(v) 
            v["status"] = resp.status_code
            v["event"] = "visit"

            print(json.dumps(v, ensure_ascii=False), flush=True)
    except Exception:
        pass
    return resp

@app.route("/metrics")
def metrics():
    return Response(generate_latest(registry), mimetype=CONTENT_TYPE_LATEST)

def _export_pool_metrics():

    try:
        if POOL is None:
            DB_POOL_AVAILABLE.set(0)
            DB_POOL_INUSE.set(0)
            return
        DB_POOL_AVAILABLE.set(POOL._pool.qsize())
        inuse = len(getattr(POOL, "_used", {}))
        DB_POOL_INUSE.set(inuse)
    except Exception:
        pass

def _ensure_pool():
    """Initialize the pool once with small retry/backoff."""
    global POOL
    if POOL is not None:
        return
    with POOL_LOCK:
        if POOL is not None:
            return
        for attempt in range(1, 31):
            try:
                p = SimpleConnectionPool(
                    POOL_MIN,
                    POOL_MAX,
                    host=DB_HOST,
                    port=DB_PORT,
                    dbname=DB_NAME,
                    user=DB_USER,
                    password=DB_PASS,
                    connect_timeout=5,
                    application_name="epl_api",
                )
                with p.getconn() as c:
                    with c.cursor() as cur:
                        cur.execute("SELECT 1;")
                POOL = p
                logger.info("DB pool initialized")
                _export_pool_metrics()
                return
            except Exception as e:
                logger.warning("DB pool init attempt %d/30 failed: %s", attempt, e)
                time.sleep(2)
        logger.error("DB pool could not be initialized after retries")

class ConnCtx:
    def __enter__(self):
        _ensure_pool()
        if POOL is None:
            raise RuntimeError("DB unavailable")
        self.conn = POOL.getconn()
        _export_pool_metrics()
        return self.conn

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc:
                self.conn.rollback()
            else:
                self.conn.commit()
        finally:
            POOL.putconn(self.conn)
            _export_pool_metrics()

def _to_jsonable(v):
    if isinstance(v, (datetime, date, dtime)):
        return v.isoformat()
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, UUID):
        return str(v)
    return v

def jsonify_records(records):
    return jsonify([{k: _to_jsonable(v) for k, v in rec.items()} for rec in records])


# -------------------- Health --------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/readyz", methods=["GET"])
def readyz():
    try:
        with ConnCtx() as conn, conn.cursor() as cur:
            cur.execute("SELECT 1;")
            _ = cur.fetchone()
        return jsonify({"ready": True})
    except Exception:
        logger.exception("Readiness check failed")
        abort(503, description="DB not ready")

# -------------------- Routes --------------------
@app.route("/standings", methods=["GET"])
def standings():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM standings')
        return jsonify_records(cur.fetchall())
    
@app.route("/weeklyTable", methods=["GET"])
def weekly_table():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM weeklystandings')
        return jsonify_records(cur.fetchall())

@app.route("/players", methods=["GET"])
def players():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM players')
        return jsonify_records(cur.fetchall())

@app.route("/playersById/<playerId>", methods=["GET"])
def players_by_id(playerId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM players WHERE player_id = %s', (playerId,))
        return jsonify_records(cur.fetchall())

@app.route("/playersByTeam/<teamId>", methods=["GET"])
def players_by_team(teamId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM players WHERE team_id = %s', (teamId,))
        return jsonify_records(cur.fetchall())

@app.route("/teams", methods=["GET"])
def teams():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM teams')
        return jsonify_records(cur.fetchall())

@app.route("/teamsById/<teamId>", methods=["GET"])
def teams_by_id(teamId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM teams WHERE id = %s', (teamId,))
        return jsonify_records(cur.fetchall())
    
@app.route("/fixtures", methods=["GET"])
def fixtures():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM fixtures')
        return jsonify_records(cur.fetchall())
    
@app.route("/fixturesById/<fixtureId>", methods=["GET"])
def fixtures_by_id(fixtureId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM fixtures WHERE match_id = %s', (fixtureId,))
        return jsonify_records(cur.fetchall())

@app.route('/completedFixtures', methods=['GET'])
def completed_fixtures():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM completedfixtures')
        return jsonify_records(cur.fetchall())

@app.route('/completedGamebyId/<matchId>', methods=['GET'])
def completed_game_by_id(matchId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM completedfixtures WHERE match_id = %s', (matchId,))
        return jsonify_records(cur.fetchall())

@app.route('/completedGamebyTeamId/<teamId>', methods=['GET'])
def completed_game_by_team_id(teamId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM completedfixtures WHERE home_team_id = %s OR away_team_id = %s', (teamId, teamId))
        return jsonify_records(cur.fetchall())

    
@app.route('/matchReport/<matchId>', methods=['GET'])
def match_report(matchId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT match_report FROM completedfixtures WHERE match_id = %s', (matchId,))
        return cur.fetchone()

@app.route('/upcomingFixtures', methods=['GET'])
def upcoming_fixtures():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''SELECT * FROM fixtures
                        WHERE match_id NOT IN (
                            SELECT match_id from completedfixtures)
                        ORDER BY kickoff_time''')
        return jsonify_records(cur.fetchall())

@app.route('/upcomingFixturesbyID/<fixtureId>', methods=['GET'])
def upcoming_fixtures_by_id(fixtureId):
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''SELECT * FROM fixtures
                        WHERE match_id = %s''', (fixtureId,))
        return jsonify_records(cur.fetchall())    

@app.route('/upcomingGameweek', methods=['GET'])
def upcoming_gameweek():
    with ConnCtx() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''SELECT gameweek FROM fixtures
                        WHERE match_id NOT IN (
                            SELECT match_id from completedfixtures)
                        LIMIT 1''')
        return (cur.fetchone())

# -------------------- Error Handlers --------------------
@app.errorhandler(400)
def bad_request(e):
    return jsonify(error="bad_request", message=str(e.description)), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify(error="not_found", message=str(e.description)), 404

@app.errorhandler(503)
def svc_unavailable(e):
    return jsonify(error="service_unavailable", message=str(e.description)), 503

@app.errorhandler(Exception)
def unhandled(e):
    logger.exception("Unhandled error")
    return jsonify(error="internal_error"), 500

@app.route("/debug/geo")
def debug_geo():
    ip = request.args.get("ip") or request.headers.get("CF-Connecting-IP") \
         or request.headers.get("X-Forwarded-For","").split(",")[0].strip() \
         or request.remote_addr
    return jsonify({"ip": ip, "geo": _geo_lookup(ip)})

# -------------------- Entrypoint --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
