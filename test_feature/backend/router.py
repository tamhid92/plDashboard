from enum import Enum
import re
from typing import List, Optional

class Intent(str, Enum):
    TEAMS = "TEAMS"
    PLAYERS = "PLAYERS"
    MATCHES = "MATCHES"
    SCHEDULE = "SCHEDULE"
    UNKNOWN = "UNKNOWN"

class Router:
    """
    Simple keyword/regex based router for the POC.
    """
    
    def classify(self, query: str) -> Intent:
        query = query.lower()
        
        # Players: "scorer", "assists", "player", "performing", "haaland", "salah"
        if any(w in query for w in ["scorer", "goal", "assist", "player", "who is", "show me the top"]):
             # "who is top of the league" is a team question, but "show me the top 5 scorers" is players.
             # "who is top" can be tricky.
             pass

        # Teams: "league", "table", "standings", "compare", "city", "united", "arsenal", "liverpool"
        # Matches: "result", "score", "match", "game", "highest scoring"
        # Schedule: "next match", "upcoming", "when is"
        
        # Heuristics (Order matters)
        
        if "next match" in query or "upcoming" in query or "when is" in query:
            return Intent.SCHEDULE
            
        if "league" in query or "table" in query or "standings" in query or "position" in query:
            return Intent.TEAMS
            
        if "scorer" in query or "assist" in query:
            return Intent.PLAYERS
            
        if "highest scoring" in query or "result" in query or "played" in query or "last match" in query or "recently" in query:
            # "How has Arsenal been performing recently?" -> Matches/CompletedFixtures
            return Intent.MATCHES

        if "goals" in query and ("match" in query or "game" in query):
             return Intent.MATCHES
            
        # Specific patterns
        if "compare" in query and "team" in query:
             return Intent.TEAMS
        if "compare" in query:
             # Default to teams if comparing entities found in teams list, but simplistic for now
             return Intent.TEAMS

        # Fallback based on entities? 
        # For POC, defaults:
        if "player" in query: return Intent.PLAYERS
        if "team" in query: return Intent.TEAMS
        
        return Intent.UNKNOWN
