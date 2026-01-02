# Premier League Dashboard Database Schema

## Overview
PostgreSQL database schema for storing Premier League data including fixtures, teams, players, standings, and match statistics.

**Database Name**: `epl`  
**PostgreSQL Version**: 17.6+  
**Character Encoding**: UTF8

---

## Tables

### 1. completedfixtures

Stores detailed information about completed matches including scores, events, and comprehensive statistics.

**Primary Key**: `match_id`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `match_id` | INTEGER | NOT NULL | Unique match identifier (PRIMARY KEY) |
| `kickoff_timezone` | VARCHAR(255) | YES | Timezone of kickoff (e.g., "Europe/London") |
| `kickoff_time` | TIMESTAMP | YES | Match kickoff timestamp |
| `home_team_id` | INTEGER | YES | Home team identifier |
| `home_team_name` | VARCHAR(255) | YES | Full home team name |
| `home_team_abbr` | VARCHAR(10) | YES | Home team abbreviation (3 letters) |
| `home_team_score` | INTEGER | YES | Home team final score |
| `home_team_redcard` | INTEGER | YES | Number of red cards shown to home team |
| `away_team_id` | INTEGER | YES | Away team identifier |
| `away_team_name` | VARCHAR(255) | YES | Full away team name |
| `away_team_abbr` | VARCHAR(10) | YES | Away team abbreviation (3 letters) |
| `away_team_score` | INTEGER | YES | Away team final score |
| `away_team_redcard` | INTEGER | YES | Number of red cards shown to away team |
| `gameweek` | INTEGER | YES | Premier League gameweek number (1-38) |
| `venue` | VARCHAR(255) | YES | Stadium name and location |
| `events` | JSONB | YES | Match events (goals, cards, substitutions) |
| `home_stats` | JSONB | YES | Comprehensive home team statistics |
| `away_stats` | JSONB | YES | Comprehensive away team statistics |

**JSONB Structure - events**:
```json
{
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
}
```

**Events Fields**:
- `id`: Team ID
- `name`: Full team name
- `shortName`: Short team name
- `goals`: Array of goal events
  - `time`: Minute of goal
  - `period`: "FirstHalf" or "SecondHalf"
  - `goalType`: "Goal", "Penalty", "OwnGoal", etc.
  - `playerId`: Scorer's player ID
  - `timestamp`: ISO timestamp with timezone
  - `assistPlayerId`: Assisting player ID (null if unassisted)
- `cards`: Array of card events
  - `time`: Minute of card
  - `type`: "Yellow", "SecondYellow", "StraightRed"
  - `period`: "FirstHalf" or "SecondHalf"
  - `playerId`: Player ID who received card
  - `timestamp`: ISO timestamp
- `subs`: Array of substitution events
  - `time`: Minute of substitution
  - `period`: "FirstHalf" or "SecondHalf"
  - `timestamp`: ISO timestamp
  - `playerOnId`: Incoming player ID
  - `playerOffId`: Outgoing player ID

**JSONB Structure - home_stats / away_stats**:
Comprehensive match statistics (150+ fields):

**Scoring & Goals**:
- `goals`: Goals scored
- `goalsOpenplay`: Goals from open play
- `goalFastbreak`: Goals from fast breaks
- `goalsConceded`: Goals conceded
- `goalsConcededIbox`: Goals conceded inside box
- `goalsConcededObox`: Goals conceded outside box
- `goalAssist`: Total assists
- `goalAssistOpenplay`: Assists from open play
- `goalAssistIntentional`: Intentional assists
- `winningGoal`: Winning goals scored
- `ownGoals`: Own goals
- `forwardGoals`: Goals by forwards
- `midfielderGoals`: Goals by midfielders
- `defenderGoals`: Goals by defenders
- `keeperGoals`: Goals by goalkeeper
- `subsGoals`: Goals by substitutes

**Expected Goals (xG)**:
- `expectedGoals`: Expected goals (xG)
- `expectedAssists`: Expected assists (xA)
- `expectedGoalsOnTarget`: xG from on-target shots
- `expectedGoalsOnTargetConceded`: xG conceded from on-target shots
- `expectedGoalsFreekick`: xG from free kicks

