"""
Prompt Forge Trainer - Main Entry Point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_db, close_db
from app.routes import training_router, health_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    try:
        await connect_db()
        logger.info("Trainer service started", port=settings.port)
    except Exception as e:
        logger.warning("Database connection failed, running without DB", error=str(e))
    
    yield
    
    # Shutdown
    await close_db()
    logger.info("Trainer service stopped")


# Create FastAPI app
app = FastAPI(
    title="Prompt Forge Trainer",
    description="ML Training Service for Prompt Forge",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router, tags=["Health"])
app.include_router(training_router, prefix="/training", tags=["Training"])


def main():
    """Run the application."""
    print("\n")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║               🧠 PROMPT FORGE TRAINER 🧠                      ║")
    print("╠══════════════════════════════════════════════════════════════╣")
    print(f"║  Server running on: http://localhost:{settings.port}                     ║")
    print("║                                                              ║")
    print("║  Endpoints:                                                  ║")
    print("║    GET  /health           - Health check                     ║")
    print("║    GET  /training/status  - Training status                  ║")
    print("║    POST /training/train   - Start training                   ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print("\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True
    )


if __name__ == "__main__":
    main()
