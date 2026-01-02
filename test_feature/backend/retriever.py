import requests
import time
import logging
from typing import Dict, Any, List, Optional
from config import Config

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self):
        self.base_url = Config.BASE_URL
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _get_cached(self, endpoint: str) -> Optional[Any]:
        """Simple in-memory TTL cache get."""
        if endpoint in self._cache:
            entry = self._cache[endpoint]
            if time.time() - entry['timestamp'] < Config.CACHE_TTL_SECONDS:
                return entry['data']
            else:
                del self._cache[endpoint]
        return None

    def _set_cached(self, endpoint: str, data: Any):
        """Simple in-memory TTL cache set."""
        self._cache[endpoint] = {
            'timestamp': time.time(),
            'data': data
        }

    def _fetch(self, endpoint: str) -> List[Dict[str, Any]]:
        """Fetch data from the API with caching."""
        cached = self._get_cached(endpoint)
        if cached:
            logger.info(f"Cache hit for {endpoint}")
            return cached

        try:
            url = f"{self.base_url}{endpoint}"
            logger.info(f"Fetching from {url}")
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            self._set_cached(endpoint, data)
            return data
        except requests.RequestException as e:
            logger.error(f"Error fetching {endpoint}: {e}")
            return []

    def get_teams(self) -> List[Dict[str, Any]]:
        return self._fetch("/teams")

    def get_players(self) -> List[Dict[str, Any]]:
        # Players payload is large, so we definitely want this cached.
        # In a real app we might want server-side filtering, but for this POC
        # we are asked to prevent "Select * vibe" by being smart.
        # However, the user also said "You must design the POC to avoid loading everything blindly"
        # AND "Fetch only relevant data ... using targeted filters when possible (or client-side filtering)".
        # Since the main API only exposes /players (all), we have to fetch all and filter in memory here
        # or rely on the cache to mitigate the cost.
        return self._fetch("/players")

    def get_fixtures(self) -> List[Dict[str, Any]]:
        return self._fetch("/fixtures")

    def get_completed_fixtures(self) -> List[Dict[str, Any]]:
        # Note: Validated endpoint is /completedFixtures (camelCase)
        return self._fetch("/completedFixtures")