**Shooting & Attempts**:
- `totalScoringAtt`: Total scoring attempts
- `ontargetScoringAtt`: On-target scoring attempts
- `shotOffTarget`: Shots off target
- `shotFastbreak`: Fast break shots
- `attemptsIbox`: Attempts inside box
- `attemptsObox`: Attempts outside box
- `attemptsConcededIbox`: Attempts conceded inside box
- `attemptsConcededObox`: Attempts conceded outside box
- `blockedScoringAtt`: Blocked scoring attempts
- `bigChanceMissed`: Big chances missed
- `bigChanceScored`: Big chances scored
- `bigChanceCreated`: Big chances created

**Shooting Detail (by zone/type)**:
- `attIboxGoal`: Inside box goals
- `attIboxMiss`: Inside box misses
- `attIboxTarget`: Inside box on target
- `attIboxBlocked`: Inside box blocked
- `attOboxGoal`: Outside box goals
- `attOboxMiss`: Outside box misses
- `attOboxTarget`: Outside box on target
- `attOboxBlocked`: Outside box blocked
- `attBxLeft`: Box left attempts
- `attBxRight`: Box right attempts
- `attBxCentre`: Box centre attempts
- `attObxCentre`: Outside box centre
- `attLgCentre`: Long range centre

**Shooting Detail (by foot/head)**:
- `attHdGoal`: Header goals
- `attHdMiss`: Header misses
- `attHdTotal`: Total headers
- `attHdTarget`: Headers on target
- `attLfGoal`: Left foot goals
- `attLfTotal`: Left foot attempts
- `attLfTarget`: Left foot on target
- `attRfGoal`: Right foot goals
- `attRfTotal`: Right foot attempts
- `attRfTarget`: Right foot on target

**Shooting Detail (by height)**:
- `attGoalLowLeft`: Goals low left
- `attGoalLowRight`: Goals low right
- `attGoalLowCentre`: Goals low centre
- `attGoalHighLeft`: Goals high left
- `attGoalHighRight`: Goals high right
- `attGoalHighCentre`: Goals high centre
- `attMissLeft`: Misses left
- `attMissRight`: Misses right
- `attMissHigh`: Misses high
- `attMissHighLeft`: Misses high left
- `attMissHighRight`: Misses high right
- `attCmissLeft`: Close misses left

**Shooting Detail (by situation)**:
- `attOpenplay`: Open play attempts
- `attSetpiece`: Set piece attempts
- `attFastbreak`: Fast break attempts
- `attFreekickGoal`: Free kick goals
- `attFreekickTotal`: Free kick attempts
- `attPenGoal`: Penalty goals
- `attObpGoal`: Other box position goals
- `attCorner`: Corner attempts

**Assists**:
- `totalAttAssist`: Total attacking assists
- `ontargetAttAssist`: On-target assist attempts
- `offtargetAttAssist`: Off-target assist attempts
- `attAssistOpenplay`: Open play assists
- `attAssistSetplay`: Set play assists

**Passing**:
- `totalPass`: Total passes
- `accuratePass`: Accurate passes
- `fwdPass`: Forward passes
- `backwardPass`: Backward passes
- `openPlayPass`: Open play passes
- `successfulOpenPlayPass`: Successful open play passes
- `passesLeft`: Left side passes
- `passesRight`: Right side passes
- `leftsidePass`: Leftside passes
- `rightsidePass`: Rightside passes
- `totalLongBalls`: Total long balls
- `accurateLongBalls`: Accurate long balls
- `totalChippedPass`: Chipped passes
- `accurateChippedPass`: Accurate chipped passes
- `totalLaunches`: Total launches
- `accurateLaunches`: Accurate launches
- `totalThroughBall`: Through balls
- `accurateThroughBall`: Accurate through balls
- `longPassOwnToOpp`: Long passes own to opponent half
- `longPassOwnToOppSuccess`: Successful long passes own to opponent

