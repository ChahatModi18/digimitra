"""Alembic base declarative models aggregation."""

# Import all models here so that Alembic's env.py can detect all metadata
from app.models.base import Base, TimestampMixin
from app.models.rbdl_level import RBDLLevelModel
from app.models.user import User
from app.models.business_category import BusinessCategory
from app.models.business import Business
from app.models.question import Question, QuestionOption
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.rule import Rule, RuleRecommendation
from app.models.recommendation import Recommendation, BusinessRecommendation
from app.models.classification_result import ClassificationResult, ClassificationEvidence
from app.models.roadmap import Roadmap, RoadmapTask, RoadmapItem
from app.models.progress_log import ProgressLog
from app.models.ml import MLModel, MLPrediction
from app.models.research import ResearchEvaluationRecord
from app.models.audit_log import AuditLog

__all__ = [
    "Base",
    "TimestampMixin",
    "RBDLLevelModel",
    "User",
    "BusinessCategory",
    "Business",
    "Question",
    "QuestionOption",
    "Assessment",
    "AssessmentAnswer",
    "AssessmentScore",
    "Rule",
    "RuleRecommendation",
    "Recommendation",
    "BusinessRecommendation",
    "ClassificationResult",
    "ClassificationEvidence",
    "Roadmap",
    "RoadmapTask",
    "RoadmapItem",
    "ProgressLog",
    "MLModel",
    "MLPrediction",
    "ResearchEvaluationRecord",
    "AuditLog",
]
