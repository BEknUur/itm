"""Feature 5: contact-centre agent clears a genuine payment (or stops a fraud) in seconds."""

from app.application.common import HoldResolver, get_payment_or_raise
from app.application.interfaces import PaymentRepository, TransactionManager
from app.domain.entities import Payment, PaymentStatus


class ListHolds:
    def __init__(self, payments: PaymentRepository) -> None:
        self._payments = payments

    async def __call__(self) -> list[Payment]:
        return await self._payments.list(PaymentStatus.HELD)


class ListPayments:
    def __init__(self, payments: PaymentRepository) -> None:
        self._payments = payments

    async def __call__(self) -> list[Payment]:
        return await self._payments.list()


class ReleaseHold:
    def __init__(
        self, payments: PaymentRepository, resolver: HoldResolver, tx: TransactionManager
    ) -> None:
        self._payments = payments
        self._resolver = resolver
        self._tx = tx

    async def __call__(self, payment_id: str, agent: str, reason: str) -> Payment:
        payment = await get_payment_or_raise(self._payments, payment_id)
        await self._resolver.release(payment, f"agent:{agent}", reason)
        await self._tx.commit()
        return payment


class CancelHold:
    def __init__(
        self, payments: PaymentRepository, resolver: HoldResolver, tx: TransactionManager
    ) -> None:
        self._payments = payments
        self._resolver = resolver
        self._tx = tx

    async def __call__(self, payment_id: str, agent: str, reason: str) -> Payment:
        payment = await get_payment_or_raise(self._payments, payment_id)
        await self._resolver.cancel_as_fraud(payment, f"agent:{agent}", reason)
        await self._tx.commit()
        return payment