**Passing by Zone**:
- `totalFwdZonePass`: Forward zone passes
- `accurateFwdZonePass`: Accurate forward zone passes
- `totalBackZonePass`: Back zone passes
- `accurateBackZonePass`: Accurate back zone passes
- `totalFinalThirdPasses`: Final third passes
- `successfulFinalThirdPasses`: Successful final third passes

**Crosses & Set Pieces**:
- `totalCross`: Total crosses
- `accurateCross`: Accurate crosses
- `totalCrossNocorner`: Crosses (no corners)
- `accurateCrossNocorner`: Accurate crosses (no corners)
- `crosses18yard`: Crosses inside 18 yard
- `crosses18yardplus`: Crosses outside 18 yard
- `blockedCross`: Blocked crosses
- `effectiveBlockedCross`: Effective blocked crosses
- `cornerTaken`: Corners taken
- `totalCornersIntobox`: Corners into box
- `accurateCornersIntobox`: Accurate corners into box
- `wonCorners`: Corners won
- `lostCorners`: Corners lost
- `freekickCross`: Free kick crosses
- `accurateFreekickCross`: Accurate free kick crosses
- `freekickTotal`: Total free kicks

**Creative Passing**:
- `putThrough`: Put through attempts
- `successfulPutThrough`: Successful put throughs
- `totalPullBack`: Pull backs
- `accuratePullBack`: Accurate pull backs
- `totalFlickOn`: Flick ons
- `accurateFlickOn`: Accurate flick ons
- `totalLayoffs`: Layoffs
- `accurateLayoffs`: Accurate layoffs

**Possession & Ball Control**:
- `possessionPercentage`: Possession percentage
- `touches`: Total touches
- `touchesInOppBox`: Touches in opponent box
- `unsuccessfulTouch`: Unsuccessful touches
- `ballRecovery`: Ball recoveries
- `possLostAll`: Possession lost (all)
- `possLostCtrl`: Possession lost (control)
- `dispossessed`: Times dispossessed
- `overrun`: Times overrun

**Possession by Zone**:
- `possWonAtt3rd`: Possession won attacking third
- `possWonMid3rd`: Possession won middle third
- `possWonDef3rd`: Possession won defensive third
- `penAreaEntries`: Penalty area entries
- `finalThirdEntries`: Final third entries

**Defensive Actions**:
- `totalTackle`: Total tackles
- `wonTackle`: Won tackles
- `attemptedTackleFoul`: Tackle fouls
- `interception`: Interceptions
- `interceptionWon`: Interceptions won
- `interceptionsInBox`: Interceptions in box
- `totalClearance`: Total clearances
- `effectiveClearance`: Effective clearances
- `headClearance`: Head clearances
- `effectiveHeadClearance`: Effective head clearances
- `outfielderBlock`: Outfielder blocks
- `blockedPass`: Blocked passes
- `shieldBallOop`: Shield ball out of play

**Duels & Aerials**:
- `duelWon`: Duels won
- `duelLost`: Duels lost
- `totalContest`: Total contests
- `wonContest`: Won contests
- `aerialWon`: Aerials won
- `aerialLost`: Aerials lost
- `challengeLost`: Challenges lost

**Goalkeeper Stats**:
- `saves`: Total saves
- `savedIbox`: Saves inside box
- `savedObox`: Saves outside box
- `divingSave`: Diving saves
- `attSvLowLeft`: Attempts saved low left
- `attSvLowRight`: Attempts saved low right
- `attSvLowCentre`: Attempts saved low centre
- `attSvHighLeft`: Attempts saved high left
- `attSvHighCentre`: Attempts saved high centre
- `goalKicks`: Goal kicks
- `accurateGoalKicks`: Accurate goal kicks
- `keeperThrows`: Keeper throws
- `accurateKeeperThrows`: Accurate keeper throws
- `totalKeeperSweeper`: Keeper sweeper actions
- `accurateKeeperSweeper`: Accurate keeper sweeper
- `goodHighClaim`: Good high claims
- `totalHighClaim`: Total high claims
- `punches`: Punches
- `cleanSheet`: Clean sheet (1 or 0)
- `errorLeadToGoal`: Errors leading to goal

