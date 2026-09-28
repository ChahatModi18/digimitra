"""DigiMitra ML Research & Classification Module (C5 Specification).

Governing Rule:
The existing rule-based RBDL engine remains the ONLY production classifier.
ML is research/experimental infrastructure and is structurally isolated
from production write paths.
"""

from app.ml.constants import STAGE_1_DISCLAIMER

__all__ = ["STAGE_1_DISCLAIMER"]
