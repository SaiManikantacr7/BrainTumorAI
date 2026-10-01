from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger("neuroscan.database")

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

mongo_client = None
mongo_db = None
mongo_connected = False

def initialize_mongodb() -> bool:
    """Connect to MongoDB Atlas and verify the connection without exposing credentials."""
    global mongo_client, mongo_db, mongo_connected
    uri = settings.MONGODB_URI.strip()
    if not uri or "<db_username>" in uri or "<db_password>" in uri:
        logger.warning("MongoDB is not configured with a complete connection URI.")
        return False

    try:
        from pymongo import MongoClient
        from pymongo.server_api import ServerApi

        mongo_client = MongoClient(
            uri,
            server_api=ServerApi("1", strict=True, deprecation_errors=True),
            serverSelectionTimeoutMS=5000,
        )
        mongo_client.admin.command("ping")
        mongo_db = mongo_client[settings.MONGODB_DATABASE]
        mongo_db["users"].create_index("email", unique=True)
        for collection in (
            "wellness_profiles", "wellness_assessments", "exercise_plans",
            "workout_sessions", "environment_snapshots", "notification_preferences",
        ):
            mongo_db[collection].create_index("user_id")
        mongo_connected = True
        logger.info("MongoDB Atlas connection established.")
        return True
    except Exception:
        mongo_client = None
        mongo_db = None
        mongo_connected = False
        logger.exception("MongoDB Atlas connection failed.")
        return False

def close_mongodb():
    global mongo_client, mongo_db, mongo_connected
    if mongo_client is not None:
        mongo_client.close()
    mongo_client = None
    mongo_db = None
    mongo_connected = False

def is_mongodb_connected() -> bool:
    return mongo_connected

def initialize_database():
    """Create tables and apply small SQLite-compatible profile-column migrations."""
    Base.metadata.create_all(bind=engine)
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    required_columns = {
        "location": "VARCHAR(255)",
        "phone_number": "VARCHAR(50)",
        "organization": "VARCHAR(255)",
    }
    existing_columns = {column["name"] for column in inspect(engine).get_columns("users")}
    with engine.begin() as connection:
        for name, definition in required_columns.items():
            if name not in existing_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {definition}"))

def get_db():
    """FastAPI database dependency providing transactional session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
