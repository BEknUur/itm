from dataclasses import dataclass

from app.application.interfaces import AuditLog, IncidentGateway, PaymentRepository
from app.domain.entities import AuditEvent, Incident, Payment
from app.domain.errors import NotFound


@dataclass(frozen=True)
class HoldPolicy:
    risk_threshold: int
    hold_minutes: int
    max_step_up_attempts: int


async def get_payment_or_raise(payments: PaymentRepository, payment_id: str) -> Payment:
    payment = await payments.get(payment_id)
    if payment is None:
        raise NotFound(f"Payment {payment_id} not found")
    return payment


class HoldResolver:
    """The only two ways a hold ends — shared by customer step-up and agent fast-release."""

    def __init__(
        self, payments: PaymentRepository, audit: AuditLog, gateway: IncidentGateway
    ) -> None:
        self._payments = payments
        self._audit = audit
        self._gateway = gateway

    async def release(self, payment: Payment, actor: str, reason: str) -> Payment:
        payment.release()
        await self._payments.update(payment)
        await self._audit.record(
            AuditEvent(payment.id, "RELEASED", actor, {"reason": reason})
        )
        return payment

    async def cancel_as_fraud(self, payment: Payment, actor: str, reason: str) -> Payment:
        payment.cancel()
        await self._payments.update(payment)
        await self._audit.record(
            AuditEvent(payment.id, "CANCELLED", actor, {"reason": reason})
        )
        incident = Incident(
            payment_id=payment.id,
            customer_id=payment.customer_id,
            payee=payment.payee,
            amount=payment.amount,
            signals=payment.signals,
            reason=reason,
        )
        await self._gateway.report(incident)
        await self._audit.record(
            AuditEvent(payment.id, "NAFC_REPORTED", "safestep", {"incident_id": incident.id})
        )
        return payment
