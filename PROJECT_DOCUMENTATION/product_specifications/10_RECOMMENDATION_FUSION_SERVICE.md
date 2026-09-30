# 10. Safe Recommendation Fusion Service

## 1. Architectural Fusion Design
The `RecommendationFusionService` safely integrates machine learning advisory ranking with the deterministic C4 recommendation engine.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Frontend View
    participant Fusion as RecommendationFusionService
    participant C4 as Deterministic C4 Engine
    participant ML as ML Advisory Layer
    participant DAG as Prerequisite Guardrail

    UI->>Fusion: Request Personalized Roadmap
    Fusion->>C4: Compute Eligible Recommendations & Feasibility
    C4-->>Fusion: Return Verified Recommendations & Budget States
    Fusion->>ML: Request Advisory Priority Boosts
    alt ML Available
        ML-->>Fusion: Return Advisory Boost Weights
    else ML Offline / Fails
        Fusion->>Fusion: Fallback to 100% Deterministic Rule Scores
    end
    Fusion->>DAG: Verify No Ineligible Action Added & Budget Deferrals Intact
    DAG-->>Fusion: Invariants Confirmed
    Fusion->>UI: Return Final Phased Roadmap with Safe 80/20 Fusion
```

## 2. Inviolable Security & Guardrail Invariants
1. **Zero Unapproved Recommendations**: ML cannot inject recommendations outside C4 eligibility.
2. **Budget Primacy**: If C4 marks an item as `DEFER_DUE_TO_BUDGET`, ML cannot mark it feasible.
3. **80/20 Weighting**: Base rule score holds 80% weight; ML adjustments are bounded to 20%.\n