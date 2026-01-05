import psycopg2
from db.dbConn import dbConnections
from utils.logger import Logger

logger = Logger(__name__).get()

def initialize_database():
    """
    Initialize the plDashboard database and all required tables.
    This function can be called from other Python scripts.
    """
    # Step 1: Connect to default postgres database
    # logger.info("Step 1: Connecting to default postgres database...")
    # default_db = dbConnections(db_name='postgres')
    # conn = default_db.connect_db()
    
    # if not conn:
    #     logger.error("Failed to connect to default postgres database.")
    #     return False
    
    # # Check if plDashboard database already exists
    # if default_db.database_exists('pldashboard'):
    #     logger.info("Database 'pldashboard' already exists. Skipping database creation.")
    # else:
    #     # Step 2: Create plDashboard database
    #     logger.info("Step 2: Creating plDashboard database...")
    #     success = default_db.create_database('pldashboard')
    #     if not success:
    #         default_db.close_db_connection()
    #         logger.error("Failed to create plDashboard database.")
    #         return False
    
    # default_db.close_db_connection()
    
    # Step 3: Connect to plDashboard database
    logger.info("Step 3: Connecting to plDashboard database...")
    pl_db = dbConnections(db_name='pldashboard')
    conn = pl_db.connect_db()
    try:
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                short_name VARCHAR(255),
                abbr VARCHAR(10),
                stadium VARCHAR(255),
                fpl_id INT,
                fpl_data JSONB,
                stats JSONB
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_teams_name ON teams (name);")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fixtures (
                match_id INT PRIMARY KEY,
                kickoff_timezone VARCHAR(50),
                kickoff_time TIMESTAMP WITH TIME ZONE,
                home_team_id INT,
                home_team_name VARCHAR(255),
                home_team_abbr VARCHAR(10),
                away_team_id INT,
                away_team_name VARCHAR(255),
                away_team_abbr VARCHAR(10),
                gameweek INT,
                venue VARCHAR(255)
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fixtures_gameweek ON fixtures (gameweek);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures (home_team_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures (away_team_id);")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS completedFixtures (
                match_id INT PRIMARY KEY,
                kickoff_timezone VARCHAR(50),
                kickoff_time TIMESTAMP WITH TIME ZONE,
                home_team_id INT,
                home_team_name VARCHAR(255),
                home_team_abbr VARCHAR(10),
                home_team_score INT,
                home_team_redcard INT,
                away_team_id INT,
                away_team_name VARCHAR(255),
                away_team_abbr VARCHAR(10),
                away_team_score INT,
                away_team_redcard INT,
                gameweek INT,
                venue VARCHAR(255),
                events JSONB,
                home_stats JSONB,
                away_stats JSONB,
                home_team_lineup JSONB,
                away_team_lineup JSONB,
                match_report TEXT
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_completedfixtures_gameweek ON completedFixtures (gameweek);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_completedfixtures_home_team_id ON completedFixtures (home_team_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_completedfixtures_away_team_id ON completedFixtures (away_team_id);")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (
                player_id INT PRIMARY KEY,
                player_name VARCHAR(255),
                position VARCHAR(50),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                team_id INT,
                team_name VARCHAR(255),
                team_short_name VARCHAR(50),
                country VARCHAR(100),
                dob DATE,
                height INT,
                weight INT,
                preferred_foot VARCHAR(50),
                shirt_num INT,
                stats JSONB,
                fpl_id INT,
                fpl_stats JSONB
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_players_player_name ON players (player_name);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_players_team_id ON players (team_id);")

        conn.commit()
        logger.info("Tables created or already exist.")
        logger.info("Indexes created or already exist.")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS standings
            (
                teamName VARCHAR(255),
                teamId INT,
                teamAbbr VARCHAR(50),
                shortName VARCHAR(50),
                position INT,
                played INT,
                won INT,
                drawn INT,
                lost INT,
                goalsFor INT,
                goalsAgainst INT,
                goalDifference INT,
                points INT,
                home JSONB,
                away JSONB
            );
        """)

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_standings_teamId ON standings (teamId);")
        conn.commit()
        logger.info("Standings table and indexes created or already exist.")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weeklyStandings (
                gameweek INT,
                team_id INT,
                team_name VARCHAR(255),
                team_abbr VARCHAR(10),
                team_short_name VARCHAR(50),
                position INT,
                played INT,
                won INT,
                drawn INT,
                lost INT,
                goals_for INT,
                goals_against INT,
                goal_difference INT,
                points INT,
                PRIMARY KEY (gameweek, team_id)
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_weekly_standings_gameweek ON weeklyStandings (gameweek);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_weekly_standings_team_id ON weeklyStandings (team_id);")
        conn.commit()
        logger.info("Weekly standings table and indexes created or already exist.")
        
        logger.info("\n=== Database initialization completed successfully ===")
        return True

    except psycopg2.Error as e:
        logger.error(f"Error connecting to or interacting with database: {e}")
        return False
    finally:
        pl_db.close_db_connection()

def main():
    """Main entry point for database initialization."""
    success = initialize_database()
    if success:
        logger.info("Database and tables initialized successfully.")
    else:
        logger.error("Database initialization failed.")
    return success

if __name__ == "__main__":
    main()