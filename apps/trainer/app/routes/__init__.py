"""
Prompt Forge Trainer - Routes Index
"""
from .training import router as training_router
from .health import router as health_router

__all__ = ["training_router", "health_router"]
