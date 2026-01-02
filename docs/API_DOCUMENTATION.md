# Premier League Dashboard API Documentation

## Overview
This API provides access to Premier League data including teams, players, fixtures, standings, and match statistics.

**Base URL**: `http://your-api-domain/`  
**Authentication**: All endpoints (except public paths) require an API token via:
- Header: `X-API-Token: <token>`
- Query parameter: `?api_token=<token>`

---

## Public Endpoints

### Health Check
**Endpoint**: `GET /health`  
**Authentication**: Not required  
**Description**: Basic health check endpoint

**Response**:
```json
{
  "status": "ok"
}
```

---

### Readiness Check
**Endpoint**: `GET /readyz`  
**Authentication**: Not required  
**Description**: Checks database connectivity

**Response**:
```json
{
  "ready": true
}
```

---

### Metrics
**Endpoint**: `GET /metrics`  
**Authentication**: Not required  
**Description**: Prometheus metrics endpoint for monitoring

**Response**: Prometheus text format with metrics including:
- Request counts and latencies
- Database pool statistics
- Visit tracking metrics
- Rebuild statistics

---

## Standings Endpoints

### Get Current Standings
**Endpoint**: `GET /standings`  
**Authentication**: Required  
**Description**: Returns the current Premier League standings/table

**Response**: Array of team standings
```json
[
  {
    "teamname": "Arsenal",
    "played": 15,
    "won": 10,
    "drawn": 3,
    "lost": 2,
    "goals_for": 32,
    "goals_against": 15,
    "goal_difference": 17,
    "points": 33,
    "home": {
      "played": 8,
      "won": 6,
      "drawn": 1,
      "lost": 1,
      "goals_for": 18,
      "goals_against": 8,
      "goal_difference": 10,
      "points": 19
    },
    "away": {
      "played": 7,
      "won": 4,
      "drawn": 2,
      "lost": 1,
      "goals_for": 14,
      "goals_against": 7,
      "goal_difference": 7,
      "points": 14
    }
  }
]
```

**Fields**:
- `teamname`: Team name (VARCHAR)
- `played`: Total matches played (INTEGER)
- `won`: Matches won (INTEGER)
- `drawn`: Matches drawn (INTEGER)
- `lost`: Matches lost (INTEGER)
- `goals_for`: Goals scored (INTEGER)
- `goals_against`: Goals conceded (INTEGER)
- `goal_difference`: Goal difference (INTEGER)
- `points`: Total points (INTEGER)
- `home`: JSONB object with home statistics
  - `played`: Home matches played
  - `won`: Home matches won
  - `drawn`: Home matches drawn
  - `lost`: Home matches lost
  - `goals_for`: Home goals scored
  - `goals_against`: Home goals conceded
  - `goal_difference`: Home goal difference
  - `points`: Home points earned
- `away`: JSONB object with away statistics
  - `played`: Away matches played
  - `won`: Away matches won
  - `drawn`: Away matches drawn
  - `lost`: Away matches lost
  - `goals_for`: Away goals scored
  - `goals_against`: Away goals conceded
  - `goal_difference`: Away goal difference
  - `points`: Away points earned

---

### Get Weekly Standings
**Endpoint**: `GET /weeklyTable`  
**Authentication**: Required  
**Description**: Returns standings by gameweek showing progression throughout the season

**Response**: Array of weekly standings
```json
[
  {
    "gameweek": 1,
    "team_name": "Liverpool",
    "played": 1,
    "won": 1,
    "drawn": 0,
    "lost": 0,
    "goals_for": 4,
    "goals_against": 2,
    "goal_difference": 2,
    "points": 3
  }
]
```

**Fields**:
- `gameweek`: Gameweek number (INTEGER, PRIMARY KEY)
- `team_name`: Team name (VARCHAR)
- `played`: Matches played up to this gameweek (INTEGER)
- `won`: Matches won (INTEGER)
- `drawn`: Matches drawn (INTEGER)
- `lost`: Matches lost (INTEGER)
- `goals_for`: Goals scored (INTEGER)
- `goals_against`: Goals conceded (INTEGER)
- `goal_difference`: Goal difference (INTEGER)
- `points`: Total points (INTEGER)

---

## Team Endpoints

### Get All Teams
**Endpoint**: `GET /teams`  
**Authentication**: Required  
**Description**: Returns all Premier League teams with their information and statistics