**Disciplinary**:
- `yellowCard`: Yellow cards (single)
- `totalYelCard`: Total yellow cards
- `redCard`: Red cards (single)
- `totalRedCard`: Total red cards
- `fkFoulWon`: Free kicks/fouls won
- `fkFoulLost`: Free kicks/fouls lost
- `fouledFinalThird`: Fouled in final third
- `handBall`: Handballs

**Substitutions & Offside**:
- `subsMade`: Substitutions made
- `totalOffside`: Offsides

**Throw-ins**:
- `totalThrows`: Total throw-ins
- `accurateThrows`: Accurate throw-ins

**Movement & Speed**:
- `totalDistance`: Total distance covered (meters)
- `fastestPlayer`: Object containing fastest player
  - `playerId`: Player ID
  - `topSpeed`: Top speed (km/h)

**Fast Breaks**:
- `totalFastbreak`: Total fast breaks

**Indexes**: Primary key index on `match_id`

**Sample Row**:
```sql
match_id: 2561896
home_team_name: 'Aston Villa'
home_team_score: 0
away_team_name: 'Newcastle United'
away_team_score: 0
gameweek: 1
```

---

### 2. fixtures

Stores the Premier League fixture schedule including both completed and upcoming matches.

**Primary Key**: `match_id`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `match_id` | INTEGER | NOT NULL | Unique match identifier (PRIMARY KEY) |
| `kickoff_timezone` | VARCHAR(255) | YES | Timezone of kickoff |
| `kickoff_time` | TIMESTAMP | YES | Scheduled kickoff timestamp |
| `home_team_id` | INTEGER | YES | Home team identifier |
| `home_team_name` | VARCHAR(255) | YES | Full home team name |
| `home_team_abbr` | VARCHAR(10) | YES | Home team abbreviation |
| `away_team_id` | INTEGER | YES | Away team identifier |
| `away_team_name` | VARCHAR(255) | YES | Full away team name |
| `away_team_abbr` | VARCHAR(10) | YES | Away team abbreviation |
| `gameweek` | INTEGER | YES | Gameweek number (1-38) |
| `venue` | VARCHAR(255) | YES | Stadium name and location |

**Indexes**: Primary key index on `match_id`

**Notes**:
- Contains all 380 fixtures for the season (20 teams × 19 rounds × 2)
- Completed matches are also stored in `completedfixtures` with additional data
- Used to generate upcoming fixtures list by excluding completed matches

**Sample Row**:
```sql
match_id: 2561896
kickoff_time: '2025-08-16 12:30:00+00'
home_team_name: 'Aston Villa'
away_team_name: 'Newcastle United'
gameweek: 1
venue: 'Villa Park, Birmingham'
```

---

### 3. players

Stores player information, statistics, and Fantasy Premier League data.

**Primary Key**: `player_id`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `player_id` | INTEGER | NOT NULL | Unique player identifier (PRIMARY KEY) |
| `team_id` | INTEGER | YES | Current team identifier |
| `player_name` | VARCHAR(255) | YES | Full player name |
| `position` | VARCHAR(50) | YES | Player position (Forward, Midfielder, Defender, Goalkeeper) |
| `nationality` | VARCHAR(100) | YES | Player nationality |
| `age` | INTEGER | YES | Player age |
| `appearances` | INTEGER | YES | Number of appearances this season |
| `goals` | INTEGER | YES | Goals scored this season |
| `assists` | INTEGER | YES | Assists provided this season |
| `yellow_cards` | INTEGER | YES | Yellow cards received |
| `red_cards` | INTEGER | YES | Red cards received |
| `minutes_played` | INTEGER | YES | Total minutes played |
| `fpl_stats` | JSONB | YES | Fantasy Premier League statistics and metrics |

