from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

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
