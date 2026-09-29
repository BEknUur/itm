from dataclasses import fields

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import AuditEvent, Customer, Incident, Payment, PaymentStatus
from app.infrastructure.db.models import (
    AuditEventModel,
    CustomerModel,
    IncidentOutboxModel,
    PaymentModel,
)


# Entities and rows share field names, so one pair of mappers serves every table.
def to_row(model_cls, entity):
    return model_cls(**{f.name: getattr(entity, f.name) for f in fields(entity)})


def to_entity(entity_cls, row):
    return entity_cls(**{f.name: getattr(row, f.name) for f in fields(entity_cls)})


class SqlCustomerRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def get(self, customer_id: str) -> Customer | None:
        row = await self._s.get(CustomerModel, customer_id)
        return to_entity(Customer, row) if row else None

    async def list(self) -> list[Customer]:
        rows = await self._s.scalars(select(CustomerModel).order_by(CustomerModel.name))
        return [to_entity(Customer, r) for r in rows]


class SqlPaymentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def get(self, payment_id: str) -> Payment | None:
        row = await self._s.get(PaymentModel, payment_id)
        return to_entity(Payment, row) if row else None

    async def add(self, payment: Payment) -> None:
        self._s.add(to_row(PaymentModel, payment))

    async def update(self, payment: Payment) -> None:
        await self._s.merge(to_row(PaymentModel, payment))

    async def list(self, status: PaymentStatus | None = None) -> list[Payment]:
        query = select(PaymentModel).order_by(PaymentModel.created_at.desc())
        if status is not None:
            query = query.where(PaymentModel.status == status.value)
        return [to_entity(Payment, r) for r in await self._s.scalars(query)]


class SqlAuditLog:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def record(self, event: AuditEvent) -> None:
        self._s.add(to_row(AuditEventModel, event))

    async def for_payment(self, payment_id: str) -> list[AuditEvent]:
        query = (
            select(AuditEventModel)
            .where(AuditEventModel.payment_id == payment_id)
            .order_by(AuditEventModel.created_at)
        )
        return [to_entity(AuditEvent, r) for r in await self._s.scalars(query)]

    async def all(self) -> list[AuditEvent]:
        query = select(AuditEventModel).order_by(AuditEventModel.created_at)
        return [to_entity(AuditEvent, r) for r in await self._s.scalars(query)]


class OutboxIncidentGateway:
    """ponytail: writes to an outbox table instead of calling the real Center API.
    Live national wiring is post-MVP; swap this class for an HTTP client then."""

    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def report(self, incident: Incident) -> None:
        self._s.add(to_row(IncidentOutboxModel, incident))

    async def list(self) -> list[Incident]:
        query = select(IncidentOutboxModel).order_by(IncidentOutboxModel.created_at.desc())
        return [to_entity(Incident, r) for r in await self._s.scalars(query)]


class SqlTransactionManager:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def commit(self) -> None:
        await self._s.commit()
