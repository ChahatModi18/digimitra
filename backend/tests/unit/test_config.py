"""Unit tests for configuration and settings."""

import pytest
from app.config import Settings


def test_settings_default_values():
    settings = Settings()
    assert settings.PROJECT_NAME == "DigiMitra API"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.DEFAULT_LOCALE == "en"
    assert "en" in settings.SUPPORTED_LOCALES
    assert "hi" in settings.SUPPORTED_LOCALES


def test_cors_origins_parsing():
    settings = Settings(CORS_ORIGINS="http://localhost:3000, http://example.com")
    assert isinstance(settings.CORS_ORIGINS, list)
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert "http://example.com" in settings.CORS_ORIGINS


def test_production_secret_key_validation_valid():
    """Valid strong secret key in production succeeds."""
    secure_key = "a_very_strong_random_production_secret_key_123456789"
    settings = Settings(ENVIRONMENT="production", SECRET_KEY=secure_key)
    assert settings.SECRET_KEY == secure_key
    assert settings.ENVIRONMENT == "production"


def test_production_secret_key_fails_on_default_insecure():
    """Default insecure development key fails fast in production."""
    with pytest.raises(ValueError, match="Production startup blocked"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="digimitra-dev-insecure-secret-key-change-in-production-1234567890",
        )


def test_production_secret_key_fails_on_short_key():
    """Short key (< 32 chars) fails fast in production."""
    with pytest.raises(ValueError, match="Production startup blocked"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="too_short_key",
        )


def test_production_secret_key_fails_on_empty():
    """Empty key fails fast in production."""
    with pytest.raises(ValueError, match="Production startup blocked"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="",
        )


def test_development_allows_dev_default():
    """Development environment permits the local development secret key."""
    settings = Settings(ENVIRONMENT="development")
    assert "insecure" in settings.SECRET_KEY
