from datetime import UTC, datetime, timedelta

import pytest

from app.domain.entities import AuditEvent, Payment
from app.infrastructure.db.models import AuditEventModel, PaymentModel
from app.infrastructure.db.repositories import to_row


def test_empty_analytics_and_zero_filled_days(client):
    response = client.get("/api/agent/analytics?start_date=2000-01-01&end_date=2000-01-03")
    assert response.status_code == 200
    data = response.json()
    assert data["total_payments"] == 0
    assert data["average_resolution_seconds"] is None
    assert [r["date"] for r in data["daily"]] == ["2000-01-01", "2000-01-02", "2000-01-03"]
    assert all(r["total"] == 0 for r in data["daily"])


@pytest.mark.parametrize("query", [
    "start_date=2000-01-03&end_date=2000-01-01",
    "start_date=2000-01-01&end_date=2001-01-01",
    "start_date=garbage", "start_date=2026-02-30", "start_date=20260101",
])
def test_invalid_analytics_interval(client, query):
    assert client.get(f"/api/agent/analytics?{query}").status_code == 422


def test_default_analytics_has_seven_utc_dates(client):
    data = client.get("/api/agent/analytics").json()
    assert len(data["daily"]) == 7
    assert data["end_date"] == datetime.now(UTC).date().isoformat()


def test_analytics_mixed_created_cohort_and_decision_time(client):
    # Fixtures are inserted only into the allowlisted test database.
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from tests.conftest import TEST_DB

    start = datetime(2026, 1, 2, tzinfo=UTC)
    payments = [
        Payment("aigerim", "routine", 10, "trusted", 0, created_at=start),
        Payment("aigerim", "held", 20, "trusted", 0, status="HELD", hold_until=start + timedelta(minutes=30), created_at=start),
        Payment("aigerim", "released", 30, "trusted", 0, status="RELEASED", hold_until=start + timedelta(minutes=30), created_at=start),
        Payment("aigerim", "cancelled", 40, "trusted", 0, status="CANCELLED", hold_until=start + timedelta(minutes=30), created_at=start + timedelta(hours=23, minutes=59)),
        Payment("aigerim", "missing-event", 50, "trusted", 0, status="RELEASED", hold_until=start + timedelta(minutes=30), created_at=start),
        Payment("aigerim", "outside-before", 100, "trusted", 0, created_at=start - timedelta(microseconds=1)),
        Payment("aigerim", "outside-after", 100, "trusted", 0, created_at=start + timedelta(days=1)),
    ]
    events = [
        AuditEvent(payments[2].id, "RELEASED", "agent:Dana", {}, created_at=start + timedelta(seconds=60)),
        AuditEvent(payments[2].id, "RELEASED", "agent:Dana", {}, created_at=start + timedelta(seconds=90)),
        AuditEvent(payments[3].id, "CANCELLED", "agent:Dana", {}, created_at=payments[3].created_at + timedelta(seconds=120)),
    ]

    async def seed():
        engine = create_async_engine(TEST_DB)
        async with async_sessionmaker(engine)() as session:
            session.add_all([to_row(PaymentModel, p) for p in payments])
            session.add_all([to_row(AuditEventModel, e) for e in events])
            await session.commit()
        await engine.dispose()

    asyncio.run(seed())
    data = client.get("/api/agent/analytics?start_date=2026-01-02&end_date=2026-01-02").json()
    assert data["total_payments"] == 5
    assert data["held_payments"] == 4
    assert data["current_held"] == 1
    assert data["released_payments"] == 2
    assert data["cancelled_payments"] == 1
    assert data["cancelled_amount"] == 40
    assert data["average_resolution_seconds"] == 90
    assert data["daily"] == [{"date": "2026-01-02", "total": 5, "held": 4, "released": 2, "cancelled": 1}]
