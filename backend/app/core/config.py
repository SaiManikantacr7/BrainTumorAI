import os
from typing import List, Union, Any
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: Any = True
    APP_NAME: str = "NeuroScan AI Platform"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("1", "true", "yes", "on", "development", "dev")
        return bool(v)
    APP_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Security & Tokens
    SECRET_KEY: str = "neuroscan_dev_key_84920482049284092834092384029348203948"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ADMIN_EMAIL: str = "adminofbraintumorai7@gmail.com"

    # Database
    DATABASE_URL: str = "sqlite:///./neuroscan.db"

    # MongoDB Atlas (used for document storage and future audit/analysis collections)
    MONGODB_URI: str = ""
    MONGODB_DATABASE: str = "braintumorvision"

    # Wellness data providers. Credentials remain backend-only.
    USDA_API_KEY: str = ""
    OPENAQ_API_KEY: str = ""
    EXERCISEDB_API_URL: str = "https://exercisedb-api.vercel.app/api/v1"

    # SMTP Credentials (Gmail App Password)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@neuroscan.ai"
    SMTP_FROM_NAME: str = "NeuroScan AI Research"
    SMTP_TLS: bool = True

    # OTP Settings
    OTP_EXPIRE_MINUTES: int = 5
    OTP_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5

    # AI & Storage
    MODEL_DEVICE: str = "cpu"
    DEFAULT_MODEL_VERSION: str = "v1.3.0"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
