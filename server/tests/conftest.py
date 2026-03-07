"""
Pytest configuration and fixtures.
"""
import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.app.database.base import Base
from src.app.database.session import get_db
from src.app.main import app

TEST_DATABASE_URL = "postgresql+asyncpg://feosync:feosync_pass@localhost:5432/feosync_test"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionFactory = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionFactory() as session:
        yield session
        await session.rollback()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def authenticated_client(client: AsyncClient) -> AsyncClient:
    """Client with a valid JWT token for a freshly registered user."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@feosync.com",
            "password": "SecurePass123",
            "org_name": "Test Org",
        },
    )
    assert response.status_code == 201
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client