**Response**: Array of teams
```json
[
  {
    "id": 14,
    "team_id": 14,
    "name": "Liverpool",
    "abbr": "LIV",
    "stats": {
      "goals": 45,
      "goals_conceded": 18,
      "assists": 32,
      "clean_sheets": 8,
      "shots": 245,
      "shots_on_target": 102,
      "shots_off_target": 143,
      "shots_blocked": 67,
      "possession_avg": 58.5,
      "pass_accuracy": 86.3,
      "passes_total": 8523,
      "passes_completed": 7359,
      "tackles": 234,
      "interceptions": 156,
      "yellow_cards": 28,
      "red_cards": 2,
      "expected_goals": 42.5,
      "expected_assists": 28.3
    }
  }
]
```

**Fields**:
- `id`: Database ID (INTEGER, PRIMARY KEY)
- `team_id`: Team ID (INTEGER)
- `name`: Team name (VARCHAR)
- `abbr`: Team abbreviation (VARCHAR)
- `stats`: JSONB object with team statistics (45+ fields including):
  - `goals`: Goals scored
  - `goals_conceded`: Goals conceded
  - `assists`: Total assists
  - `clean_sheets`: Clean sheets
  - `shots`, `shots_on_target`, `shots_off_target`, `shots_blocked`
  - `possession_avg`: Average possession %
  - `pass_accuracy`: Pass accuracy %
  - `passes_total`, `passes_completed`, `passes_forward`, `passes_backward`
  - `tackles`, `tackles_won`, `interceptions`, `clearances`, `blocks`
  - `duels_won`, `duels_lost`, `aerials_won`, `aerials_lost`
  - `fouls_committed`, `fouls_won`, `yellow_cards`, `red_cards`
  - `offsides`, `corners`, `corners_conceded`
  - `expected_goals`, `expected_assists`, `expected_goals_conceded`
  - `touches`, `touches_opp_box`, `distance_covered`
  - And more... (see Database Schema for complete list)

---

### Get Team by ID
**Endpoint**: `GET /teamsById/<teamId>`  
**Authentication**: Required  
**Description**: Returns a specific team's information

**Parameters**:
- `teamId`: Team ID (path parameter)

**Response**: Array with single team object (same structure as /teams)

---

## Player Endpoints

### Get All Players
**Endpoint**: `GET /players`  
**Authentication**: Required  
**Description**: Returns all players with their information and statistics

**Response**: Array of players
```json
[
  {
    "player_id": 118748,
    "team_id": 14,
    "player_name": "Mohamed Salah",
    "position": "Forward",
    "nationality": "Egypt",
    "age": 32,
    "appearances": 15,
    "goals": 12,
    "assists": 8,
    "yellow_cards": 2,
    "red_cards": 0,
    "minutes_played": 1350,
    "fpl_stats": {
      "total_points": 145,
      "price": 13.5,
      "selected_by_percent": 45.2,
      "goals_per_90": 0.85,
      "assists_per_90": 0.56,
      "clean_sheets": 5,
      "goals_conceded": 12,
      "bonus": 18,
      "bps": 456,
      "influence": "1250.2",
      "creativity": "876.4",
      "threat": "1450.8",
      "ict_index": "358.1",
      "expected_goals": "12.45",
      "expected_assists": "8.32",
      "expected_goal_involvements": "20.77",
      "form": "7.5",
      "points_per_game": "6.2",
      "minutes": 1350,
      "starts": 15,
      "status": "a",
      "chance_of_playing_this_round": 100
    }
  }
]
```

**Fields**:
- `player_id`: Player ID (INTEGER, PRIMARY KEY)
- `team_id`: Team ID (INTEGER)
- `player_name`: Player name (VARCHAR)
- `position`: Player position (VARCHAR)
- `nationality`: Player nationality (VARCHAR)
- `age`: Player age (INTEGER)
- `appearances`: Number of appearances (INTEGER)
- `goals`: Goals scored (INTEGER)
- `assists`: Assists provided (INTEGER)
- `yellow_cards`: Yellow cards received (INTEGER)
- `red_cards`: Red cards received (INTEGER)
- `minutes_played`: Total minutes played (INTEGER)
- `fpl_stats`: JSONB object with Fantasy Premier League statistics (40+ fields including):
  - `total_points`: Total FPL points
  - `price`: Current price (millions)
  - `selected_by_percent`: Ownership %
  - `goals_per_90`, `assists_per_90`: Per 90 min stats
  - `clean_sheets`, `goals_conceded`: Defensive stats
  - `bonus`, `bps`: Bonus point metrics
  - `influence`, `creativity`, `threat`, `ict_index`: ICT metrics
  - `expected_goals`, `expected_assists`, `expected_goal_involvements`: xG metrics
  - `form`, `points_per_game`: Form indicators
  - `saves`, `penalties_saved`, `penalties_missed`: Specialist stats
  - `minutes`, `starts`: Playing time
  - `transfers_in`, `transfers_out`: Transfer statistics
  - `value_form`, `value_season`: Value metrics
  - `status`: Player availability (a/d/i/u)
  - `chance_of_playing_this_round`, `chance_of_playing_next_round`: Availability %
  - And more... (see Database Schema for complete list)

