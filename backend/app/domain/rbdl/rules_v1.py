"""Declarative Rules Version 1 for Requirement-Based Digitalization Levels (Claude C3).

NOTE: The gating rules and score thresholds are initial research baseline formulations
proposed for evaluation and empirical calibration.
"""

from typing import Any, Dict, List

RULESET_VERSION = 1

RULES_V1: List[Dict[str, Any]] = [
    # ------------------------------------------------------------
    # LEVEL 1 GATING RULE
    # Requirements: infra >= 4.0 AND literacy >= 3.0
    # ------------------------------------------------------------
    {
        "rule_code": "RULE_RBDL_LEVEL_1",
        "version": 1,
        "name": "Level 1: Basic Digital Presence & Payment Readiness",
        "description": "Evaluates foundational device availability and digital literacy.",
        "target_rbdl_level": 1,
        "priority": 10,
        "rationale": "MSME has reliable basic digital infrastructure and sufficient literacy to operate digital tools.",
        "condition_json": {
            "and": [
                {">=": [{"var": "dimension_scores.infra"}, 4.0]},
                {">=": [{"var": "dimension_scores.literacy"}, 3.0]},
            ]
        },
    },
    # ------------------------------------------------------------
    # LEVEL 2 GATING RULES
    # Requirements: Level 1 satisfied AND presence >= 4.0 AND comms >= 3.0
    #               AND (records >= 4.0 OR payments >= 4.0)
    #               AND (inventory >= 3.0 OR inventory_exempt == True)
    # ------------------------------------------------------------
    {
        "rule_code": "RULE_RBDL_LEVEL_2",
        "version": 1,
        "name": "Level 2: Operational Digitalization Readiness",
        "description": "Evaluates active online presence, digital customer communication, structured bookkeeping or digital payments, and inventory management.",
        "target_rbdl_level": 2,
        "priority": 20,
        "rationale": "MSME demonstrates operational digitalization across presence, communication, financial tracking, and inventory.",
        "condition_json": {
            "and": [
                {">=": [{"var": "achieved_level"}, 1]},
                {">=": [{"var": "dimension_scores.presence"}, 4.0]},
                {">=": [{"var": "dimension_scores.comms"}, 3.0]},
                {
                    "or": [
                        {">=": [{"var": "dimension_scores.records"}, 4.0]},
                        {">=": [{"var": "dimension_scores.payments"}, 4.0]},
                    ]
                },
                {
                    "or": [
                        {">=": [{"var": "dimension_scores.inventory"}, 3.0]},
                        {"==": [{"var": "context.is_inventory_exempt"}, True]},
                    ]
                },
            ]
        },
    },
    # ------------------------------------------------------------
    # LEVEL 3 GATING RULE
    # Requirements: Level 2 satisfied AND payments >= 6.0 AND records >= 6.0
    #               AND data_usage >= 5.0 AND growth >= 4.0
    # ------------------------------------------------------------
    {
        "rule_code": "RULE_RBDL_LEVEL_3",
        "version": 1,
        "name": "Level 3: Integrated & Data-Driven Digital Enterprise",
        "description": "Evaluates digital accounting, regular payment reconciliation, analytical data usage, and proactive digital growth awareness.",
        "target_rbdl_level": 3,
        "priority": 30,
        "rationale": "MSME is an integrated, data-informed enterprise utilizing advanced digital systems for management and growth.",
        "condition_json": {
            "and": [
                {">=": [{"var": "achieved_level"}, 2]},
                {">=": [{"var": "dimension_scores.payments"}, 6.0]},
                {">=": [{"var": "dimension_scores.records"}, 6.0]},
                {">=": [{"var": "dimension_scores.data_usage"}, 5.0]},
                {">=": [{"var": "dimension_scores.growth"}, 4.0]},
            ]
        },
    },
]
