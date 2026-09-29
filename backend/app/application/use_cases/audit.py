"""Features 6, 7: explainable audit trail and the Anti-Fraud Center incident feed."""

import csv
import io
import json

from app.application.interfaces import AuditLog, IncidentGateway
from app.domain.entities import AuditEvent, Incident


class GetAuditTrail:
    def __init__(self, audit: AuditLog) -> None:
        self._audit = audit

    async def __call__(self, payment_id: str) -> list[AuditEvent]:
        return await self._audit.for_payment(payment_id)


class ExportAuditCsv:
    def __init__(self, audit: AuditLog) -> None:
        self._audit = audit

    async def __call__(self) -> str:
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(["created_at", "payment_id", "action", "actor", "details"])
        for e in await self._audit.all():
            writer.writerow(
                [e.created_at.isoformat(), e.payment_id, e.action, e.actor,
                 json.dumps(e.details, ensure_ascii=False)]
            )
        return buf.getvalue()


class ListIncidents:
    def __init__(self, gateway: IncidentGateway) -> None:
        self._gateway = gateway

    async def __call__(self) -> list[Incident]:
        return await self._gateway.list()
