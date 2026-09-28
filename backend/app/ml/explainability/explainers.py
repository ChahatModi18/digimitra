"""Model Explainability Extractors (C5 Section 13).

Extracts transparent, auditable explanations tailored to each model architecture:
1. Logistic Regression: Standardized feature coefficients per target level
2. Decision Tree: Plain-text if/else decision tree rules
3. Random Forest: Gini feature importances
"""

from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.tree import export_text


class ModelExplainer:
    """Extracts interpretable artifacts from trained classifiers."""

    @staticmethod
    def extract_logistic_regression_coefficients(
        model: Any,
        feature_names: List[str],
    ) -> Dict[str, Any]:
        """
        Extracts coefficients per feature per class.
        """
        if not hasattr(model, "coef_"):
            return {}

        coef_matrix = model.coef_  # Shape: (n_classes, n_features)
        classes = getattr(model, "classes_", [0, 1, 2, 3])

        feature_coefs: Dict[str, Dict[str, float]] = {}
        for feat_idx, feat_name in enumerate(feature_names):
            if feat_idx < coef_matrix.shape[1]:
                feature_coefs[feat_name] = {
                    f"level_{cls_val}": float(coef_matrix[cls_idx, feat_idx])
                    for cls_idx, cls_val in enumerate(classes)
                }

        intercepts = {
            f"level_{cls_val}": float(model.intercept_[cls_idx])
            for cls_idx, cls_val in enumerate(classes)
        } if hasattr(model, "intercept_") else {}

        return {
            "type": "logistic_regression_coefficients",
            "feature_coefficients": feature_coefs,
            "intercepts": intercepts,
        }

    @staticmethod
    def extract_decision_tree_rules(
        model: Any,
        feature_names: List[str],
    ) -> Dict[str, Any]:
        """
        Extracts human-readable if/else text rules from a shallow Decision Tree.
        """
        try:
            tree_text = export_text(model, feature_names=feature_names)
            return {
                "type": "decision_tree_text_rules",
                "rules_text": tree_text,
                "tree_depth": int(model.get_depth()) if hasattr(model, "get_depth") else None,
                "n_leaves": int(model.get_n_leaves()) if hasattr(model, "get_n_leaves") else None,
            }
        except Exception as e:
            return {
                "type": "decision_tree_text_rules",
                "error": str(e),
            }

    @staticmethod
    def extract_random_forest_importances(
        model: Any,
        feature_names: List[str],
    ) -> Dict[str, Any]:
        """
        Extracts Gini feature importances from Random Forest.
        """
        if not hasattr(model, "feature_importances_"):
            return {}

        importances = model.feature_importances_
        feature_importances = {
            feat_name: float(importances[i])
            for i, feat_name in enumerate(feature_names)
            if i < len(importances)
        }

        # Sort by importance descending
        sorted_importances = dict(
            sorted(feature_importances.items(), key=lambda item: item[1], reverse=True)
        )

        return {
            "type": "random_forest_feature_importances",
            "feature_importances": sorted_importances,
            "n_estimators": int(model.n_estimators) if hasattr(model, "n_estimators") else None,
        }

    @classmethod
    def explain_model(
        cls,
        model: Any,
        feature_names: List[str],
    ) -> Dict[str, Any]:
        """
        Automatically selects and runs the appropriate explainability extractor.
        """
        model_name = model.__class__.__name__

        if "LogisticRegression" in model_name:
            return cls.extract_logistic_regression_coefficients(model, feature_names)
        elif "DecisionTree" in model_name:
            return cls.extract_decision_tree_rules(model, feature_names)
        elif "RandomForest" in model_name:
            return cls.extract_random_forest_importances(model, feature_names)
        else:
            return {
                "type": "unsupported_explainer",
                "model_class": model_name,
            }
