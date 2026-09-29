"""Application Configuration and Environment Settings."""

from typing import List, Union
from pydantic import field_validator, model_validator
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
    # Note: Default key is strictly permitted for local development only.
    # Production startup will fail fast if this key is not overridden with a secure secret.
    SECRET_KEY: str = "digimitra-dev-insecure-secret-key-change-in-production-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        """Fail fast on startup in production if SECRET_KEY is missing, default, or weak."""
        env = (self.ENVIRONMENT or "").strip().lower()
        if env == "production":
            insecure_defaults = [
                "digimitra-dev-insecure-secret-key-change-in-production-1234567890",
                "secret",
                "changeme",
                "secretkey",
            ]
            key = self.SECRET_KEY or ""
            if not key or key in insecure_defaults or len(key) < 32 or "insecure" in key.lower():
                raise ValueError(
                    "Production startup blocked: Insecure or default SECRET_KEY detected. "
                    "A cryptographically random secret key of at least 32 characters must be set in production."
                )
        return self

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
