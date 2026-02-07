"""
Prompt Forge Trainer - Health Routes
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "prompt-forge-trainer",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Prompt Forge Trainer",
        "version": "1.0.0",
        "description": "ML Training Service for Prompt Forge",
        "endpoints": {
            "health": "GET /health",
            "trainStatus": "GET /training/status",
            "trainModel": "POST /training/train"
        }
    }