---

### Get Player by ID
**Endpoint**: `GET /playersById/<playerId>`  
**Authentication**: Required  
**Description**: Returns a specific player's information

**Parameters**:
- `playerId`: Player ID (path parameter)

**Response**: Array with single player object (same structure as /players)

---

### Get Players by Team
**Endpoint**: `GET /playersByTeam/<teamId>`  
**Authentication**: Required  
**Description**: Returns all players for a specific team

**Parameters**:
- `teamId`: Team ID (path parameter)

**Response**: Array of player objects (same structure as /players)

---

## Fixture Endpoints

### Get All Fixtures
**Endpoint**: `GET /fixtures`  
**Authentication**: Required  
**Description**: Returns all fixtures (both completed and upcoming)

**Response**: Array of fixtures
```json
[
  {
    "match_id": 2561896,
    "kickoff_timezone": "Europe/London",
    "kickoff_time": "2025-08-16T12:30:00+00:00",
    "home_team_id": 7,
    "home_team_name": "Aston Villa",
    "home_team_abbr": "AVL",
    "away_team_id": 4,
    "away_team_name": "Newcastle United",
    "away_team_abbr": "NEW",
    "gameweek": 1,
    "venue": "Villa Park, Birmingham"
  }
]
```

**Fields**:
- `match_id`: Match ID (INTEGER, PRIMARY KEY)
- `kickoff_timezone`: Timezone (VARCHAR)
- `kickoff_time`: Kickoff time (TIMESTAMP)
- `home_team_id`: Home team ID (INTEGER)
- `home_team_name`: Home team name (VARCHAR)
- `home_team_abbr`: Home team abbreviation (VARCHAR)
- `away_team_id`: Away team ID (INTEGER)
- `away_team_name`: Away team name (VARCHAR)
- `away_team_abbr`: Away team abbreviation (VARCHAR)
- `gameweek`: Gameweek number (INTEGER)
- `venue`: Match venue (VARCHAR)

---

### Get Fixture by ID
**Endpoint**: `GET /fixturesById/<fixtureId>`  
**Authentication**: Required  
**Description**: Returns a specific fixture

**Parameters**:
- `fixtureId`: Fixture/Match ID (path parameter) - queries `fixture_id` column

**Response**: Array with single fixture object (same structure as /fixtures)

**Note**: The database schema uses `match_id` as the primary key, but this endpoint queries `fixture_id`

---

### Get Completed Fixtures
**Endpoint**: `GET /completedFixtures`  
**Authentication**: Required  
**Description**: Returns all completed matches with full statistics

**Note**: Queries the `completed_fixtures` table (alternative spelling of `completedfixtures`)