**JSONB Structure - fpl_stats**:
```json
{
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
  "expected_goals_conceded": "15.23",
  "form": "7.5",
  "points_per_game": "6.2",
  "saves": 45,
  "penalties_saved": 1,
  "penalties_missed": 0,
  "minutes": 1350,
  "starts": 15,
  "transfers_in": 125000,
  "transfers_out": 85000,
  "transfers_in_event": 5000,
  "transfers_out_event": 3000,
  "value_form": "0.5",
  "value_season": "9.8",
  "cost_change_start": 0,
  "cost_change_event": 0,
  "dreamteam_count": 3,
  "in_dreamteam": false,
  "news": "",
  "news_added": null,
  "status": "a",
  "chance_of_playing_this_round": 100,
  "chance_of_playing_next_round": 100
}
```

**FPL Stats Fields**:
- `total_points`: Total FPL points this season
- `price`: Current player price (millions)
- `selected_by_percent`: Ownership percentage
- `goals_per_90`: Goals per 90 minutes
- `assists_per_90`: Assists per 90 minutes
- `clean_sheets`: Clean sheets (for defenders/GKs)
- `goals_conceded`: Goals conceded (for defenders/GKs)
- `bonus`: Total bonus points earned
- `bps`: Bonus points system score
- `influence`: Influence score (string)
- `creativity`: Creativity score (string)
- `threat`: Threat score (string)
- `ict_index`: ICT index (combined metric)
- `expected_goals`: Expected goals (xG)
- `expected_assists`: Expected assists (xA)
- `expected_goal_involvements`: xG + xA
- `expected_goals_conceded`: Expected goals conceded (xGC)
- `form`: Recent form rating
- `points_per_game`: Average points per game
- `saves`: Total saves (for GKs)
- `penalties_saved`: Penalties saved
- `penalties_missed`: Penalties missed
- `minutes`: Total minutes played
- `starts`: Number of starts
- `transfers_in`: Total season transfers in
- `transfers_out`: Total season transfers out
- `transfers_in_event`: This gameweek transfers in
- `transfers_out_event`: This gameweek transfers out
- `value_form`: Points per price (form)
- `value_season`: Points per price (season)
- `cost_change_start`: Price change since season start
- `cost_change_event`: Price change this gameweek
- `dreamteam_count`: Times in dream team
- `in_dreamteam`: Currently in dream team
- `news`: Injury/availability news
- `news_added`: Timestamp of news addition
- `status`: Player status (a=available, d=doubtful, i=injured, u=unavailable)
- `chance_of_playing_this_round`: Chance % this round
- `chance_of_playing_next_round`: Chance % next round

**Indexes**: Primary key index on `player_id`

**Foreign Keys**: `team_id` references teams table

**Sample Row**:
```sql
player_id: 118748
team_id: 14
player_name: 'Mohamed Salah'
position: 'Forward'
goals: 12
assists: 8
```

---

### 4. standings

Stores the current Premier League table/standings with home and away splits.

**No Primary Key** (can contain multiple snapshots)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `teamname` | VARCHAR(255) | YES | Team name |
| `played` | INTEGER | YES | Total matches played |
| `won` | INTEGER | YES | Matches won |
| `drawn` | INTEGER | YES | Matches drawn |
| `lost` | INTEGER | YES | Matches lost |
| `goals_for` | INTEGER | YES | Goals scored |
| `goals_against` | INTEGER | YES | Goals conceded |
| `goal_difference` | INTEGER | YES | Goal difference (GF - GA) |
| `points` | INTEGER | YES | Total points (Win=3, Draw=1) |
| `home` | JSONB | YES | Home statistics |
| `away` | JSONB | YES | Away statistics |

**JSONB Structure - home / away**:
```json
{
  "played": 8,
  "won": 6,
  "drawn": 1,
  "lost": 1,
  "goals_for": 18,
  "goals_against": 8,
  "goal_difference": 10,
  "points": 19
}
```

**Home/Away Split Fields**:
- `played`: Matches played
- `won`: Matches won
- `drawn`: Matches drawn
- `lost`: Matches lost
- `goals_for`: Goals scored
- `goals_against`: Goals conceded
- `goal_difference`: Goal difference (goals_for - goals_against)
- `points`: Points earned (won × 3 + drawn × 1)

