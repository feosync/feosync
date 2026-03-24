"""Application-wide exception hierarchy."""
from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception (non-HTTP)."""
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


# ── 400 ──────────────────────────────────────────────────────────────────────
class BadRequestError(HTTPException):
    def __init__(self, detail: str = "Bad request") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


# ── 401 ──────────────────────────────────────────────────────────────────────
class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Not authenticated") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── 403 ──────────────────────────────────────────────────────────────────────
class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


# ── 404 ──────────────────────────────────────────────────────────────────────
class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
        )


# ── 409 ──────────────────────────────────────────────────────────────────────
class ConflictError(HTTPException):
    def __init__(self, detail: str = "Conflict") -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


# ── 422 ──────────────────────────────────────────────────────────────────────
class UnprocessableError(HTTPException):
    def __init__(self, detail: str = "Unprocessable entity") -> None:
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail
        )


# ── 429 ──────────────────────────────────────────────────────────────────────
class RateLimitError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please slow down.",
        )


# ── 503 ──────────────────────────────────────────────────────────────────────
class ServiceUnavailableError(HTTPException):
    def __init__(self, detail: str = "Service temporarily unavailable") -> None:
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail
        )


# ── Domain-specific ──────────────────────────────────────────────────────────
class PlanLimitExceededError(ForbiddenError):
    def __init__(self, resource: str) -> None:
        super().__init__(
            detail=f"Your current plan does not allow more {resource}. Please upgrade."
        )


class MetaAPIError(AppException):
    """Raised when a Meta Graph API call fails."""
    def __init__(self, message: str, code: int | None = None) -> None:
        self.code = code
        super().__init__(message)
