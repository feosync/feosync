"""Unit tests for security utilities."""
import pytest
from jose import JWTError

from src.app.core.security.jwt import (
    create_access_token,
    decode_access_token,
    encrypt_token,
    decrypt_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify():
    plain = "MySecurePass123!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrong", hashed)


def test_access_token_roundtrip():
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    token = create_access_token(subject=user_id)
    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "access"


def test_invalid_token_raises():
    with pytest.raises(JWTError):
        decode_access_token("not.a.valid.token")


def test_token_encryption_roundtrip():
    secret = "EAAGxxxxxxxxxxxxx_meta_token_here"
    encrypted = encrypt_token(secret)
    assert encrypted != secret
    assert decrypt_token(encrypted) == secret