**Response**: Array of completed fixtures
```json
[
  {
    "match_id": 2561896,
    "kickoff_timezone": "Europe/London",
    "kickoff_time": "2025-08-16T12:30:00+00:00",
    "home_team_id": 7,
    "home_team_name": "Aston Villa",
    "home_team_abbr": "AVL",
    "home_team_score": 0,
    "home_team_redcard": 1,
    "away_team_id": 4,
    "away_team_name": "Newcastle United",
    "away_team_abbr": "NEW",
    "away_team_score": 0,
    "away_team_redcard": 0,
    "gameweek": 1,
    "venue": "Villa Park, Birmingham",
    "events": {
      "homeTeam": {
        "id": "7",
        "name": "Aston Villa",
        "shortName": "Aston Villa",
        "goals": [
          {
            "time": "37",
            "period": "FirstHalf",
            "goalType": "Goal",
            "playerId": "510663",
            "timestamp": "20250815T203720+0100",
            "assistPlayerId": "243016"
          }
        ],
        "cards": [
          {
            "time": "58",
            "type": "Yellow",
            "period": "SecondHalf",
            "playerId": "226944",
            "timestamp": "20250816T134505+0100"
          }
        ],
        "subs": [
          {
            "time": "78",
            "period": "SecondHalf",
            "timestamp": "20250816T140441+0100",
            "playerOnId": "114243",
            "playerOffId": "449434"
          }
        ]
      },
      "awayTeam": { /* Same structure */ }
    },
    "home_stats": {
      "goals": 0,
      "saves": 3,
      "touches": 472,
      "totalPass": 310,
      "accuratePass": 227,
      "possessionPercentage": 39.9,
      "expectedGoals": 0.2036,
      "expectedAssists": 0.233068,
      "expectedGoalsOnTarget": 0.2041,
      "totalScoringAtt": 3,
      "ontargetScoringAtt": 3,
      "shotOffTarget": 0,
      "bigChanceMissed": 1,
      "bigChanceScored": 0,
      "bigChanceCreated": 1,
      "duelWon": 40,
      "duelLost": 43,
      "aerialWon": 10,
      "aerialLost": 20,
      "totalTackle": 11,
      "wonTackle": 5,
      "interception": 10,
      "totalClearance": 20,
      "totalCross": 11,
      "accurateCross": 3,
      "wonCorners": 3,
      "lostCorners": 6,
      "fkFoulWon": 11,
      "fkFoulLost": 13,
      "yellowCard": 0,
      "redCard": 0,
      "totalDistance": 103824.63,
      "fastestPlayer": {
        "playerId": "149484",
        "topSpeed": 33.48
      }
    },
    "away_stats": { /* 150+ fields - same structure */ }
  }
]
```

**Fields** (in addition to fixture fields):
- `home_team_score`: Home team final score (INTEGER)
- `home_team_redcard`: Home team red cards (INTEGER)
- `away_team_score`: Away team final score (INTEGER)
- `away_team_redcard`: Away team red cards (INTEGER)
- `events`: JSONB object containing match events
  - `homeTeam`/`awayTeam`: Team event objects
    - `id`, `name`, `shortName`: Team identifiers
    - `goals`: Array of goal events (time, period, goalType, playerId, assistPlayerId, timestamp)
    - `cards`: Array of card events (time, type, period, playerId, timestamp)
    - `subs`: Array of substitution events (time, period, playerOnId, playerOffId, timestamp)
- `home_stats`: JSONB object with 150+ comprehensive statistics
- `away_stats`: JSONB object with 150+ comprehensive statistics

**Match Statistics Categories** (150+ fields per team):
- **Scoring & Goals**: goals, goalsOpenplay, goalFastbreak, goalsConceded, goalAssist, winningGoal, ownGoals, forwardGoals, midfielderGoals, defenderGoals
- **Expected Goals**: expectedGoals, expectedAssists, expectedGoalsOnTarget, expectedGoalsOnTargetConceded
- **Shooting**: totalScoringAtt, ontargetScoringAtt, shotOffTarget, attemptsIbox, attemptsObox, bigChanceMissed, bigChanceScored, bigChanceCreated
- **Shooting Detail**: By zone (Ibox/Obox), by foot (Hd/Lf/Rf), by height (Low/High Left/Right/Centre), by situation (Openplay/Setpiece/Fastbreak)
- **Assists**: totalAttAssist, ontargetAttAssist, offtargetAttAssist, attAssistOpenplay, attAssistSetplay
- **Passing**: totalPass, accuratePass, fwdPass, backwardPass, openPlayPass, totalLongBalls, accurateLongBalls, totalChippedPass, totalThroughBall
- **Passing Zones**: totalFwdZonePass, totalBackZonePass, totalFinalThirdPasses, successfulFinalThirdPasses
- **Crosses**: totalCross, accurateCross, crosses18yard, crosses18yardplus, blockedCross
- **Set Pieces**: cornerTaken, wonCorners, lostCorners, totalCornersIntobox, freekickCross
- **Creative**: putThrough, successfulPutThrough, totalPullBack, totalFlickOn, totalLayoffs
- **Possession**: possessionPercentage, touches, touchesInOppBox, ballRecovery, dispossessed, possLostAll
- **Possession Zones**: possWonAtt3rd, possWonMid3rd, possWonDef3rd, penAreaEntries, finalThirdEntries
- **Defensive**: totalTackle, wonTackle, interception, interceptionWon, totalClearance, headClearance, blockedPass, outfielderBlock
- **Duels**: duelWon, duelLost, totalContest, wonContest, aerialWon, aerialLost, challengeLost
- **Goalkeeper**: saves, savedIbox, savedObox, divingSave, goalKicks, keeperThrows, punches, cleanSheet, goodHighClaim
- **Disciplinary**: yellowCard, redCard, totalYelCard, totalRedCard, fkFoulWon, fkFoulLost, handBall
- **Movement**: totalDistance, fastestPlayer (object with playerId and topSpeed)
- **Other**: subsMade, totalOffside, totalThrows, totalFastbreak

