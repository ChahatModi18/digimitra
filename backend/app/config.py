"""Application Configuration and Environment Settings."""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """DigiMitra application configuration settings."""

    # Project Information
    PROJECT_NAME: str = "DigiMitra API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "DigiMitra — An AI-Assisted Digital Consultant Framework for "
        "Requirement-Based Digitalization of Small and Medium Local Enterprises in India"
    )
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security & JWT Auth
    SECRET_KEY: str = "digimitra-dev-insecure-secret-key-change-in-production-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database Settings (MySQL 8.0+ Default)
    DATABASE_URL: str = "mysql+aiomysql://digimitra_user:digimitra_secret_pass@127.0.0.1:3306/digimitra_db"
    DB_ECHO: bool = False

    # CORS Settings
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
        elif isinstance(v, list):
            return v
        return ["*"]

    # Internationalization
    DEFAULT_LOCALE: str = "en"
    SUPPORTED_LOCALES: List[str] = ["en", "hi"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"

    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
