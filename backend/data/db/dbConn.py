import psycopg2
from utils.logger import Logger

logger = Logger(__name__).get()

class dbConnections():
    def __init__(self, db_host='localhost', db_name='pldashboard', db_user='postgres', db_password='postgres', db_port='5432'):
        self.DB_HOST = db_host
        self.DB_NAME = db_name
        self.DB_USER = db_user
        self.DB_PASSWORD = db_password
        self.DB_PORT = db_port
        self.conn = None

    def connect_db(self):
        logger.info("Attempting to connect to the database...")
        try:
            self.conn = psycopg2.connect(
                host=self.DB_HOST,
                port=self.DB_PORT,
                database=self.DB_NAME,
                user=self.DB_USER,
                password=self.DB_PASSWORD
                )
            self.conn.set_client_encoding("UTF8")
            logger.info("Successfully connected to the database.")
            return self.conn
        except psycopg2.Error as e:
            logger.error(f"Error connecting to database: {e}")
            return None
    def close_db_connection(self):
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed.")
    
    def database_exists(self, db_name):
        """Check if a database exists. Must be connected to default database first."""
        try:
            if not self.conn:
                logger.error("No connection available. Connect to default database first.")
                return False
            
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            exists = cursor.fetchone()
            cursor.close()
            
            return exists is not None
        except psycopg2.Error as e:
            logger.error(f"Error checking if database '{db_name}' exists: {e}")
            return False
    
    def create_database(self, db_name):
        """Create a database if it doesn't exist. Must be connected to default database first."""
        logger.info(f"Attempting to create database '{db_name}'...")
        try:
            if not self.conn:
                logger.error("No connection available. Connect to default database first.")
                return False
            
            # Ensure any active transaction is closed before setting autocommit
            self.conn.rollback()
            # Set autocommit to true for database creation
            self.conn.autocommit = True
            cursor = self.conn.cursor()
            
            # Check if database exists
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            exists = cursor.fetchone()
            
            if exists:
                logger.info(f"Database '{db_name}' already exists.")
            else:
                cursor.execute(f"CREATE DATABASE {db_name}")
                logger.info(f"Database '{db_name}' created successfully.")
            
            cursor.close()
            return True
        except psycopg2.Error as e:
            logger.error(f"Error creating database '{db_name}': {e}")
            return False