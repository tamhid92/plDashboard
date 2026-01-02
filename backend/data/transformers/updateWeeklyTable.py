from db.dbConn import dbConnections
from utils.logger import Logger
from .initWeeklyTable import get_current_gameweek, buildWeeklyTable

logger = Logger(__name__).get()



def ifNecessary():
    """
    Check if the weekly performance table needs to be updated and build it if necessary.
    """
    logger.info("Checking if weekly performance table needs to be updated...")
    db = dbConnections()
    conn = db.connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT MAX(gameweek) FROM weeklyStandings;")
        result = cursor.fetchone()
        last_built_gameweek = result[0] if result and result[0] is not None else 0
        
        current_gameweek = get_current_gameweek()

        cursor.close()
        conn.close()
        
        if current_gameweek > last_built_gameweek:
            logger.info(f"Weekly performance table is outdated (last built: GW{last_built_gameweek}). Rebuilding for GW{current_gameweek}...")
            return True
        else:
            logger.info("Weekly performance table is up-to-date. No action needed.")
            return False
        
    except Exception as e:
        logger.error(f"Error checking/updating weekly performance table: {e}")
        conn.rollback()
        cursor.close()
        conn.close()

def updateWeeklyTable():
    """
    Update the weekly performance table if necessary.
    """
    if ifNecessary():
        buildWeeklyTable()