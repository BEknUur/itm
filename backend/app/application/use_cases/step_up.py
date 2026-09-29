"""Feature 3: bank-initiated in-app step-up that a caller on the phone cannot complete."""

from app.application.common import HoldPolicy, HoldResolver, get_payment_or_raise
from app.application.interfaces import (
    AuditLog,
    CustomerRepository,
    PaymentRepository,
    TransactionManager,
)
from app.domain.entities import AuditEvent, Payment
from app.domain.errors import StepUpLocked, UntrustedDevice


class ApproveStepUp:
    def __init__(
        self,
        payments: PaymentRepository,
        customers: CustomerRepository,
        audit: AuditLog,
        resolver: HoldResolver,
        policy: HoldPolicy,
        tx: TransactionManager,
    ) -> None:
        self._payments = payments
        self._customers = customers
        self._audit = audit
        self._resolver = resolver
        self._policy = policy
        self._tx = tx

    async def __call__(self, payment_id: str, device_id: str) -> Payment:
        payment = await get_payment_or_raise(self._payments, payment_id)
        actor = f"customer:{payment.customer_id}"

        if payment.step_up_attempts >= self._policy.max_step_up_attempts:
            raise StepUpLocked("Too many attempts. A contact-centre agent must review.")

        customer = await self._customers.get(payment.customer_id)
        if customer is None or device_id not in customer.trusted_devices:
            payment.step_up_attempts += 1
            await self._payments.update(payment)
            await self._audit.record(
                AuditEvent(
                    payment.id,
                    "STEP_UP_FAILED",
                    actor,
                    {"device_id": device_id, "attempt": payment.step_up_attempts},
                )
            )
            await self._tx.commit()
            raise UntrustedDevice("Step-up must be approved from the customer's own device")

        await self._resolver.release(payment, actor, "step-up approved on trusted device")
        await self._tx.commit()
        return payment


class DenyStepUp:
    """Customer taps "It's not me" — the hold caught a fraud attempt."""

    def __init__(
        self, payments: PaymentRepository, resolver: HoldResolver, tx: TransactionManager
    ) -> None:
        self._payments = payments
        self._resolver = resolver
        self._tx = tx

    async def __call__(self, payment_id: str) -> Payment:
        payment = await get_payment_or_raise(self._payments, payment_id)
        await self._resolver.cancel_as_fraud(
            payment, f"customer:{payment.customer_id}", "customer denied payment in app"
        )
        await self._tx.commit()
        return payment
