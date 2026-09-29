from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from app.domain.errors import InvalidPaymentState


def _now() -> datetime:
    return datetime.now(UTC)


def _id() -> str:
    return uuid4().hex[:12]


class PaymentStatus(StrEnum):
    SENT = "SENT"
    HELD = "HELD"
    RELEASED = "RELEASED"
    CANCELLED = "CANCELLED"


@dataclass
class Customer:
    id: str
    name: str
    language: str
    trusted_devices: list[str]
    known_payees: list[str]
    avg_amount: float
    has_large_p2p: bool


@dataclass
class Payment:
    customer_id: str
    payee: str
    amount: float
    device_id: str
    failed_otp: int
    score: int = 0
    signals: list[str] = field(default_factory=list)
    status: PaymentStatus = PaymentStatus.SENT
    hold_until: datetime | None = None
    step_up_attempts: int = 0
    id: str = field(default_factory=_id)
    created_at: datetime = field(default_factory=_now)

    def __post_init__(self) -> None:
        self.status = PaymentStatus(self.status)

    def hold(self, until: datetime) -> None:
        self.status = PaymentStatus.HELD
        self.hold_until = until

    def release(self) -> None:
        self._ensure_held()
        self.status = PaymentStatus.RELEASED

    def cancel(self) -> None:
        self._ensure_held()
        self.status = PaymentStatus.CANCELLED

    def _ensure_held(self) -> None:
        if self.status is not PaymentStatus.HELD:
            raise InvalidPaymentState(f"Payment {self.id} is {self.status}, not HELD")


@dataclass
class AuditEvent:
    payment_id: str
    action: str
    actor: str
    details: dict
    id: str = field(default_factory=_id)
    created_at: datetime = field(default_factory=_now)


@dataclass
class Incident:
    """Read-only record pushed to the National Anti-Fraud Center feed."""

    payment_id: str
    customer_id: str
    payee: str
    amount: float
    signals: list[str]
    reason: str
    id: str = field(default_factory=_id)
    created_at: datetime = field(default_factory=_now)
