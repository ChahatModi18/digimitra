"""Candidate Machine Learning Models (C5 Section 10).

Interpretable and tree-based candidate model factories:
1. Multinomial Logistic Regression (standardized coefficients)
2. Shallow Decision Tree (rule-extractable)
3. Random Forest (feature importance ceiling test)
"""

from typing import Any, Dict, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


def create_logistic_regression(
    class_weight: str = "balanced",
    max_iter: int = 1000,
    random_state: int = 42,
    C: float = 1.0,
    **kwargs: Any,
) -> LogisticRegression:
    """Creates a Multinomial Logistic Regression classifier."""
    return LogisticRegression(
        class_weight=class_weight,
        max_iter=max_iter,
        random_state=random_state,
        C=C,
        **kwargs,
    )



def create_decision_tree(
    max_depth: int = 5,
    class_weight: str = "balanced",
    random_state: int = 42,
    min_samples_leaf: int = 2,
    **kwargs: Any,
) -> DecisionTreeClassifier:
    """Creates a Shallow Decision Tree classifier."""
    return DecisionTreeClassifier(
        max_depth=max_depth,
        class_weight=class_weight,
        random_state=random_state,
        min_samples_leaf=min_samples_leaf,
        **kwargs,
    )


def create_random_forest(
    n_estimators: int = 200,
    class_weight: str = "balanced",
    random_state: int = 42,
    max_depth: Optional[int] = 8,
    min_samples_leaf: int = 2,
    **kwargs: Any,
) -> RandomForestClassifier:
    """Creates a Random Forest classifier."""
    return RandomForestClassifier(
        n_estimators=n_estimators,
        class_weight=class_weight,
        random_state=random_state,
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
        **kwargs,
    )


MODEL_FACTORIES: Dict[str, Any] = {
    "logistic_regression": create_logistic_regression,
    "decision_tree": create_decision_tree,
    "random_forest": create_random_forest,
}
