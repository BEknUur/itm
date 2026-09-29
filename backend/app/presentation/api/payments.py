"""Mobile-banking side: Confirm, hold warning, in-app step-up."""

from typing import Literal

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter

from app.application.use_cases.payments import (
    ConfirmPayment,
    ConfirmPaymentCommand,
    GetHoldWarning,
    GetPayment,
    ListCustomers,
)
from app.application.use_cases.step_up import ApproveStepUp, DenyStepUp
from app.presentation.api.schemas import (
    ConfirmPaymentIn,
    CustomerOut,
    PaymentOut,
    StepUpApproveIn,
    WarningOut,
)

router = APIRouter(route_class=DishkaRoute, tags=["mobile banking"])


@router.get("/customers", response_model=list[CustomerOut])
async def list_customers(uc: FromDishka[ListCustomers]):
    return await uc()


@router.post("/payments/confirm", response_model=PaymentOut)
async def confirm_payment(body: ConfirmPaymentIn, uc: FromDishka[ConfirmPayment]):
    return await uc(ConfirmPaymentCommand(**body.model_dump()))


@router.get("/payments/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: str, uc: FromDishka[GetPayment]):
    return await uc(payment_id)


@router.get("/payments/{payment_id}/warning", response_model=WarningOut)
async def get_warning(
    payment_id: str,
    uc: FromDishka[GetHoldWarning],
    lang: Literal["ru", "kk", "uz", "ky"] | None = None,
):
    return await uc(payment_id, lang)


@router.post("/payments/{payment_id}/step-up/approve", response_model=PaymentOut)
async def approve_step_up(
    payment_id: str, body: StepUpApproveIn, uc: FromDishka[ApproveStepUp]
):
    return await uc(payment_id, body.device_id)


@router.post("/payments/{payment_id}/step-up/deny", response_model=PaymentOut)
async def deny_step_up(payment_id: str, uc: FromDishka[DenyStepUp]):
    return await uc(payment_id)
