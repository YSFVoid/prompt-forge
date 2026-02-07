"""
Prompt Forge Trainer - Configuration
"""
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    
    port: int = 8000
    mongodb_uri: str = "mongodb://localhost:27017/prompt-forge"
    artifacts_path: str = "./artifacts"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
