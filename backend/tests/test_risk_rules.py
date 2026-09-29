from app.domain.entities import Customer
from app.domain.risk_rules import (
    FailedOtp,
    FirstLargeP2P,
    NewDevice,
    NewPayee,
    PaymentContext,
    RiskScorer,
    UnusualAmount,
)
from app.domain.warnings import build_warning

CUSTOMER = Customer(
    id="c1",
    name="Test",
    language="kk",
    trusted_devices=["phone-1"],
    known_payees=["Mom"],
    avg_amount=40_000,
    has_large_p2p=False,
)
SCORER = RiskScorer(
    [NewPayee(), UnusualAmount(3), FirstLargeP2P(500_000), NewDevice(), FailedOtp(2)]
)


def test_routine_payment_scores_zero():
    result = SCORER.score(PaymentContext(CUSTOMER, "Mom", 30_000, "phone-1", 0))
    assert result.score == 0 and result.signals == []


def test_fake_security_call_hits_every_signal():
    result = SCORER.score(PaymentContext(CUSTOMER, "Safe account", 900_000, "new-phone", 3))
    assert result.signals == [
        "NEW_PAYEE", "UNUSUAL_AMOUNT", "FIRST_LARGE_P2P", "NEW_DEVICE", "FAILED_OTP"
    ]
    assert result.score == 100


def test_warning_explains_signals_in_customer_language():
    w = build_warning("kk", ["NEW_PAYEE"], 30)
    assert w.language == "kk" and w.reasons == ["Жаңа алушы"] and "30" in w.body
    assert build_warning("xx", [], 30).language == "ru"
