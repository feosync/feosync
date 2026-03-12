"""Integration tests for authentication endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "SecurePass123",
            "org_name": "My Company",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient) -> None:
    payload = {
        "email": "dup@example.com",
        "password": "SecurePass123",
        "org_name": "Org",
    }
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@test.com", "password": "SecurePass123", "org_name": "Org"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@test.com", "password": "SecurePass123"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wrong@test.com", "password": "SecurePass123", "org_name": "Org"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@test.com", "password": "WrongPass123"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh(client: AsyncClient) -> None:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "refresh@test.com", "password": "SecurePass123", "org_name": "Org"},
    )
    refresh_token = reg.json()["refresh_token"]
    resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert resp.json()["refresh_token"] != refresh_token  # token rotation


@pytest.mark.asyncio
async def test_protected_endpoint_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/organizations/me")
    assert resp.status_code == 403  # no Bearer token


@pytest.mark.asyncio
async def test_get_organization(authenticated_client: AsyncClient) -> None:
    resp = await authenticated_client.get("/api/v1/organizations/me")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Org"
