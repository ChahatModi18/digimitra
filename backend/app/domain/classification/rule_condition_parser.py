"""Safe condition evaluation engine for rule expressions without eval() or exec()."""

from typing import Any, Dict, List


class RuleConditionParser:
    """Evaluates declarative JSON Logic condition trees against data dictionaries."""

    @classmethod
    def evaluate(cls, condition: Any, data: Dict[str, Any]) -> bool:
        """Evaluate a condition expression against the provided data context."""
        if isinstance(condition, bool):
            return condition

        if not isinstance(condition, dict):
            return bool(condition)

        # Iterate over operator expressions
        for op, args in condition.items():
            op_lower = op.lower()

            if op_lower in ("and", "all"):
                if not isinstance(args, list):
                    args = [args]
                return all(cls.evaluate(item, data) for item in args)

            elif op_lower in ("or", "any"):
                if not isinstance(args, list):
                    args = [args]
                return any(cls.evaluate(item, data) for item in args)

            elif op_lower == "not":
                return not cls.evaluate(args, data)

            elif op_lower in ("==", "eq"):
                left, right = cls._resolve_binary_args(args, data)
                return left == right

            elif op_lower in ("!=", "neq"):
                left, right = cls._resolve_binary_args(args, data)
                return left != right

            elif op_lower in (">", "gt"):
                left, right = cls._resolve_binary_args(args, data)
                try:
                    return float(left) > float(right)
                except (ValueError, TypeError):
                    return False

            elif op_lower in (">=", "gte"):
                left, right = cls._resolve_binary_args(args, data)
                try:
                    return float(left) >= float(right)
                except (ValueError, TypeError):
                    return False

            elif op_lower in ("<", "lt"):
                left, right = cls._resolve_binary_args(args, data)
                try:
                    return float(left) < float(right)
                except (ValueError, TypeError):
                    return False

            elif op_lower in ("<=", "lte"):
                left, right = cls._resolve_binary_args(args, data)
                try:
                    return float(left) <= float(right)
                except (ValueError, TypeError):
                    return False

            elif op_lower == "in":
                # Check if item in collection: args = [item, collection]
                item, collection = cls._resolve_binary_args(args, data)
                if isinstance(collection, (list, tuple, set, dict, str)):
                    return item in collection
                return False

            elif op_lower == "contains":
                # Check if collection contains item: args = [collection, item]
                collection, item = cls._resolve_binary_args(args, data)
                if isinstance(collection, (list, tuple, set, dict, str)):
                    return item in collection
                return False

            elif op_lower == "has_key":
                key = str(args)
                return key in data

        return False

    @classmethod
    def _resolve_binary_args(cls, args: Any, data: Dict[str, Any]) -> tuple[Any, Any]:
        """Extract and resolve left and right operands."""
        if isinstance(args, list) and len(args) == 2:
            left = cls._resolve_value(args[0], data)
            right = cls._resolve_value(args[1], data)
            return left, right
        return None, None

    @classmethod
    def _resolve_value(cls, val: Any, data: Dict[str, Any]) -> Any:
        """Resolve a value or variable path (e.g. {"var": "answers.Q_PAY_01"})."""
        if isinstance(val, dict) and "var" in val:
            path = val["var"]
            return cls._get_nested_val(path, data)
        return val

    @classmethod
    def _get_nested_val(cls, path: str, data: Dict[str, Any]) -> Any:
        """Extract nested key using dot notation (e.g., 'answers.Q_PAY_01')."""
        current: Any = data
        for part in path.split("."):
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        return current
