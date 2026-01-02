import psycopg2
import json
from db.dbConn import dbConnections
from utils.logger import Logger

db = dbConnections()
logger = Logger(__name__).get()

class uploadDb:
    def __init__(self):
        self.conn = db.connect_db()
    
    def uploadTeamsData(self, teams_data):
        logger.info(f"Attempting to upload {len(teams_data)} team records.")
        if not self.conn:
            logger.error("No database connection. Skipping teams data upload.")
            return
        cursor = self.conn.cursor()
        try:
            for team in teams_data:
                cursor.execute("""
                    INSERT INTO teams (id, name, short_name, abbr, stadium, fpl_id, fpl_data, stats)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        short_name = EXCLUDED.short_name,
                        abbr = EXCLUDED.abbr,
                        stadium = EXCLUDED.stadium,
                        fpl_id = EXCLUDED.fpl_id,
                        fpl_data = EXCLUDED.fpl_data,
                        stats = EXCLUDED.stats;
                """, (
                    team['id'], team['name'], team['short_name'], team['abbr'], team['stadium'], team['fplID'], json.dumps(team['fplData']), json.dumps(team['stats'])
                ))
            self.conn.commit()
            logger.info(f"Successfully uploaded {len(teams_data)} team records.")
        except psycopg2.Error as e:
            logger.error(f"Error uploading teams data: {e}")
            self.conn.rollback()
    
    def upload_completed_fixtures_data(self, matches_data):
        logger.info(f"Attempting to upload {len(matches_data)} completed match records.")
        if not self.conn:
            logger.error("No database connection. Skipping completed fixtures data upload.")
            return
        cursor = self.conn.cursor()
        try:
            for match in matches_data:
                cursor.execute("""
                    INSERT INTO completedFixtures (
                        match_id, kickoff_timezone, kickoff_time, home_team_id, home_team_name, home_team_abbr,
                        home_team_score, home_team_redcard, away_team_id, away_team_name, away_team_abbr,
                        away_team_score, away_team_redcard, gameweek, venue, events, home_stats, away_stats,
                        home_team_lineup, away_team_lineup, match_report
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (match_id) DO UPDATE SET
                        kickoff_timezone = EXCLUDED.kickoff_timezone,
                        kickoff_time = EXCLUDED.kickoff_time,
                        home_team_id = EXCLUDED.home_team_id,
                        home_team_name = EXCLUDED.home_team_name,
                        home_team_abbr = EXCLUDED.home_team_abbr,
                        home_team_score = EXCLUDED.home_team_score,
                        home_team_redcard = EXCLUDED.home_team_redcard,
                        away_team_id = EXCLUDED.away_team_id,
                        away_team_name = EXCLUDED.away_team_name,
                        away_team_abbr = EXCLUDED.away_team_abbr,
                        away_team_score = EXCLUDED.away_team_score,
                        away_team_redcard = EXCLUDED.away_team_redcard,
                        gameweek = EXCLUDED.gameweek,
                        venue = EXCLUDED.venue,
                        events = EXCLUDED.events,
                        home_stats = EXCLUDED.home_stats,
                        away_stats = EXCLUDED.away_stats,
                        home_team_lineup = EXCLUDED.home_team_lineup,
                        away_team_lineup = EXCLUDED.away_team_lineup,
                        match_report = EXCLUDED.match_report;
                """, (
                    match['matchId'], match['kickoffTimezone'], match['kickoffTime'],
                    match['homeTeamId'], match['homeTeamName'], match['homeTeamAbbr'],
                    match['homeTeamScore'], match['homeTeamRedcard'],
                    match['awayTeamId'], match['awayTeamName'], match['awayTeamAbbr'],
                    match['awayTeamScore'], match['awayTeamRedcard'],
                    match['gameweek'], match['venue'], json.dumps(match['events']), 
                    json.dumps(match['homeStats']), json.dumps(match['awayStats']),
                    json.dumps(match['homeTeamLineup']), json.dumps(match['awayTeamLineup']),
                    match['matchReport']
                ))
            self.conn.commit()
            logger.info(f"Successfully uploaded {len(matches_data)} completed match records.")
        except psycopg2.Error as e:
            logger.error(f"Error uploading completed fixtures data: {e}")
            self.conn.rollback()



    def upload_player_data(self, player_data):
        logger.info(f"Attempting to upload {len(player_data)} player records.")
        if not self.conn:
            logger.error("No database connection. Skipping player data upload.")
            return
        cursor = self.conn.cursor()
        try:
            for player in player_data:
                cursor.execute("""
                    INSERT INTO players (
                        player_id, player_name, position, first_name, last_name, team_id, team_name, team_short_name,
                        country, dob, height, weight, preferred_foot, shirt_num, stats, fpl_id, fpl_stats
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (player_id) DO UPDATE SET
                        player_name = EXCLUDED.player_name,
                        position = EXCLUDED.position,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        team_id = EXCLUDED.team_id,
                        team_name = EXCLUDED.team_name,
                        team_short_name = EXCLUDED.team_short_name,
                        country = EXCLUDED.country,
                        dob = EXCLUDED.dob,
                        height = EXCLUDED.height,
                        weight = EXCLUDED.weight,
                        preferred_foot = EXCLUDED.preferred_foot,
                        shirt_num = EXCLUDED.shirt_num,
                        stats = EXCLUDED.stats,
                        fpl_id = EXCLUDED.fpl_id,
                        fpl_stats = EXCLUDED.fpl_stats;
                """, (
                    player['playerId'], player['playerName'], player['position'], player['firstName'], player['lastName'],
                    player['teamId'], player['teamName'], player['teamShortName'], player['country'], player['dob'],
                    player['height'], player['weight'], player['preferredFoot'], player['shirtNum'], json.dumps(player['stats']),
                    player.get('fplID'), json.dumps(player.get('fplStats'))
                ))
            self.conn.commit()
            logger.info(f"Successfully uploaded {len(player_data)} player records.")
        except psycopg2.Error as e:
            logger.error(f"Error uploading player data: {e}")
            self.conn.rollback()
    
    def upload_fixture_data(self, schedule_data):
        logger.info(f"Attempting to upload {len(schedule_data)} schedule records.")
        if not self.conn:
            logger.error("No database connection. Skipping schedule data upload.")
            return
        cursor = self.conn.cursor()
        try:
            for fixture in schedule_data:
                cursor.execute("""
                    INSERT INTO fixtures (
                        match_id, kickoff_timezone, kickoff_time, home_team_id, home_team_name, home_team_abbr,
                        away_team_id, away_team_name, away_team_abbr, gameweek, venue
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (match_id) DO UPDATE SET
                        kickoff_timezone = EXCLUDED.kickoff_timezone,
                        kickoff_time = EXCLUDED.kickoff_time,
                        home_team_id = EXCLUDED.home_team_id,
                        home_team_name = EXCLUDED.home_team_name,
                        home_team_abbr = EXCLUDED.home_team_abbr,
                        away_team_id = EXCLUDED.away_team_id,
                        away_team_name = EXCLUDED.away_team_name,
                        away_team_abbr = EXCLUDED.away_team_abbr,
                        gameweek = EXCLUDED.gameweek,
                        venue = EXCLUDED.venue;
                """, (
                    fixture['matchId'], fixture['kickoffTimezone'], fixture['kickoffTime'],
                    fixture['homeTeamId'], fixture['homeTeamName'], fixture['homeTeamAbbr'],
                    fixture['awayTeamId'], fixture['awayTeamName'], fixture['awayTeamAbbr'],
                    fixture['gameweek'], fixture['venue']
                ))
            self.conn.commit()
            logger.info(f"Successfully uploaded {len(schedule_data)} schedule records.")
        except psycopg2.Error as e:
            logger.error(f"Error uploading schedule data: {e}")
            self.conn.rollback()

    def updateStandings(self, standings_list):
        """
        Updates the entire standings table with the latest data from the API.
        Returns:
            bool: True if successful, False otherwise.
        """
        logger.info(f"Attempting to upload {len(standings_list)} standings records.")
        if not self.conn:
            logger.error("No database connection. Skipping standings data upload.")
            return
        cursor = self.conn.cursor()
        try:
            # Delete all existing standings data
            cursor.execute("DELETE FROM standings;")
            logger.info("Cleared existing standings data")
            
            # Insert all new standings data
            for team_standing in standings_list:
                cursor.execute("""
                    INSERT INTO standings (
                        teamName, teamId, teamAbbr, shortName, position, played, won, drawn, lost,
                        goalsFor, goalsAgainst, goalDifference, points, home, away
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    team_standing['teamName'],
                    team_standing['teamId'],
                    team_standing['teamAbbr'],
                    team_standing['shortName'],
                    team_standing['position'],
                    team_standing['played'],
                    team_standing['won'],
                    team_standing['drawn'],
                    team_standing['lost'],
                    team_standing['goalsFor'],
                    team_standing['goalsAgainst'],
                    team_standing['goalDifference'],
                    team_standing['points'],
                    json.dumps(team_standing['home']),
                    json.dumps(team_standing['away'])
                ))
            
            self.conn.commit()
            logger.info(f"Successfully updated standings table with {len(standings_list)} teams")
        except Exception as e:
            logger.error(f"Error updating standings table: {e}")
            self.conn.rollback()