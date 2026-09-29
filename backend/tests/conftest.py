import asyncio

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import Settings
from app.infrastructure.db.models import Base
from app.main import create_app

TEST_DB = Settings().test_database_url


async def _reset_db() -> None:
    engine = create_async_engine(TEST_DB)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
def client():
    asyncio.run(_reset_db())
    with TestClient(create_app(Settings(database_url=TEST_DB))) as c:
        yield c
