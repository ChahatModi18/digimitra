"""Unit tests for safe rule condition evaluation parser."""

from app.domain.classification.rule_condition_parser import RuleConditionParser


def test_equality_and_inequality():
    data = {"answers": {"Q_PAY_01": "upi_qr", "score": 75}}

    cond_eq = {"==": [{"var": "answers.Q_PAY_01"}, "upi_qr"]}
    assert RuleConditionParser.evaluate(cond_eq, data) is True

    cond_neq = {"!=": [{"var": "answers.Q_PAY_01"}, "cash_only"]}
    assert RuleConditionParser.evaluate(cond_neq, data) is True


def test_comparison_operators():
    data = {"answers": {"turnover": 500000, "employee_count": 5}}

    cond_gt = {">": [{"var": "answers.turnover"}, 100000]}
    assert RuleConditionParser.evaluate(cond_gt, data) is True

    cond_lte = {"<=": [{"var": "answers.employee_count"}, 10]}
    assert RuleConditionParser.evaluate(cond_lte, data) is True


def test_logical_and_or_not():
    data = {
        "answers": {
            "has_upi": True,
            "has_pos": False,
            "software": "none",
        }
    }

    cond_and = {
        "and": [
            {"==": [{"var": "answers.has_upi"}, True]},
            {"==": [{"var": "answers.has_pos"}, False]},
        ]
    }
    assert RuleConditionParser.evaluate(cond_and, data) is True

    cond_or = {
        "or": [
            {"==": [{"var": "answers.software"}, "tally"]},
            {"==": [{"var": "answers.has_upi"}, True]},
        ]
    }
    assert RuleConditionParser.evaluate(cond_or, data) is True

    cond_not = {"not": {"==": [{"var": "answers.software"}, "tally"]}}
    assert RuleConditionParser.evaluate(cond_not, data) is True


def test_in_operator():
    data = {"answers": {"primary_channel": "retail_store"}}

    cond_in = {"in": [{"var": "answers.primary_channel"}, ["retail_store", "kiosk", "wholesale"]]}
    assert RuleConditionParser.evaluate(cond_in, data) is True
