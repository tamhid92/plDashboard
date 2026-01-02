from soupsieve import match
from extractors.fetchData import fetchData
from utils.logger import Logger
from db.setupDB import initialize_database
import argparse

logger = Logger(__name__).get()

fetcher = fetchData()

def initialize():
    logger.info("Initializing the plDashboard database...")
    success = initialize_database()
    if not success:
        logger.error("Database initialization failed. Exiting.")
        return
    from db.uploadToDb import uploadDb
    uploader = uploadDb()
    logger.info("Database initialized successfully.")
    logger.info("Seeding the new Database with initial data...")

    logger.info("Fetching Teams Data")
    teamsData = fetcher.init_TeamsData()
    uploader.uploadTeamsData(teamsData)
    logger.info("Teams Data uploaded successfully.")
    
    logger.info("Fetching Fixture Data")
    completedFixtures, allFixtures = fetcher.init_FetchFixtures()
    uploader.upload_completed_fixtures_data(completedFixtures)
    uploader.upload_fixture_data(allFixtures)
    logger.info("Fixture Data uploaded successfully.")
    
    logger.info("Fetching Player Data")
    playersData = fetcher.init_PlayersData()
    uploader.upload_player_data(playersData)
    logger.info("Player Data uploaded successfully.")
    
    logger.info("Fetching Standings Data")
    standingsData = fetcher.init_Standings()
    uploader.updateStandings(standingsData)


    from transformers.initWeeklyTable import buildWeeklyTable
    logger.info("Building Weekly Performance Table")
    buildWeeklyTable()
    logger.info("Weekly Performance Table built successfully.")

    logger.info("Database setup and seeding completed successfully.")

def update():
    recentlyCompletedFixtures = fetcher.recentlyCompletedGames()
    if recentlyCompletedFixtures:
        from db.uploadToDb import uploadDb
        uploader = uploadDb()
        matches = []
        for matchId, homeTeamId, awayTeamId in recentlyCompletedFixtures:
            logger.info(f"Updating data for Match ID: {matchId}")
            matchData = fetcher.getMatchData(matchId)
            if not matchData:
                logger.error(f"No data found for match ID: {matchId}. Skipping.")
                continue
            matches.append(matchData)
                
        uploader.upload_completed_fixtures_data(matches)
        
        teamsData = fetcher.init_TeamsData()
        uploader.uploadTeamsData(teamsData)
        logger.info("Teams Data updated successfully.")

        logger.info("Fetching Player Data")
        playersData = fetcher.init_PlayersData()
        uploader.upload_player_data(playersData)
        logger.info("Player Data updated successfully.")

        logger.info("Fetching Standings Data")
        standingsData = fetcher.init_Standings()
        uploader.updateStandings(standingsData)


        from transformers.updateWeeklyTable import updateWeeklyTable
        logger.info("Updating Weekly Performance Table")
        updateWeeklyTable()
        logger.info("Weekly Performance Table updated successfully.")
            
        logger.info("Recently completed fixtures updated successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize or update the plDashboard database.")
    parser.add_argument(
        "--action","-a",
        choices=["init", "update"],
        help="Specify whether to initialize a new database or update the existing one."
    )
    args = parser.parse_args()
    if args.action == "init":
        initialize()
    elif args.action == "update":
        update()
        logger.info("Updating the existing plDashboard database...")