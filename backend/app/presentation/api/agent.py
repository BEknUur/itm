"""Contact-centre side: holds queue, fast-release, audit trail, NAFC feed."""

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from app.application.use_cases.audit import ExportAuditCsv, GetAuditTrail, ListIncidents
from app.application.use_cases.fast_release import CancelHold, ListHolds, ListPayments, ReleaseHold
from app.presentation.api.schemas import AgentDecisionIn, AuditEventOut, IncidentOut, PaymentOut

router = APIRouter(route_class=DishkaRoute, tags=["contact centre"])


@router.get("/agent/holds", response_model=list[PaymentOut])
async def list_holds(uc: FromDishka[ListHolds]):
    return await uc()


@router.get("/agent/payments", response_model=list[PaymentOut])
async def list_payments(uc: FromDishka[ListPayments]):
    return await uc()


@router.post("/agent/holds/{payment_id}/release", response_model=PaymentOut)
async def release_hold(payment_id: str, body: AgentDecisionIn, uc: FromDishka[ReleaseHold]):
    return await uc(payment_id, body.agent, body.reason)


@router.post("/agent/holds/{payment_id}/cancel", response_model=PaymentOut)
async def cancel_hold(payment_id: str, body: AgentDecisionIn, uc: FromDishka[CancelHold]):
    return await uc(payment_id, body.agent, body.reason)


@router.get("/audit/export.csv", response_class=PlainTextResponse)
async def export_audit(uc: FromDishka[ExportAuditCsv]):
    return PlainTextResponse(
        await uc(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=safestep-audit.csv"},
    )


@router.get("/audit/{payment_id}", response_model=list[AuditEventOut])
async def audit_trail(payment_id: str, uc: FromDishka[GetAuditTrail]):
    return await uc(payment_id)


@router.get("/nafc/incidents", response_model=list[IncidentOut])
async def list_incidents(uc: FromDishka[ListIncidents]):
    return await uc()
