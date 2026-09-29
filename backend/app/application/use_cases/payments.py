"""Features 1, 2, 4: risk score at Confirm, automatic hold, multilingual warning."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from app.application.common import HoldPolicy, get_payment_or_raise
from app.application.interfaces import (
    AuditLog,
    CustomerRepository,
    PaymentRepository,
    TransactionManager,
)
from app.domain.entities import AuditEvent, Customer, Payment
from app.domain.errors import NotFound
from app.domain.risk_rules import PaymentContext, RiskScorer
from app.domain.warnings import HoldWarning, build_warning


@dataclass(frozen=True)
class ConfirmPaymentCommand:
    customer_id: str
    payee: str
    amount: float
    device_id: str
    failed_otp: int = 0


class ConfirmPayment:
    def __init__(
        self,
        customers: CustomerRepository,
        payments: PaymentRepository,
        audit: AuditLog,
        scorer: RiskScorer,
        policy: HoldPolicy,
        tx: TransactionManager,
    ) -> None:
        self._customers = customers
        self._payments = payments
        self._audit = audit
        self._scorer = scorer
        self._policy = policy
        self._tx = tx

    async def __call__(self, cmd: ConfirmPaymentCommand) -> Payment:
        customer = await self._customers.get(cmd.customer_id)
        if customer is None:
            raise NotFound(f"Customer {cmd.customer_id} not found")

        risk = self._scorer.score(
            PaymentContext(customer, cmd.payee, cmd.amount, cmd.device_id, cmd.failed_otp)
        )
        payment = Payment(
            customer_id=customer.id,
            payee=cmd.payee,
            amount=cmd.amount,
            device_id=cmd.device_id,
            failed_otp=cmd.failed_otp,
            score=risk.score,
            signals=risk.signals,
        )
        if risk.score >= self._policy.risk_threshold:
            payment.hold(datetime.now(UTC) + timedelta(minutes=self._policy.hold_minutes))

        await self._payments.add(payment)
        await self._audit.record(
            AuditEvent(
                payment.id,
                "SCORED",
                "safestep",
                {"score": risk.score, "signals": risk.signals, "threshold": self._policy.risk_threshold},
            )
        )
        await self._audit.record(
            AuditEvent(
                payment.id,
                payment.status.value,
                "safestep",
                {"hold_until": payment.hold_until.isoformat() if payment.hold_until else None},
            )
        )
        await self._tx.commit()
        return payment


class GetPayment:
    def __init__(self, payments: PaymentRepository) -> None:
        self._payments = payments

    async def __call__(self, payment_id: str) -> Payment:
        return await get_payment_or_raise(self._payments, payment_id)


class GetHoldWarning:
    def __init__(
        self, payments: PaymentRepository, customers: CustomerRepository, policy: HoldPolicy
    ) -> None:
        self._payments = payments
        self._customers = customers
        self._policy = policy

    async def __call__(self, payment_id: str, language: str | None) -> HoldWarning:
        payment = await get_payment_or_raise(self._payments, payment_id)
        if language is None:
            customer = await self._customers.get(payment.customer_id)
            language = customer.language if customer else "ru"
        return build_warning(language, payment.signals, self._policy.hold_minutes)


class ListCustomers:
    def __init__(self, customers: CustomerRepository) -> None:
        self._customers = customers

    async def __call__(self) -> list[Customer]:
        return await self._customers.list()
