"""Preprocessing Pipeline Factory (C5 Section 9).

Builds unfitted scikit-learn ColumnTransformer and Pipeline objects.
Guarantees that transformers are fit ONLY inside training folds.
"""

from typing import Any, Dict, List, Optional
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler

from app.ml.constants import (
    NUMERIC_SCORE_FEATURES,
    NUMERIC_METADATA_FEATURES,
    MISSING_INDICATOR_FEATURES,
)


class PipelineFactory:
    """Constructs modular, leak-free scikit-learn pipelines."""

    @staticmethod
    def create_preprocessor(
        business_size_encoding: str = "ordinal",
        category_min_frequency: float = 0.05,
    ) -> ColumnTransformer:
        """
        Creates ColumnTransformer for canonical features.

        Parameters:
        -----------
        business_size_encoding : 'ordinal' (micro<small<medium) or 'onehot'
        category_min_frequency : Threshold for grouping rare sectors to 'Other'
        """
        # Numeric columns to scale
        numeric_cols = NUMERIC_SCORE_FEATURES + NUMERIC_METADATA_FEATURES

        # Binary/indicator columns to pass through without modification
        passthrough_cols = MISSING_INDICATOR_FEATURES

        transformers: List[Any] = [
            ("numeric_scaler", StandardScaler(), numeric_cols),
            ("indicators_passthrough", "passthrough", passthrough_cols),
        ]

        # Business size encoding
        if business_size_encoding == "ordinal":
            transformers.append(
                (
                    "business_size_enc",
                    OrdinalEncoder(
                        categories=[["micro", "small", "medium"]],
                        handle_unknown="use_encoded_value",
                        unknown_value=-1,
                    ),
                    ["business_size"],
                )
            )
        else:
            transformers.append(
                (
                    "business_size_enc",
                    OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                    ["business_size"],
                )
            )

        # Category (sector) encoding with rare grouping
        transformers.append(
            (
                "category_enc",
                OneHotEncoder(
                    min_frequency=category_min_frequency,
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                ["category_id"],
            )
        )

        return ColumnTransformer(transformers=transformers, remainder="drop")

    @classmethod
    def create_pipeline(
        cls,
        classifier: Any,
        business_size_encoding: str = "ordinal",
        category_min_frequency: float = 0.05,
    ) -> Pipeline:
        """
        Builds a full, unfitted scikit-learn Pipeline with preprocessing + classifier.
        """
        preprocessor = cls.create_preprocessor(
            business_size_encoding=business_size_encoding,
            category_min_frequency=category_min_frequency,
        )

        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", classifier),
            ]
        )
