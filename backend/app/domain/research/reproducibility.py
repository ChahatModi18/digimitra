"""Research Reproducibility Manifest Generator (Safeguard I-11).

Captures software version, ruleset version, question bank version, python environment,
and content hashes to guarantee empirical research reproducibility.
"""

import hashlib
import json
import platform
import subprocess
import sys
from typing import Any, Dict
from pydantic import BaseModel

from app.config import settings
from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1, QUESTION_BANK_VERSION
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION


class ReproducibilityManifest(BaseModel):
    """Immutable snapshot of research environment and rules configuration."""

    application_name: str
    application_version: str
    environment: str
    git_commit_hash: str
    ruleset_version: int
    question_bank_version: int
    rules_definition_sha256: str
    question_bank_sha256: str
    python_version: str
    platform: str
    database_dialect: str
    reproduction_instructions: Dict[str, str]


class ReproducibilityService:
    """Generates reproducibility metadata for published experiments and audits."""

    @classmethod
    def get_git_commit_hash(cls) -> str:
        """Retrieve current git revision hash safely."""
        try:
            out = subprocess.check_output(
                ["git", "rev-parse", "HEAD"],
                stderr=subprocess.DEVNULL,
                timeout=3,
            )
            return out.decode("utf-8").strip()
        except Exception:
            return "UNKNOWN_OR_UNTRACKED"

    @classmethod
    def compute_sha256(cls, data: Any) -> str:
        """Compute deterministic SHA-256 hash of JSON-serializable structure."""
        serialized = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
        return hashlib.sha256(serialized).hexdigest()

    @classmethod
    def generate_manifest(cls) -> ReproducibilityManifest:
        """Construct research reproducibility manifest."""
        git_hash = cls.get_git_commit_hash()
        rules_hash = cls.compute_sha256(RULES_V1)
        qb_hash = cls.compute_sha256(QUESTIONS_V1)

        dialect = "mysql"
        if "sqlite" in settings.DATABASE_URL.lower():
            dialect = "sqlite"

        instructions = {
            "environment_setup": "python -m venv .venv && source .venv/bin/activate (or .venv\\Scripts\\activate)",
            "dependency_install": "pip install -r requirements.txt",
            "database_migrate": "alembic upgrade head",
            "run_tests": "pytest tests/ -v",
            "verify_drift": "pytest tests/unit/test_rule_seed_drift.py -v",
        }

        return ReproducibilityManifest(
            application_name=settings.PROJECT_NAME,
            application_version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            git_commit_hash=git_hash,
            ruleset_version=RULESET_VERSION,
            question_bank_version=QUESTION_BANK_VERSION,
            rules_definition_sha256=rules_hash,
            question_bank_sha256=qb_hash,
            python_version=sys.version.split()[0],
            platform=platform.platform(),
            database_dialect=dialect,
            reproduction_instructions=instructions,
        )
