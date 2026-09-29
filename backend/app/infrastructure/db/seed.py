"""Demo customers with history, so the risk rules have something to compare against."""

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.domain.entities import Customer
from app.infrastructure.db.models import Base, CustomerModel
from app.infrastructure.db.repositories import to_row

DEMO_CUSTOMERS = [
    Customer(
        id="aigerim",
        name="Aigerim N. (Almaty)",
        language="kk",
        trusted_devices=["iphone-aigerim"],
        known_payees=["KZ12 Mother", "KZ34 Landlord"],
        avg_amount=40_000,
        has_large_p2p=False,
    ),
    Customer(
        id="timur",
        name="Timur S. (Tashkent)",
        language="uz",
        trusted_devices=["android-timur"],
        known_payees=["UZ55 Brother"],
        avg_amount=120_000,
        has_large_p2p=True,
    ),
    Customer(
        id="elena",
        name="Elena K. (Bishkek)",
        language="ky",
        trusted_devices=["android-elena"],
        known_payees=["KG77 Utilities"],
        avg_amount=25_000,
        has_large_p2p=False,
    ),
]


async def init_db(engine: AsyncEngine) -> None:
    # ponytail: create_all instead of Alembic; add migrations when the schema must evolve with data.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        for customer in DEMO_CUSTOMERS:
            await session.merge(to_row(CustomerModel, customer))
        await session.commit()
