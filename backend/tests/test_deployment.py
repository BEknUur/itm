import pytest

from app.core.config import Settings


@pytest.mark.parametrize("url,expected", [
    ("postgres://user:password@postgres.railway.internal:5432/railway", "postgresql+asyncpg://user:password@postgres.railway.internal:5432/railway"),
    ("postgresql://user:p%40ss@host:5432/db?ssl=require", "postgresql+asyncpg://user:p%40ss@host:5432/db?ssl=require"),
    ("postgresql+asyncpg://user:password@host/db", "postgresql+asyncpg://user:password@host/db"),
])
def test_normalize_railway_postgres_url(url, expected):
    settings = Settings(database_url=url, test_database_url=url)
    assert settings.database_url == expected
    assert settings.test_database_url == expected


def test_railway_reference_environment_variable(monkeypatch):
    monkeypatch.setenv("SAFESTEP_DATABASE_URL", "postgresql://user:password@postgres.railway.internal:5432/railway")
    assert Settings().database_url == "postgresql+asyncpg://user:password@postgres.railway.internal:5432/railway"


@pytest.mark.parametrize("path", ["/api/health", "/api/customers", "/api/payments/does-not-exist", "/api/audit/export.csv"])
def test_dynamic_api_responses_are_not_cached_by_cdn(client, path):
    response = client.get(path)
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["CDN-Cache-Control"] == "no-store"
    assert response.headers["Vercel-CDN-Cache-Control"] == "no-store"
