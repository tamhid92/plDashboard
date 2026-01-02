from db.dbConn import dbConnections
from utils.logger import Logger

logger = Logger(__name__).get()

# Lazy initialization - defer connection until functions are called
def _get_cursor():
    db = dbConnections()
    conn = db.connect_db()
    if not conn:
        raise ConnectionError("Failed to connect to database")
    return conn.cursor(), conn

def get_current_gameweek():
    """
    Retrieve the current gameweek from the plDashboard database.
    Returns:
        int: The current gameweek number.
    """
    logger.info("Retrieving current gameweek from the database...")
    try:
        cursor, conn = _get_cursor()
        cursor.execute("SELECT MAX(gameweek) FROM completedFixtures;")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        current_gameweek = result[0] if result[0] is not None else 0
        logger.info(f"Current gameweek retrieved: {current_gameweek}")
        return current_gameweek
    except Exception as e:
        logger.error(f"Error retrieving current gameweek: {e}")
        return 0

def get_all_teams():
    """
    Retrieve all unique teams from the completed fixtures.
    Returns:
        list: A list of dictionaries containing team information.
    """
    logger.info("Retrieving all teams from completed fixtures...")
    try:
        cursor, conn = _get_cursor()
        cursor.execute("""
            SELECT DISTINCT home_team_id, home_team_name, home_team_abbr
            FROM completedFixtures
            UNION
            SELECT DISTINCT away_team_id, away_team_name, away_team_abbr
            FROM completedFixtures
            ORDER BY home_team_name;
        """)
        teams = []
        for row in cursor.fetchall():
            teams.append({
                'id': row[0],
                'name': row[1],
                'abbr': row[2]
            })
        cursor.close()
        conn.close()
        logger.info(f"Retrieved {len(teams)} teams.")
        return teams
    except Exception as e:
        logger.error(f"Error retrieving teams: {e}")
        return []

def calculate_standings_for_gameweek(gameweek):
    """
    Calculate standings for all teams up to and including the specified gameweek.
    Args:
        gameweek (int): The gameweek to calculate standings for.
    Returns:
        list: A list of dictionaries containing team standings.
    """
    logger.info(f"Calculating standings for gameweek {gameweek}...")
    cursor, conn = _get_cursor()
    teams = get_all_teams()
    standings = []
    
    for team in teams:
        team_id = team['id']
        team_name = team['name']
        team_abbr = team['abbr']
        
        played = 0
        won = 0
        drawn = 0
        lost = 0
        goals_for = 0
        goals_against = 0
        points = 0
        
        cursor.execute("""
            SELECT home_team_id, away_team_id, home_team_score, away_team_score
            FROM completedFixtures
            WHERE gameweek <= %s
            AND (home_team_id = %s OR away_team_id = %s)
            ORDER BY gameweek;
        """, (gameweek, team_id, team_id))
        
        matches = cursor.fetchall()
        
        for match in matches:
            home_id, away_id, home_score, away_score = match
            played += 1
            
            if home_id == team_id:
                goals_for += home_score
                goals_against += away_score
                
                if home_score > away_score:
                    won += 1
                    points += 3
                elif home_score == away_score:
                    drawn += 1
                    points += 1
                else:
                    lost += 1
            else:
                goals_for += away_score
                goals_against += home_score
                
                if away_score > home_score:
                    won += 1
                    points += 3
                elif away_score == home_score:
                    drawn += 1
                    points += 1
                else:
                    lost += 1
        
        goal_difference = goals_for - goals_against
        
        standings.append({
            'team_id': team_id,
            'team_name': team_name,
            'team_abbr': team_abbr,
            'played': played,
            'won': won,
            'drawn': drawn,
            'lost': lost,
            'goals_for': goals_for,
            'goals_against': goals_against,
            'goal_difference': goal_difference,
            'points': points
        })
    
    standings.sort(key=lambda x: (-x['points'], -x['goal_difference'], -x['goals_for']))
    
    for position, team_standing in enumerate(standings, start=1):
        team_standing['position'] = position
    
    cursor.close()
    conn.close()
    logger.info(f"Calculated standings for {len(standings)} teams at gameweek {gameweek}.")
    return standings

def upload_weekly_standings(gameweek, standings_data):
    """
    Upload weekly standings data to the database.
    Args:
        gameweek (int): The gameweek number.
        standings_data (list): List of team standings dictionaries.
    """
    logger.info(f"Uploading weekly standings for gameweek {gameweek}...")
    try:
        cursor, conn = _get_cursor()
        for team_standing in standings_data:
            cursor.execute("""
                INSERT INTO weeklyStandings (
                    gameweek, team_id, team_name, team_abbr, team_short_name,
                    position, played, won, drawn, lost,
                    goals_for, goals_against, goal_difference, points
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (gameweek, team_id) DO UPDATE SET
                    team_name = EXCLUDED.team_name,
                    team_abbr = EXCLUDED.team_abbr,
                    team_short_name = EXCLUDED.team_short_name,
                    position = EXCLUDED.position,
                    played = EXCLUDED.played,
                    won = EXCLUDED.won,
                    drawn = EXCLUDED.drawn,
                    lost = EXCLUDED.lost,
                    goals_for = EXCLUDED.goals_for,
                    goals_against = EXCLUDED.goals_against,
                    goal_difference = EXCLUDED.goal_difference,
                    points = EXCLUDED.points;
            """, (
                gameweek,
                team_standing['team_id'],
                team_standing['team_name'],
                team_standing['team_abbr'],
                team_standing['team_name'],
                team_standing['position'],
                team_standing['played'],
                team_standing['won'],
                team_standing['drawn'],
                team_standing['lost'],
                team_standing['goals_for'],
                team_standing['goals_against'],
                team_standing['goal_difference'],
                team_standing['points']
            ))
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Successfully uploaded weekly standings for gameweek {gameweek}.")
    except Exception as e:
        logger.error(f"Error uploading weekly standings for gameweek {gameweek}: {e}")
        conn.rollback()

def buildWeeklyTable():
    """
    Build weeklyTable in the plDashboard database to store weekly aggregated data.
    """
    logger.info("Building weekly standings table in plDashboard database...")
    # db = dbConnections()
    current_gameweek = get_current_gameweek()
    
    if current_gameweek == 0:
        logger.warning("No completed fixtures found. Cannot build weekly standings.")
        return
    
    for gameweek in range(1, current_gameweek + 1):
        standings = calculate_standings_for_gameweek(gameweek)
        upload_weekly_standings(gameweek, standings)
    
    logger.info(f"Successfully built weekly standings for gameweeks 1 to {current_gameweek}.")
    # db.close_db_connection()

def main():
    """Main entry point for building weekly standings table."""
    buildWeeklyTable()

if __name__ == "__main__":
    main()