**Indexes**: None (consider adding index on `teamname` for performance)

**Notes**:
- Typically contains 20 rows (one per Premier League team)
- Updated after each gameweek completes
- `points` calculated as: (won × 3) + (drawn × 1)
- `goal_difference` = `goals_for` - `goals_against`

**Sample Row**:
```sql
teamname: 'Liverpool'
played: 16
won: 12
drawn: 3
lost: 1
points: 39
goal_difference: 24
```

---

### 5. teams

Stores team information and aggregate statistics.

**Primary Key**: `id`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INTEGER | NOT NULL | Database identifier (PRIMARY KEY) |
| `team_id` | INTEGER | YES | Team identifier (matches other tables) |
| `name` | VARCHAR(255) | YES | Full team name |
| `abbr` | VARCHAR(10) | YES | Team abbreviation (3 letters) |
| `stadium` | VARCHAR(255) | YES | Home stadium name |
| `founded` | INTEGER | YES | Year founded |
| `stats` | JSONB | YES | Aggregate team statistics |

**JSONB Structure - stats**:
```json
{
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
  "passes_forward": 3421,
  "passes_backward": 2456,
  "long_balls": 567,
  "crosses": 234,
  "crosses_accurate": 89,
  "through_balls": 45,
  "tackles": 234,
  "tackles_won": 178,
  "interceptions": 156,
  "clearances": 289,
  "blocks": 67,
  "duels_won": 678,
  "duels_lost": 543,
  "aerials_won": 234,
  "aerials_lost": 189,
  "fouls_committed": 189,
  "fouls_won": 213,
  "yellow_cards": 28,
  "red_cards": 2,
  "offsides": 45,
  "corners": 123,
  "corners_conceded": 98,
  "penalties_scored": 3,
  "penalties_missed": 1,
  "penalties_conceded": 2,
  "saves": 67,
  "big_chances_created": 34,
  "big_chances_missed": 18,
  "expected_goals": 42.5,
  "expected_assists": 28.3,
  "expected_goals_conceded": 21.7,
  "touches": 12456,
  "touches_opp_box": 456,
  "distance_covered": 1678234.5,
  "sprints": 2345,
  "final_third_entries": 678,
  "penalty_area_entries": 234
}
```

**Team Stats Fields**:
- `goals`: Total goals scored
- `goals_conceded`: Total goals conceded
- `assists`: Total assists
- `clean_sheets`: Clean sheets achieved
- `shots`: Total shots
- `shots_on_target`: Shots on target
- `shots_off_target`: Shots off target
- `shots_blocked`: Shots blocked
- `possession_avg`: Average possession percentage
- `pass_accuracy`: Pass accuracy percentage
- `passes_total`: Total passes attempted
- `passes_completed`: Passes completed
- `passes_forward`: Forward passes
- `passes_backward`: Backward passes
- `long_balls`: Long balls attempted
- `crosses`: Crosses attempted
- `crosses_accurate`: Accurate crosses
- `through_balls`: Through balls attempted
- `tackles`: Total tackles
- `tackles_won`: Tackles won
- `interceptions`: Interceptions
- `clearances`: Clearances
- `blocks`: Blocks
- `duels_won`: Duels won
- `duels_lost`: Duels lost
- `aerials_won`: Aerial duels won
- `aerials_lost`: Aerial duels lost
- `fouls_committed`: Fouls committed
- `fouls_won`: Fouls won
- `yellow_cards`: Yellow cards received
- `red_cards`: Red cards received
- `offsides`: Offsides
- `corners`: Corners won
- `corners_conceded`: Corners conceded
- `penalties_scored`: Penalties scored
- `penalties_missed`: Penalties missed
- `penalties_conceded`: Penalties conceded
- `saves`: Saves made
- `big_chances_created`: Big chances created
- `big_chances_missed`: Big chances missed
- `expected_goals`: Expected goals (xG)
- `expected_assists`: Expected assists (xA)
- `expected_goals_conceded`: Expected goals conceded (xGC)
- `touches`: Total touches
- `touches_opp_box`: Touches in opponent box
- `distance_covered`: Distance covered (meters)
- `sprints`: Number of sprints
- `final_third_entries`: Final third entries
- `penalty_area_entries`: Penalty area entries

