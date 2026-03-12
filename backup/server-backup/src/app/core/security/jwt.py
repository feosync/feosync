"""
Security utilities: password hashing, JWT creation/validation,
Fernet encryption for Meta access tokens stored in the database.
"""
from __future__ import annotations

import base64
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from src.app.core.config.settings import settings

# ── Password hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    expire = _utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": _utcnow(),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> tuple[str, datetime]:
    """Returns (raw_token, expires_at)."""
    raw = secrets.token_urlsafe(64)
    expires_at = _utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    return raw, expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    """Raises JWTError on failure."""
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload


def create_email_verification_token(email: str) -> str:
    expire = _utcnow() + timedelta(hours=24)
    return jwt.encode(
        {"sub": email, "exp": expire, "type": "email_verify"},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_email_verification_token(token: str) -> str:
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "email_verify":
        raise JWTError("Invalid token type")
    return payload["sub"]


def create_password_reset_token(email: str) -> str:
    expire = _utcnow() + timedelta(hours=1)
    return jwt.encode(
        {"sub": email, "exp": expire, "type": "password_reset"},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_password_reset_token(token: str) -> str:
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "password_reset":
        raise JWTError("Invalid token type")
    return payload["sub"]


# ── Fernet encryption (for Meta access tokens) ────────────────────────────────
def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    # Support raw 32-byte or already base64 url-safe 44-char keys
    if len(key) == 32:
        key = base64.urlsafe_b64encode(key.encode())
    elif isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_token(plain_token: str) -> str:
    """Encrypt a Meta access token for DB storage."""
    return _get_fernet().encrypt(plain_token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a Meta access token retrieved from DB."""
    return _get_fernet().decrypt(encrypted_token.encode()).decode()
