"""Verify the configured MongoDB connection without displaying its URI."""

from pymongo import MongoClient
from pymongo.errors import ConfigurationError, PyMongoError

from app.core.config import settings


def main() -> int:
    if not settings.MONGODB_URI.strip():
        print("MongoDB check failed: MONGODB_URI is empty in backend/.env.")
        return 1

    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=10_000)
    try:
        client.admin.command("ping")
        print("MongoDB ping: OK")
        print(f"Database: {settings.MONGODB_DATABASE}")
        return 0
    except ConfigurationError as exc:
        print(f"MongoDB configuration error: {exc}")
        return 1
    except PyMongoError as exc:
        print(f"MongoDB connection failed ({type(exc).__name__}).")
        print("Check Atlas cluster status, Network Access IP allowlist, and outbound TLS/firewall access.")
        return 1
    finally:
        client.close()


if __name__ == "__main__":
    raise SystemExit(main())