See Database Schema documentation for complete field definitions.

---

### Get Completed Game by ID
**Endpoint**: `GET /completedGamebyId/<matchId>`  
**Authentication**: Required  
**Description**: Returns a specific completed match with full statistics

**Parameters**:
- `matchId`: Match ID (path parameter)

**Response**: Array with single completed fixture object (same structure as /completedFixtures)

---

### Get Upcoming Fixtures
**Endpoint**: `GET /upcomingFixtures`  
**Authentication**: Required  
**Description**: Returns all fixtures that haven't been completed yet, ordered by kickoff time

**Response**: Array of upcoming fixtures (same structure as /fixtures)

**Notes**: 
- Excludes matches that exist in the completedfixtures table
- Ordered by kickoff_time ascending

---

### Get Upcoming Fixture by ID
**Endpoint**: `GET /upcomingFixturesbyID/<fixtureId>`  
**Authentication**: Required  
**Description**: Returns a specific upcoming fixture

**Parameters**:
- `fixtureId`: Fixture/Match ID (path parameter) - queries `match_id` column

**Response**: Array with single upcoming fixture object (same structure as /fixtures)

---

### Get Upcoming Gameweek
**Endpoint**: `GET /upcomingGameweek`  
**Authentication**: Required  
**Description**: Returns the next gameweek number that hasn't been completed

**Response**: Single object with gameweek number (uses `fetchone()` so returns single record)
```json
{
  "gameweek": 17
}
```

**Fields**:
- `gameweek`: Next gameweek number (INTEGER)

**Note**: Returns the gameweek of the earliest upcoming fixture by kickoff time

---

## Debug Endpoints

### Debug Geo Lookup
**Endpoint**: `GET /debug/geo`  
**Authentication**: Required  
**Description**: Debug endpoint to test geolocation lookup functionality

**Parameters**:
- `ip`: Optional IP address to lookup (query parameter)

**Response**:
```json
{
  "ip": "1.2.3.4",
  "geo": {
    "country_iso2": "GB",
    "country_name": "United Kingdom",
    "region": "England",
    "city": "London",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "asn": "AS15169",
    "isp": "Google LLC"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Description of the error"
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Missing or Invalid API token"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 503 Service Unavailable
```json
{
  "error": "service_unavailable",
  "message": "DB not ready"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error"
}
```

---

## Response Headers

All responses include the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Cache-Control: no-store`
- `X-Request-ID: <unique-id>` - Unique identifier for request tracing

---

## Data Types

### DateTime Format
All datetime fields are returned in ISO 8601 format:
```
2025-08-16T12:30:00+00:00
```

### JSONB Fields
Complex statistics and nested data are stored as JSONB and returned as JSON objects. These include:
- Team stats in `/teams`
- Player FPL stats in `/players`
- Match events in `/completedFixtures`
- Home/away statistics in `/completedFixtures`
- Home/away splits in `/standings`

---

## Rate Limiting & Performance

- The API uses connection pooling for database efficiency
- Prometheus metrics are exposed for monitoring
- All queries use parameterized statements to prevent SQL injection
- Visit tracking and geolocation enrichment are performed asynchronously

---

## Monitoring

The `/metrics` endpoint exposes Prometheus metrics including:
- `api_requests_total`: Total HTTP requests by method, endpoint, and status
- `api_request_duration_seconds`: Request latency histogram
- `api_inflight_requests`: Current in-flight requests
- `db_pool_available_connections`: Available database connections
- `db_pool_inuse_connections`: Database connections in use
- `web_visits_total`: Total visits
- `web_visits_by_country_total`: Visits by country
- `web_visits_by_ua_total`: Visits by user agent details

---

## Notes

1. All endpoints return data as JSON arrays, even when returning a single record
2. The API uses CORS when enabled via environment variables
3. Client IP geolocation is cached for 30 minutes to improve performance
4. The API tracks visits with enriched metadata (country, device, browser) for analytics
