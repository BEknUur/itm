"""Read-only creation-cohort operational metrics, not fraud outcome labels."""

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

from app.application.interfaces import AuditLog, PaymentRepository
from app.domain.entities import PaymentStatus


@dataclass
class DailyAnalytics:
    date: date
    total: int = 0
    held: int = 0
    released: int = 0
    cancelled: int = 0


@dataclass
class OperationsAnalytics:
    start_date: date
    end_date: date
    total_payments: int
    held_payments: int
    current_held: int
    released_payments: int
    cancelled_payments: int
    cancelled_amount: float
    average_resolution_seconds: float | None
    daily: list[DailyAnalytics]


class GetOperationsAnalytics:
    """MVP aggregation using existing ports; no payment or audit writes.

    A non-null hold_until preserves the original hold after resolution. Decisions
    are current statuses, not decisions made during the selected period. The
    first resolution audit timestamp is used even if outside the date range.
    """

    def __init__(self, payments: PaymentRepository, audit: AuditLog) -> None:
        self._payments = payments
        self._audit = audit

    async def __call__(
        self, start_date: date | None = None, end_date: date | None = None
    ) -> OperationsAnalytics:
        today = datetime.now(UTC).date()
        start_date = start_date if start_date is not None else today - timedelta(days=6)
        end_date = end_date if end_date is not None else today
        days = (end_date - start_date).days + 1
        if days < 1:
            raise ValueError("start_date must be on or before end_date")
        if days > 366:
            raise ValueError("Date range must contain at most 366 inclusive UTC dates")

        daily = {
            day: DailyAnalytics(day)
            for offset in range(days)
            for day in [start_date + timedelta(days=offset)]
        }
        cohort = [
            payment
            for payment in await self._payments.list()
            if start_date <= payment.created_at.astimezone(UTC).date() <= end_date
        ]
        resolved_held = {
            payment.id: payment
            for payment in cohort
            if payment.hold_until is not None
            and payment.status in (PaymentStatus.RELEASED, PaymentStatus.CANCELLED)
        }
        first_decisions: dict[str, datetime] = {}
        if resolved_held:
            for event in await self._audit.all():
                if event.payment_id not in resolved_held or event.action not in (
                    "RELEASED", "CANCELLED"
                ):
                    continue
                previous = first_decisions.get(event.payment_id)
                if previous is None or event.created_at < previous:
                    first_decisions[event.payment_id] = event.created_at
        durations = [
            (decided_at - resolved_held[payment_id].created_at).total_seconds()
            for payment_id, decided_at in first_decisions.items()
        ]

        result = OperationsAnalytics(
            start_date=start_date,
            end_date=end_date,
            total_payments=len(cohort),
            held_payments=0,
            current_held=0,
            released_payments=0,
            cancelled_payments=0,
            cancelled_amount=0.0,
            average_resolution_seconds=sum(durations) / len(durations) if durations else None,
            daily=list(daily.values()),
        )
        for payment in cohort:
            bucket = daily[payment.created_at.astimezone(UTC).date()]
            bucket.total += 1
            if payment.hold_until is not None:
                result.held_payments += 1
                bucket.held += 1
            if payment.status is PaymentStatus.HELD:
                result.current_held += 1
            elif payment.status is PaymentStatus.RELEASED:
                result.released_payments += 1
                bucket.released += 1
            elif payment.status is PaymentStatus.CANCELLED:
                result.cancelled_payments += 1
                result.cancelled_amount += payment.amount
                bucket.cancelled += 1
        return result
