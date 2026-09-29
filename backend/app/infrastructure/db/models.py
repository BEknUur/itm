from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    type_annotation_map = {datetime: DateTime(timezone=True), dict: JSONB, list: JSONB}


class CustomerModel(Base):
    __tablename__ = "customers"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str]
    language: Mapped[str]
    trusted_devices: Mapped[list]
    known_payees: Mapped[list]
    avg_amount: Mapped[float] = mapped_column(Float)
    has_large_p2p: Mapped[bool]


class PaymentModel(Base):
    __tablename__ = "payments"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    customer_id: Mapped[str] = mapped_column(index=True)
    payee: Mapped[str]
    amount: Mapped[float] = mapped_column(Float)
    device_id: Mapped[str]
    failed_otp: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer)
    signals: Mapped[list]
    status: Mapped[str] = mapped_column(index=True)
    hold_until: Mapped[datetime | None]
    step_up_attempts: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime]


class AuditEventModel(Base):
    __tablename__ = "audit_events"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    payment_id: Mapped[str] = mapped_column(index=True)
    action: Mapped[str]
    actor: Mapped[str]
    details: Mapped[dict]
    created_at: Mapped[datetime]


class IncidentOutboxModel(Base):
    """What SafeStep would push to the National Anti-Fraud Center."""

    __tablename__ = "nafc_outbox"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    payment_id: Mapped[str]
    customer_id: Mapped[str]
    payee: Mapped[str]
    amount: Mapped[float] = mapped_column(Float)
    signals: Mapped[list]
    reason: Mapped[str]
    created_at: Mapped[datetime]
