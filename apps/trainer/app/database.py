"""
Prompt Forge Trainer - Database Connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import structlog

logger = structlog.get_logger()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB."""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        # Test connection
        await client.admin.command("ping")
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error("Failed to connect to MongoDB", error=str(e))
        raise


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("Closed MongoDB connection")


def get_db():
    """Get database instance."""
    return db