**Indexes**: Primary key index on `id`

**Notes**:
- Contains 20 rows (one per Premier League team)
- `team_id` used as foreign key in other tables
- Stats are typically cumulative for the season

**Sample Row**:
```sql
id: 1
team_id: 14
name: 'Liverpool'
abbr: 'LIV'
stadium: 'Anfield'
```

---

### 6. weeklystandings

Stores historical standings by gameweek, allowing tracking of table progression.

**Composite Primary Key**: (`gameweek`, `team_name`)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `gameweek` | INTEGER | NOT NULL | Gameweek number (1-38) (Part of PRIMARY KEY) |
| `team_name` | VARCHAR(255) | NOT NULL | Team name (Part of PRIMARY KEY) |
| `played` | INTEGER | YES | Matches played up to this gameweek |
| `won` | INTEGER | YES | Matches won |
| `drawn` | INTEGER | YES | Matches drawn |
| `lost` | INTEGER | YES | Matches lost |
| `goals_for` | INTEGER | YES | Goals scored |
| `goals_against` | INTEGER | YES | Goals conceded |
| `goal_difference` | INTEGER | YES | Goal difference |
| `points` | INTEGER | YES | Total points |

**Indexes**: 
- Primary key composite index on (`gameweek`, `team_name`)
- Consider adding index on `gameweek` for range queries
- Consider adding index on `team_name` for team-specific queries

**Notes**:
- Contains up to 760 rows per complete season (38 gameweeks × 20 teams)
- Allows historical analysis and visualization of table progression
- Each row represents a team's cumulative stats up to that gameweek
- Used to create line charts showing position changes over time

**Sample Rows**:
```sql
gameweek: 1, team_name: 'Liverpool', played: 1, won: 1, points: 3
gameweek: 2, team_name: 'Liverpool', played: 2, won: 2, points: 6
gameweek: 3, team_name: 'Liverpool', played: 3, won: 2, drawn: 1, points: 7
```

---

## Relationships

### Entity Relationship Diagram

```
teams (1) ─────< (M) players
  │
  │
  └─────< fixtures (home_team_id, away_team_id)
           │
           │
           └─────< completedfixtures (match_id FK)

standings ←───── (derived from completedfixtures)
weeklystandings ←─ (derived from completedfixtures + gameweek)
```

### Foreign Key Relationships

1. **players.team_id** → **teams.team_id**
   - Each player belongs to one team
   - Team can have multiple players

2. **fixtures.home_team_id** → **teams.team_id**
   - Each fixture has a home team

3. **fixtures.away_team_id** → **teams.team_id**
   - Each fixture has an away team

4. **completedfixtures.match_id** → **fixtures.match_id** (logical)
   - Completed fixtures reference the original fixture
   - Adds score, events, and statistics to the base fixture data

---

## Data Flow

1. **Fixtures** are loaded at the start of the season (all 380 matches)
2. **Teams** and **Players** are populated with current season data
3. As matches complete:
   - Results are added to **completedfixtures** with full statistics
   - **standings** table is recalculated
   - **weeklystandings** is updated with new gameweek data
4. Player stats in **players** table are updated incrementally

---

## Indexes and Performance

### Existing Indexes
- Primary key indexes on all tables with PRIMARY KEY constraints

### Recommended Additional Indexes

