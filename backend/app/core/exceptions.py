"""Custom domain exceptions and FastAPI global exception handlers."""

from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.core.logging import logger


class DigiMitraException(Exception):
    """Base exception for all DigiMitra application domain errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred in the DigiMitra system.",
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundException(DigiMitraException):
    """Raised when a requested resource is not found."""

    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            code="ENTITY_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"entity": entity_name, "identifier": str(identifier)},
        )


class EntityAlreadyExistsException(DigiMitraException):
    """Raised when creating an entity that violates uniqueness constraints."""

    def __init__(self, entity_name: str, conflict_field: str, value: Any):
        super().__init__(
            message=f"{entity_name} with {conflict_field}='{value}' already exists.",
            code="ENTITY_ALREADY_EXISTS",
            status_code=status.HTTP_409_CONFLICT,
            details={"entity": entity_name, "field": conflict_field, "value": str(value)},
        )


class BadRequestException(DigiMitraException):
    """Raised on invalid request format or business precondition violation."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="BAD_REQUEST",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class ValidationException(DigiMitraException):

    """Raised on business logic validation failure."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class AuthenticationException(DigiMitraException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Invalid authentication credentials."):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AuthorizationException(DigiMitraException):
    """Raised when user lacks permission to access a resource."""

    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class RuleEvaluationException(DigiMitraException):
    """Raised when rule engine condition parsing or evaluation fails."""

    def __init__(self, rule_id: Any, reason: str):
        super().__init__(
            message=f"Rule evaluation failed for rule '{rule_id}': {reason}",
            code="RULE_EVALUATION_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"rule_id": str(rule_id), "reason": reason},
        )


def register_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers with FastAPI application."""

    @app.exception_handler(DigiMitraException)
    async def digimitra_exception_handler(request: Request, exc: DigiMitraException) -> JSONResponse:
        logger.warning(
            "DigiMitraException handled: [%s] %s | path: %s",
            exc.code,
            exc.message,
            request.url.path,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
        )

    @app.exception_handler(ValidationError)
    async def pydantic_validation_exception_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        logger.warning("Pydantic validation error on %s: %s", request.url.path, exc.errors())
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "REQUEST_VALIDATION_ERROR",
                    "message": "Invalid request payload or query parameters.",
                    "details": exc.errors(),
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled server exception on %s: %s",
            request.url.path,
            str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                    "details": {},
                },
            },
        )
