from datetime import date, datetime
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.entities import PaymentStatus


class _Out(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CustomerOut(_Out):
    id: str
    name: str
    language: str
    trusted_devices: list[str]
    known_payees: list[str]
    avg_amount: float


class ConfirmPaymentIn(BaseModel):
    customer_id: str
    payee: str = Field(min_length=1)
    amount: float = Field(gt=0)
    device_id: str = Field(min_length=1)
    failed_otp: int = Field(0, ge=0)


class PaymentOut(_Out):
    id: str
    customer_id: str
    payee: str
    amount: float
    device_id: str
    score: int
    signals: list[str]
    status: PaymentStatus
    hold_until: datetime | None
    step_up_attempts: int
    created_at: datetime


class WarningOut(_Out):
    language: str
    title: str
    body: str
    action: str
    confirm_label: str
    deny_label: str
    reasons: list[str]


class StepUpApproveIn(BaseModel):
    device_id: str = Field(min_length=1)


class AgentDecisionIn(BaseModel):
    agent: str = Field(min_length=1)
    reason: str = Field(min_length=1)

    @field_validator("agent", "reason")
    @classmethod
    def explicit_nonblank_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("An explicit nonblank value is required")
        return value


class AuditEventOut(_Out):
    id: str
    payment_id: str
    action: str
    actor: str
    details: dict
    created_at: datetime


class IncidentOut(_Out):
    id: str
    payment_id: str
    customer_id: str
    payee: str
    amount: float
    signals: list[str]
    reason: str
    created_at: datetime


class AnalyticsQuery(BaseModel):
    start_date: date | None = None
    end_date: date | None = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def iso_date_only(cls, value):
        if isinstance(value, str) and not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
            raise ValueError("Use an ISO date in YYYY-MM-DD format")
        return value


class DailyAnalyticsOut(_Out):
    date: date
    total: int
    held: int
    released: int
    cancelled: int


class OperationsAnalyticsOut(_Out):
    start_date: date
    end_date: date
    total_payments: int
    held_payments: int
    current_held: int
    released_payments: int
    cancelled_payments: int
    cancelled_amount: float
    average_resolution_seconds: float | None
    daily: list[DailyAnalyticsOut]
