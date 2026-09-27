"""Internationalization (i18n) service for English and Hindi support."""

import json
from pathlib import Path
from typing import Any, Dict, Optional
from app.config import settings
from app.core.logging import logger

_LOCALES_CACHE: Dict[str, Dict[str, Any]] = {}
LOCALES_DIR = Path(__file__).resolve().parent.parent.parent / "locales"


def load_translations(locale: str) -> Dict[str, Any]:
    """Load translation dictionaries for a given locale (e.g., 'en', 'hi')."""
    if locale in _LOCALES_CACHE:
        return _LOCALES_CACHE[locale]

    target_locale = locale if locale in settings.SUPPORTED_LOCALES else settings.DEFAULT_LOCALE
    locale_path = LOCALES_DIR / target_locale
    translations: Dict[str, Any] = {}

    if locale_path.exists() and locale_path.is_dir():
        for json_file in locale_path.glob("*.json"):
            namespace = json_file.stem
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    translations[namespace] = json.load(f)
            except Exception as e:
                logger.error("Failed to load translation file %s: %s", json_file, e)
    else:
        logger.warning("Locale directory not found at: %s", locale_path)

    _LOCALES_CACHE[target_locale] = translations
    return translations


def get_translation(
    key_path: str,
    locale: str = settings.DEFAULT_LOCALE,
    default: Optional[str] = None,
) -> str:
    """Resolve a dot-separated translation key (e.g. 'common.welcome_message')."""
    translations = load_translations(locale)
    parts = key_path.split(".")
    current: Any = translations

    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return default or key_path

    return str(current) if current is not None else (default or key_path)


def resolve_locale(accept_language: Optional[str] = None, requested_lang: Optional[str] = None) -> str:
    """Resolve the best matching locale from request headers or query params."""
    if requested_lang and requested_lang.lower() in settings.SUPPORTED_LOCALES:
        return requested_lang.lower()

    if accept_language:
        for lang_item in accept_language.split(","):
            code = lang_item.split(";")[0].strip().lower()
            short_code = code.split("-")[0]
            if short_code in settings.SUPPORTED_LOCALES:
                return short_code

    return settings.DEFAULT_LOCALE
