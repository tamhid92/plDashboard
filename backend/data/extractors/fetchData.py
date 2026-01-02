from utils.logger import Logger
from db.dbConn import dbConnections
from bs4 import BeautifulSoup
import time
import requests
import json

logger = Logger(__name__).get()
API_BASE = "https://sdp-prem-prod.premier-league-prod.pulselive.com/api"
FPL_URL = "https://fantasy.premierleague.com/api/bootstrap-static/"


def extract_side_stats(stats_data, side):
    """
    Fetches match statistics for a given match ID.
    Args:
        list: stats_data: The statistics data from the API.
        str: side: 'home' or 'away' to specify which side's stats to extract.
    Returns:
        dict: A dictionary containing match statistics.
    """
    if stats_data:
        for stat in stats_data:
            if stat['side'].lower() == side:
                return stat['stats']
            else:
                pass
    else:
        logger.warning(f"No stats data found.")
        return {}

def getFantansyData():
    logger.info("Fetching Fantasy Premier League data")
    try:
        response = requests.get(FPL_URL)
        response.raise_for_status()
        fpl_data = response.json()
        logger.info("Successfully fetched Fantasy Premier League data")
        return fpl_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Fantasy Premier League data: {e}")
        return {}

def getFPLPlayerStats(playerId, fpl_data):
    """
    Fetches player statistics from Fantasy Premier League data.
    Args:
        int: playerId: The ID of the player.
        dict: fpl_data: The Fantasy Premier League data.
    Returns:
        tuple: A dictionary containing player statistics and the player ID.
    """
    elements = fpl_data.get('elements', [])
    for player in elements:
        if player['code'] == int(playerId):
            return player, player['id']
    logger.warning(f"No FPL data found for player ID: {playerId}")
    return {}, None

def getFPLTeamData(teamId, fpl_data):
    """
    Fetches team statistics from Fantasy Premier League data.
    Args:
        int: teamId: The ID of the team.
        dict: fpl_data: The Fantasy Premier League data.
    Returns:
        tuple: A dictionary containing team statistics and the team ID.
    """
    teams = fpl_data.get('teams', [])
    for team in teams:
        if team['code'] == int(teamId):
            return team, team['id']
    logger.warning(f"No FPL data found for team ID: {teamId}")
    return {}, None

def getTeamStats(teamID):
    """
    Fetches detailed statistics for a specific team by team ID.
    Args:
        int: teamID: The ID of the team.
    Returns:
        dict: A dictionary containing team statistics.
    """
    logger.info(f"Fetching team stats for team ID: {teamID}")
    time.sleep(0.2)
    team_stats_url = f"{API_BASE}/v2/competitions/8/seasons/2025/teams/{teamID}/stats"
    try:
        response = requests.get(team_stats_url)
        response.raise_for_status()
        data = response.json()
        logger.info(f"Successfully fetched stats for team ID: {teamID}")
        return data['stats']
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching team stats for team ID {teamID}: {e}")
        return {}
    
def getMatchEvents(matchId):
    """
    Fetches match events for a given match ID.
    Args:
        int: matchId: The ID of the match.
    Returns:
        dict: A dictionary containing match events for both teams.
    """
    time.sleep(0.2)
    logger.info(f"Fetching match events for match ID: {matchId}")
    events_url = f"{API_BASE}/v1/matches/{matchId}/events"
    try:
        response = requests.get(events_url)
        response.raise_for_status() # Raise an exception for HTTP errors
        events_data = response.json()
        events_dict = {
            'awayTeam': events_data['awayTeam'],
            'homeTeam': events_data['homeTeam']
        }
        return events_dict
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching events for match ID {matchId}: {e}")
        return None
    
