"""Explainable risk score: rules + weights, not a black box.

Each rule is its own class, so adding a signal means adding a class,
not editing the scorer (open/closed).
"""

from dataclasses import dataclass
from typing import Protocol

from app.domain.entities import Customer


@dataclass(frozen=True)
class PaymentContext:
    customer: Customer
    payee: str
    amount: float
    device_id: str
    failed_otp: int


class RiskRule(Protocol):
    code: str
    weight: int

    def matches(self, ctx: PaymentContext) -> bool: ...


@dataclass(frozen=True)
class NewPayee:
    weight: int = 30
    code: str = "NEW_PAYEE"

    def matches(self, ctx: PaymentContext) -> bool:
        return ctx.payee not in ctx.customer.known_payees


@dataclass(frozen=True)
class UnusualAmount:
    multiplier: float
    weight: int = 25
    code: str = "UNUSUAL_AMOUNT"

    def matches(self, ctx: PaymentContext) -> bool:
        return ctx.amount > ctx.customer.avg_amount * self.multiplier


@dataclass(frozen=True)
class FirstLargeP2P:
    large_amount: float
    weight: int = 20
    code: str = "FIRST_LARGE_P2P"

    def matches(self, ctx: PaymentContext) -> bool:
        return ctx.amount >= self.large_amount and not ctx.customer.has_large_p2p


@dataclass(frozen=True)
class NewDevice:
    weight: int = 15
    code: str = "NEW_DEVICE"

    def matches(self, ctx: PaymentContext) -> bool:
        return ctx.device_id not in ctx.customer.trusted_devices


@dataclass(frozen=True)
class FailedOtp:
    min_failures: int
    weight: int = 10
    code: str = "FAILED_OTP"

    def matches(self, ctx: PaymentContext) -> bool:
        return ctx.failed_otp >= self.min_failures


@dataclass(frozen=True)
class RiskResult:
    score: int
    signals: list[str]


class RiskScorer:
    def __init__(self, rules: list[RiskRule]) -> None:
        self._rules = rules

    def score(self, ctx: PaymentContext) -> RiskResult:
        hits = [r for r in self._rules if r.matches(ctx)]
        return RiskResult(
            score=min(100, sum(r.weight for r in hits)),
            signals=[r.code for r in hits],
        )
