"""Unit tests for configuration and settings."""

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
