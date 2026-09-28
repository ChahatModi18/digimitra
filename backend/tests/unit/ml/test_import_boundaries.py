"""Static AST Import Boundary Check (C5 Section 21 & 22).

Asserts that no module under app/ml/ imports write methods or repositories
from domain/classification/, domain/recommendation/, or domain/roadmap/.
"""

import ast
import os
from pathlib import Path


FORBIDDEN_IMPORT_PATTERNS = [
    "ClassificationRepository",
    "RecommendationRepository",
    "RoadmapRepository",
    "app.repositories.classification",
    "app.repositories.recommendation",
    "app.repositories.roadmap",
]


def test_ml_import_boundaries_contain_no_production_write_paths():
    """Verify that app/ml contains zero imports of production write repositories."""
    ml_root = Path(__file__).resolve().parents[3] / "app" / "ml"
    assert ml_root.exists(), f"ML root directory not found at {ml_root}"

    violations = []

    for py_path in ml_root.glob("**/*.py"):
        code = py_path.read_text(encoding="utf-8")
        tree = ast.parse(code, filename=str(py_path))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    for pattern in FORBIDDEN_IMPORT_PATTERNS:
                        if pattern in alias.name:
                            violations.append(f"{py_path.name}: import {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                module_name = node.module or ""
                for alias in node.names:
                    full_import = f"{module_name}.{alias.name}"
                    for pattern in FORBIDDEN_IMPORT_PATTERNS:
                        if pattern in full_import or pattern == alias.name:
                            violations.append(f"{py_path.name}: from {module_name} import {alias.name}")

    assert not violations, f"Production safety violation: ML imported production write paths: {violations}"
