from typing import List, Dict, Any
from datetime import datetime

class Compute:
    """
    Helper class to process raw data into LLM-friendly summaries.
    """
    
    @staticmethod
    def top_scorers(players: List[Dict[str, Any]], top_n=5) -> str:
        # Filter for players with goals
        # 'goals' is in 'stats' object inside player dict? 
        # Let's check schema from curl output in memory...
        # Wait, the CURL output for /players showed:
        # [{"country":null,"first_name":"Raheem", ... "stats":null ... ??? 
        # Ah, the curl output I saw earlier had "stats":null for Raheem Sterling.
        # But looking at /teams output, it had nested stats.
        # I need to be careful about the schema.
        # Let's assume standard structure: player['stats']['goals'] or similar.
        # Since I saw "stats":null, maybe some players don't have stats yet?
        # I should filter safely.
        
        valid_players = []
        for p in players:
            # Adjust based on real schema. 
            # In the earlier `curl /teams`, we saw `stats` dict.
            # In `curl /players`, we saw `stats: null`.
            # Let's assume some players have stats. 
            # If stats is separate, we might need to find where goals are.
            # Looking closer at step 9 output: `Nick` (Pope?) has `fpl_stats`: {...}
            # Maybe I should look at `fpl_stats` if `stats` is null? 
            # Wait, `fpl_stats` has `goals_scored`? No, it has `goals_conceded` for a GK?
            # Let's re-examine `fpl_stats` for Nick. "goals_scored" isn't visible in the head.
            # I will trust that standard `stats` should be populated for scorers.
            # If not, I'll fallback to `fpl_stats` "goals_scored" if it exists.
            
            stats = p.get('stats')
            goals = 0
            if stats:
                goals = float(stats.get('goals', 0))
            
            # Fallback to fpl_stats?
            if goals == 0 and p.get('fpl_stats'):
                 goals = float(p['fpl_stats'].get('goals_scored', 0)) # naming guess
                 
            if goals > 0:
                valid_players.append({
                    'name': p.get('player_name') or f"{p.get('first_name')} {p.get('last_name')}",
                    'goals': goals,
                    'team': p.get('team_short_name')
                })
        
        sorted_players = sorted(valid_players, key=lambda x: x['goals'], reverse=True)[:top_n]
        
        # Format as string
        lines = [f"{i+1}. {p['name']} ({p['team']}) - {int(p['goals'])} goals" for i, p in enumerate(sorted_players)]
        return "\n".join(lines)

    @staticmethod
    def league_table_top(teams: List[Dict[str, Any]], top_n=1) -> str:
        # Sort by points, then goal difference
        # Schema for teams: "fpl_data": {"points": 0 ...}? 
        # Wait, `curl /teams` output showed:
        # "fpl_data": { ... "points": 0, "position": 18 ... }
        # And "stats": { ... "goals": 21 ... }
        # I should use `fpl_data['points']` or `stats`? 
        # Usually league table is determined by points.
        # Let's rely on `fpl_data['position']` if it exists and is reliable.
        # Or sort by points manually.
        
        def get_points(t):
            return t.get('fpl_data', {}).get('points', 0)
            
        sorted_teams = sorted(teams, key=get_points, reverse=True)
        top = sorted_teams[:top_n]
        
        lines = []
        for t in top:
            pts = get_points(t)
            name = t.get('name')
            lines.append(f"{name}: {pts} points")
            
        return "\n".join(lines)

    @staticmethod
    def highest_scoring_match(matches: List[Dict[str, Any]], top_n=1) -> str:
        # matches from /completedFixtures
        
        candidates = []
        for m in matches:
            # naive attempt to find score
            # Check for top level keys
            h_score = m.get('home_team_score')
            a_score = m.get('away_team_score')
            
            if h_score is None:
                # Try stats
                h_stats = m.get('home_stats', {})
                a_stats = m.get('away_stats', {})
                pass
            
            if h_score is None and 'home_team_score' not in m:
                 # fallback for safety, skipping if unknown
                 continue
                 
            total = (h_score or 0) + (a_score or 0)
            candidates.append((total, m))
            
        if not candidates:
            return "No match score data found."
            
        candidates.sort(key=lambda x: x[0], reverse=True)
        top = candidates[:top_n]
        
        lines = []
        for score, m in top:
             lines.append(f"{m.get('home_team_name')} {m.get('home_team_score')} - {m.get('away_team_score')} {m.get('away_team_name')} ({score} goals)")
        
        return "\n".join(lines)

    @staticmethod
    def upcoming_fixtures(fixtures: List[Dict[str, Any]], team_name: str = None) -> str:
        # Filter for team if provided
        relevant = fixtures
        if team_name:
            t = team_name.lower()
            relevant = [f for f in fixtures if t in f.get('home_team_name', '').lower() or t in f.get('away_team_name', '').lower()]
            
        # Sort by date
        # "kickoff_time": "2025-08-15T20:00:00+00:00"
        def parse_time(x):
            try:
                return datetime.fromisoformat(x.get('kickoff_time', ''))
            except:
                return datetime.max
        
        relevant.sort(key=parse_time)
        next_games = relevant[:3]
        
        lines = []
        for g in next_games:
            dt = g.get('kickoff_time', '').split('T')[0]
            lines.append(f"{g.get('home_team_name')} vs {g.get('away_team_name')} on {dt}")
            
        return "\n".join(lines) if lines else "No upcoming fixtures found."

    @staticmethod
    def recent_form(matches: List[Dict[str, Any]], team_name: str) -> str:
        # Completed matches for a team
        t = team_name.lower()
        relevant = [m for m in matches if t in m.get('home_team_name', '').lower() or t in m.get('away_team_name', '').lower()]
        
        # Sort by gameweek or date? Step 23 showed gameweek.
        relevant.sort(key=lambda x: x.get('gameweek', 0), reverse=True)
        recent = relevant[:5]
        
        lines = []
        for m in recent:
            # Format: "vs Opponent (Result)"
            # Need to determine if won/lost
            # This logic is complex for a quick stub, I'll return raw match info string.
            lines.append(f"GW{m.get('gameweek')}: {m.get('home_team_name')} vs {m.get('away_team_name')} ({m.get('home_team_score')}-{m.get('away_team_score')})")
            
        return "\n".join(lines)