def getSquad(teamId):
    """
    Fetches squad details for a given team ID.
    Args:
        int: teamId: The ID of the team.
    Returns:
        list: A list of player IDs for the team.
    """
    cursor = dbConnections().connect_db().cursor()
    cursor.execute("""
        SELECT player_id FROM players
        WHERE team_id = %s AND shirt_num IS NOT NULL;
    """, (teamId,))
    players = cursor.fetchall()
    playerIds = [player[0] for player in players]
    return playerIds

def getPlayerStats(playerId, playerDict):
    """
    Fetches player statistics for a given player ID.
    Args:
        playerId (int): The ID of the player.
        playerDict (dict): A dictionary containing player metadata including 'id'.
    Returns:
        dict: A dictionary containing player statistics.
    """
    return playerDict.get(playerId, {})

def getAllPlayerStats():
    """
    Fetches all player statistics from the API.
    Returns:
        list: A list of player entries containing playerMetadata and stats.
    """
    logger.info("Fetching all player statistics...")
    all_player_stats = []
    player_url = f"{API_BASE}/v3/competitions/8/seasons/2025/players/stats/leaderboard?_limit=100"

    while player_url:
        try:
            response = requests.get(player_url)
            response.raise_for_status()
            data = response.json()
            all_player_stats.extend(data['data'])

            next_page_token = data['pagination']['_next']
            if next_page_token:
                player_url = f"{API_BASE}/v3/competitions/8/seasons/2025/players/stats/leaderboard?_limit=100&_next={next_page_token}"
            else:
                player_url = None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching player stats from {player_url}: {e}")
            player_url = None
    logger.info(f"Fetched {len(all_player_stats)} player statistic records.")
    return all_player_stats

def getAllTeamsBasicData():
    """
    Fetches basic data for all Premier League teams.
    Returns:
        list: A list of dictionaries containing basic team data.
    """
    logger.info("Initiating basic team data extraction...")
    teams = []
    pl_teams_url = f"{API_BASE}/v1/competitions/8/seasons/2025/teams?_limit=60"
    try:
        response = requests.get(pl_teams_url)
        response.raise_for_status()
        data = response.json()['data']

        for team in data:
            team_data = {
                'id' : team['id'],
                'name' : team['name'],
                'short_name' : team['shortName'],
                'abbr' : team['abbr'],
                'stadium' : team['stadium']['name']
            }
            teams.append(team_data)
        logger.info(f"Fetched basic data for {len(teams)} teams.")
        return teams
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Premier League teams data: {e}")
        return []

def getAdditionalPlayerData():
    """
    Fetches additional player data such as country, date of birth, height, weight, preferred foot, and shirt number.
    Returns:
        dict: A dictionary with player IDs as keys and their additional data as values.
    """
    logger.info("Fetching additional player data...")
    teams = getAllTeamsBasicData()
    add_player_data = {}
    for team in teams:
        squad_url = f"{API_BASE}/v2/competitions/8/seasons/2025/teams/{team['id']}/squad"
        try:
            response = requests.get(squad_url)
            response.raise_for_status()
            squad_data = response.json()
            time.sleep(0.2)
            for player in squad_data['players']:
                data = {
                    player['id'] : {
                        'country' : player.get('countryOfBirth'),
                        'dob' : player['dates'].get('birth'),
                        'height' : player.get('height'),
                        'weight' : player.get('weight'),
                        'preferredFoot' : player.get('preferredFoot'),
                        'shirtNum' : player.get('shirtNum')
                    }
                }
                add_player_data.update(data)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching squad data for team ID {team['id']}: {e}")
    logger.info(f"Fetched additional data for {len(add_player_data)} players.")
    return add_player_data

def fetchLineups(matchID):
    lineups_url = f"https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v1/matches/{matchID}/lineups"
    response = requests.get(lineups_url).json()

    resp = []

    for i in response:
        lineup = []
        players = []
        subs = []

        for player in i['players']:
            players.append(player['id'])
            if player['id'] in i['subs']:
                subs.append(player['id'])

        for positions in i['lineup']:
            lineup.append(positions)

        data = {
            "teamId" : i['teamId'],
            "lineup" : lineup,
            "players" : players,
            "subs" : subs,
            "formation" : i['formation'],
        }

        resp.append(data)

    return resp