```sql
-- For fixture queries
CREATE INDEX idx_fixtures_gameweek ON fixtures(gameweek);
CREATE INDEX idx_fixtures_kickoff ON fixtures(kickoff_time);

-- For completed fixtures queries
CREATE INDEX idx_completedfixtures_gameweek ON completedfixtures(gameweek);
CREATE INDEX idx_completedfixtures_home_team ON completedfixtures(home_team_id);
CREATE INDEX idx_completedfixtures_away_team ON completedfixtures(away_team_id);

-- For player queries
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_position ON players(position);

-- For standings
CREATE INDEX idx_standings_teamname ON standings(teamname);
CREATE INDEX idx_standings_points ON standings(points DESC);

-- For weekly standings
CREATE INDEX idx_weeklystandings_gameweek ON weeklystandings(gameweek);
CREATE INDEX idx_weeklystandings_team ON weeklystandings(team_name);
```

---

## Data Types and Constraints

### Common Patterns

1. **IDs**: INTEGER (signed 32-bit)
   - Range: -2,147,483,648 to 2,147,483,647
   - Used for all entity identifiers

2. **Names**: VARCHAR(255)
   - Team names, player names, venues
   - Maximum 255 characters

3. **Abbreviations**: VARCHAR(10)
   - Team abbreviations (typically 3 characters)

4. **Timestamps**: TIMESTAMP WITH TIME ZONE
   - All kickoff times stored with timezone information
   - Allows proper conversion for different regions

5. **Statistics**: JSONB
   - Flexible schema for evolving statistics
   - Indexed automatically for fast queries
   - Supports nested structures

---

## JSONB Advantages

The schema extensively uses JSONB for:
- **Flexibility**: Statistics can be added without schema changes
- **Performance**: Binary format with indexing support
- **Queries**: Can query nested fields efficiently
- **Storage**: Compressed binary format

Example JSONB queries:
```sql
-- Get players with more than 10 goals
SELECT player_name FROM players 
WHERE (fpl_stats->>'total_points')::int > 100;

-- Get high possession matches
SELECT match_id, home_team_name 
FROM completedfixtures 
WHERE (home_stats->>'possessionPercentage')::float > 60;

-- Find all goals in a match
SELECT match_id, 
       jsonb_array_length(events->'homeTeam'->'goals') as home_goals,
       jsonb_array_length(events->'awayTeam'->'goals') as away_goals
FROM completedfixtures;
```

---

## Storage Estimates

Based on a full Premier League season:

| Table | Rows | Avg Row Size | Total Size |
|-------|------|--------------|------------|
| fixtures | 380 | ~200 bytes | ~76 KB |
| completedfixtures | 380 | ~50 KB | ~19 MB |
| teams | 20 | ~2 KB | ~40 KB |
| players | ~500 | ~2 KB | ~1 MB |
| standings | 20 | ~500 bytes | ~10 KB |
| weeklystandings | 760 | ~100 bytes | ~76 KB |
| **TOTAL** | | | **~20 MB** |

*Note: Estimates based on current data structure. Actual size depends on JSONB content.*

---

## Backup and Maintenance

### Recommended Maintenance Tasks

1. **Weekly VACUUM**: Keep JSONB columns optimized
```sql
VACUUM ANALYZE completedfixtures;
VACUUM ANALYZE players;
```

2. **Rebuild Indexes**: After bulk updates
```sql
REINDEX TABLE completedfixtures;
```

3. **Update Statistics**: Before complex queries
```sql
ANALYZE;
```

### Backup Strategy

```bash
# Full database backup
pg_dump -h localhost -U postgres -d epl -F c -b -v -f epl_backup.dump

# Schema only backup
pg_dump -h localhost -U postgres -d epl -s -f epl_schema.sql

# Specific table backup
pg_dump -h localhost -U postgres -d epl -t completedfixtures -F c -f fixtures.dump
```

---

## Version Information

- **PostgreSQL Version**: 17.6+ (Dumped from 17.6, compatible with 17.7)
- **Encoding**: UTF8
- **Locale**: Default system locale
- **Owner**: postgres

---

## Notes

1. All TIMESTAMP fields should include timezone information
2. JSONB columns are validated on insert but schema is flexible
3. The schema supports multiple seasons by adding a `season` column if needed
4. Consider partitioning `weeklystandings` by season for multi-year data
5. Regular VACUUM operations recommended due to frequent JSONB updates
6. GIN indexes on JSONB columns can improve query performance for specific use cases