def getLineupSide(lineups, teamId):
    for lineup in lineups:
        if int(lineup['teamId']) == int(teamId):
            return lineup
    return None

def fetchMatchReport(matchID):
    time.sleep(0.2)
    logger.info(f"Fetching match report for match ID {matchID}")
    match_report_url = f"https://api.premierleague.com/content/premierleague/TEXT/en?references=SDP_FOOTBALL_MATCH%3A{matchID}&tagNames=Match%20Report"

    try:
        match_report_resp = requests.get(match_report_url).json()
        soup = BeautifulSoup(match_report_resp['content'][0]['body'], features="html.parser")
        match_report = soup.get_text(separator=' ', strip=False).strip().split("\n Club reports \n")[0]

        return match_report
    except Exception as e:
        logger.error(f"Error fetching match report for match ID {matchID}: {e}")
        return ""

class fetchData:
    def __init__(self):
        self.API_BASE = API_BASE
        self.db = dbConnections()
        self.conn = self.db.connect_db()
        self.logger = logger
        self.fpl_data = getFantansyData()

    # INIT METHODS
    def init_FetchFixtures(self):
        """
        Fetches initial fixture data from the API to seed the database.
        Returns:
            Tuple containing:
                - List of completed fixtures
                - List of fixture events
        """
        logger.info("Initiating fixture data extraction and transformation...")
        completed_fixtures = []
        fixtures = []
        matches_url = f"{self.API_BASE}/v2/matches?competition=8&season=2025&_limit=100"
        while matches_url:
            try:
                response = requests.get(matches_url)
                response.raise_for_status()
                data = response.json()
                for game in data['data']:
                    fixture_data = {
                        'matchId': game['matchId'],
                        'kickoffTimezone': game['kickoffTimezoneString'],
                        'kickoffTime': game['kickoff'],
                        'homeTeamId': game['homeTeam']['id'],
                        'homeTeamName': game['homeTeam']['name'],
                        'homeTeamAbbr': game['homeTeam']['abbr'],
                        'awayTeamId': game['awayTeam']['id'],
                        'awayTeamName': game['awayTeam']['name'],
                        'awayTeamAbbr': game['awayTeam']['abbr'],
                        'gameweek': game['matchWeek'],
                        'venue': game['ground']
                    }
                    fixtures.append(fixture_data)
                    if game['period'] != 'PreMatch':
                        match_events = getMatchEvents(game['matchId'])
                        match_stats_url = f"{self.API_BASE}/v3/matches/{game['matchId']}/stats"
                        match_stats_response = requests.get(match_stats_url).json()
                        lineups = fetchLineups(game['matchId'])
                        home_lineup = getLineupSide(lineups, game['homeTeam']['id'])
                        away_lineup = getLineupSide(lineups, game['awayTeam']['id'])
                        home_stats = extract_side_stats(match_stats_response, 'home')
                        away_stats = extract_side_stats(match_stats_response, 'away')
                        match_report = fetchMatchReport(game['matchId'])
                        game_data = {
                            'matchId': game['matchId'],
                            'kickoffTimezone': game['kickoffTimezoneString'],
                            'kickoffTime': game['kickoff'],
                            'homeTeamId': game['homeTeam']['id'],
                            'homeTeamName': game['homeTeam']['name'],
                            'homeTeamAbbr': game['homeTeam']['abbr'],
                            'homeTeamScore': game['homeTeam']['score'],
                            'homeTeamRedcard': game['homeTeam']['redCards'],
                            'awayTeamId': game['awayTeam']['id'],
                            'awayTeamName': game['awayTeam']['name'],
                            'awayTeamAbbr': game['awayTeam']['abbr'],
                            'awayTeamScore': game['awayTeam']['score'],
                            'awayTeamRedcard': game['awayTeam']['redCards'],
                            'gameweek': game['matchWeek'],
                            'venue': game['ground'],
                            'events': match_events,
                            'homeStats': home_stats,
                            'awayStats': away_stats,
                            'homeTeamLineup' : home_lineup,
                            'awayTeamLineup' : away_lineup,
                            'matchReport' : match_report,
                        }
                        completed_fixtures.append(game_data)

                next_page_token = data['pagination']['_next']
                if next_page_token:
                    matches_url = f"https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v2/matches?competition=8&season=2025&_limit=100&_next={next_page_token}"
                else:
                    matches_url = None
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching match data from {matches_url}: {e}")
                matches_url = None
        logger.info(f"Processed {len(fixtures)} total match fixtures, {len(completed_fixtures)} completed fixtures.")
        return completed_fixtures, fixtures

    def init_PlayersData(self):
        logger.info("Getting all player data.")
        all_player_stats_list = getAllPlayerStats()
        add_player_data = getAdditionalPlayerData()
        structured_player_data = []

        # Build stats dict for quick lookup
        stats_dict = {}
        for player in all_player_stats_list:
            if 'playerMetadata' in player:
                player_id = player['playerMetadata']['id']
                stats_dict[player_id] = player.get('stats', None)
        
        for player_entry in all_player_stats_list:
            if 'playerMetadata' not in player_entry:
                logger.warning(f"Skipping player entry without playerMetadata: {player_entry}")
                continue
            
            player_metadata = player_entry['playerMetadata']
            player_id = player_metadata['id']
            player_first_name = player_metadata['firstName']
            player_last_name = player_metadata['lastName']
            player_name = player_metadata['name']
            position = player_metadata['position']

            team_id = None
            team_name = None
            team_short_name = None
            if 'currentTeam' in player_metadata and player_metadata['currentTeam'] is not None:
                team_id = player_metadata['currentTeam'].get('id')
                team_name = player_metadata['currentTeam'].get('name')
                team_short_name = player_metadata['currentTeam'].get('shortName')

            stats_payload = stats_dict.get(player_id, None)
            fpl_stats, fpl_player_id = getFPLPlayerStats(player_id, self.fpl_data)

            current_player_structured_data = {
                'playerId': player_id,
                'playerName': player_name,
                'position': position,
                'firstName': player_first_name,
                'lastName': player_last_name,
                'teamId': team_id,
                'teamName': team_name,
                'teamShortName': team_short_name,
                'country': add_player_data.get(player_id, {}).get('country', None),
                'dob': add_player_data.get(player_id, {}).get('dob', None),
                'height': add_player_data.get(player_id, {}).get('height', None),
                'weight': add_player_data.get(player_id, {}).get('weight', None),
                'preferredFoot': add_player_data.get(player_id, {}).get('preferredFoot', None),
                'shirtNum': add_player_data.get(player_id, {}).get('shirtNum', None),
                'stats': stats_payload,
                'fplID': fpl_player_id,
                'fplStats': fpl_stats
            }
            structured_player_data.append(current_player_structured_data)
        logger.info(f"Collected data for {len(structured_player_data)} players.")
        return structured_player_data

    def init_TeamsData(self):
        """
        Fetches detailed data for all Premier League teams.
        Returns:
            list: A list of dictionaries containing detailed team data.
        """
        logger.info("Initiating team data extraction...")
        teams = []
        pl_teams_url = f"{self.API_BASE}/v1/competitions/8/seasons/2025/teams?_limit=60"
        try:
            response = requests.get(pl_teams_url)
            response.raise_for_status()
            data = response.json()['data']

            for team in data:
                fplData, fplID = getFPLTeamData(team['id'], self.fpl_data)
                team_data = {
                    'id' : team['id'],
                    'name' : team['name'],
                    'short_name' : team['shortName'],
                    'abbr' : team['abbr'],
                    'stadium' : team['stadium']['name'],
                    'fplID' : fplID,
                    'fplData' : fplData
                }
                team_stats = getTeamStats(team['id'])
                team_data['stats'] = team_stats
                teams.append(team_data)
            logger.info(f"Initiated data for {len(teams)} teams.")
            return teams
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Premier League teams data: {e}")
            return []
        
    def init_Standings(self):
        """
        Fetches the current league standings from the API.
        Returns:
            list: A list of dictionaries containing team standings data.
        """
        standings_url = f"{self.API_BASE}/v5/competitions/8/seasons/2025/standings"
        standings = []
        try:
            response = requests.get(standings_url)
            response.raise_for_status()
            standings_data = response.json()
            standings_list = standings_data['tables'][0]['entries']
            logger.info("Successfully fetched league standings.")
            for team in standings_list:
                team_data = {
                    'teamName' : team['team']['name'],
                    'teamId' : team['team']['id'],
                    'teamAbbr' : team['team']['abbr'],
                    'shortName' : team['team']['shortName'],
                    'position' : team['overall']['position'],
                    'played' : team['overall']['played'],
                    'won' : team['overall']['won'],
                    'drawn' : team['overall']['drawn'],
                    'lost' : team['overall']['lost'],
                    'goalsFor' : team['overall']['goalsFor'],
                    'goalsAgainst' : team['overall']['goalsAgainst'],
                    'goalDifference' : int(team['overall']['goalsFor']) - int(team['overall']['goalsAgainst']),
                    'points' : team['overall']['points'],
                    'home' : team['home'],
                    'away' : team['away']
                }
                standings.append(team_data)
            return standings
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching league standings: {e}")
            return []
            
    # UPDATE METHODS
    def recentlyCompletedGames(self):
        """
        Fetches recently completed games from the database.
        Returns:
            list: A list of tuples containing match ID, home team ID, and away team ID.
        """
        logger.info("Fetching recently completed games from the database.")
        if not self.conn:
            logger.error("No database connection. Cannot fetch recently completed games.")
            return []
        cursor = self.conn.cursor()
        try:
            cursor.execute("""
                SELECT match_id, home_team_id, away_team_id FROM fixtures
                WHERE kickoff_time <= NOW() AT TIME ZONE kickoff_timezone
                EXCEPT
                SELECT match_id, home_team_id, away_team_id FROM completedFixtures;
            """)
            games = cursor.fetchall()
            self.logger.info(f"Fetched {len(games)} recently completed games.")
            return games
        except Exception as e:
            self.logger.error(f"Error fetching recently completed games: {e}")
            return []
        
    def getMatchData(self, match_id):
        """
        Fetches fixture data for a given match ID.
        Args:
            match_id (int): The ID of the match.
        Returns:
            dict: A dictionary containing fixture data.
        """
        fixture_url = f"{self.API_BASE}/v2/matches/{match_id}"
        try:
            response = requests.get(fixture_url)
            response.raise_for_status()
            game = response.json()
            if game['period'] != 'PreMatch':
                match_events = getMatchEvents(game['matchId'])
                match_stats_url = f"{self.API_BASE}/v3/matches/{game['matchId']}/stats"
                match_stats_response = requests.get(match_stats_url).json()
                lineups = fetchLineups(game['matchId'])
                home_lineup = getLineupSide(lineups, game['homeTeam']['id'])
                away_lineup = getLineupSide(lineups, game['awayTeam']['id'])
                home_stats = extract_side_stats(match_stats_response, 'home')
                away_stats = extract_side_stats(match_stats_response, 'away')
                match_report = fetchMatchReport(game['matchId'])
                game_data = {
                    'matchId': game['matchId'],
                    'kickoffTimezone': game['kickoffTimezoneString'],
                    'kickoffTime': game['kickoff'],
                    'homeTeamId': game['homeTeam']['id'],
                    'homeTeamName': game['homeTeam']['name'],
                    'homeTeamAbbr': game['homeTeam']['abbr'],
                    'homeTeamScore': game['homeTeam']['score'],
                    'homeTeamRedcard': game['homeTeam']['redCards'],
                    'awayTeamId': game['awayTeam']['id'],
                    'awayTeamName': game['awayTeam']['name'],
                    'awayTeamAbbr': game['awayTeam']['abbr'],
                    'awayTeamScore': game['awayTeam']['score'],
                    'awayTeamRedcard': game['awayTeam']['redCards'],
                    'gameweek': game['matchWeek'],
                    'venue': game['ground'],
                    'events': match_events,
                    'homeStats': home_stats,
                    'awayStats': away_stats,
                    'homeTeamLineup' : home_lineup,
                    'awayTeamLineup' : away_lineup,
                    'matchReport' : match_report
                }
                return game_data
            else:
                self.logger.info(f"Match ID {match_id} is still in PreMatch period. Match not finished yet.")
                return {}
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching fixture data for match ID {match_id}: {e}")
            return {}
        
    def getTeamStats(self, team_id):
        """
        Fetches team data for a given team ID.
        Args:
            team_id (int): The ID of the team.
        Returns:
            dict: A dictionary containing team stats.
        """
        teamStats = getTeamStats(team_id)
        return teamStats
    
    def getStandingsData(self):
        """
        Fetches the current league standings from the API.
        Returns:
            list: A list of dictionaries containing team standings data.
        """
        standings_url = f"{self.API_BASE}/v5/competitions/8/seasons/2025/standings"
        standings = []
        try:
            response = requests.get(standings_url)
            response.raise_for_status()
            standings_data = response.json()
            standings_list = standings_data['tables'][0]['entries']
            logger.info("Successfully fetched league standings.")
            for team in standings_list:
                team_data = {
                    'teamName' : team['team']['name'],
                    'teamId' : team['team']['id'],
                    'teamAbbr' : team['team']['abbr'],
                    'shortName' : team['team']['shortName'],
                    'position' : team['overall']['position'],
                    'played' : team['overall']['played'],
                    'won' : team['overall']['won'],
                    'drawn' : team['overall']['drawn'],
                    'lost' : team['overall']['lost'],
                    'goalsFor' : team['overall']['goalsFor'],
                    'goalsAgainst' : team['overall']['goalsAgainst'],
                    'goalDifference' : int(team['overall']['goalsFor']) - int(team['overall']['goalsAgainst']),
                    'points' : team['overall']['points'],
                    'home' : team['home'],
                    'away' : team['away']
                }
                standings.append(team_data)
            return standings
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching league standings: {e}")
            return []
        
    def getTeamData(self, team_id):
        """
        Fetches the squad details for a given team ID.
        Args:
            team_id (int): The ID of the team.
        Returns:
            dict: A dictionary containing player statistics for the team's squad.
            playerID as key and player stats as value.
        """
        teamData = {}
        squad = getSquad(team_id)
        for playerID in squad:
            logger.info(f"Fetching player ID: {playerID} for team ID: {team_id}")
            player_stats = getPlayerStats(playerID)
            team_data = {
                playerID: player_stats
            }
            teamData.update(team_data)
        return teamData
    
    # def getWeeklyStandingsData(self):
    #     """
    #     Fetches the weekly standings for a given gameweek.
    #     Args:
    #         gameweek (int): The gameweek number.
    #     Returns:
    #         list: A list of dictionaries containing weekly standings data.
    #     """

    def fetchLineups(self, matchId):
        """
        Fetches lineups for a given match ID.
        Args:
            int: matchId: The ID of the match.
        Returns:
            dict: A dictionary containing lineups for both teams.
        """
        time.sleep(0.2)
        logger.info(f"Fetching lineups for match ID: {matchId}")
        lineups_url = f"{API_BASE}/v1/matches/{matchId}/lineups"

