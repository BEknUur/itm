"""End-to-end: Confirm -> Score -> Hold -> Step-up / Fast-release, against Postgres."""

FRAUD = {
    "customer_id": "aigerim",
    "payee": "KZ99 Safe account",
    "amount": 900_000,
    "device_id": "unknown-android",
    "failed_otp": 2,
}


def confirm(client, **overrides):
    r = client.post("/api/payments/confirm", json={**FRAUD, **overrides})
    assert r.status_code == 200, r.text
    return r.json()


def test_routine_payment_goes_through(client):
    p = confirm(client, payee="KZ12 Mother", amount=20_000, device_id="iphone-aigerim", failed_otp=0)
    assert p["status"] == "SENT" and p["hold_until"] is None


def test_high_risk_payment_is_held_with_warning(client):
    p = confirm(client)
    assert p["status"] == "HELD" and p["score"] >= 50 and p["hold_until"]

    w = client.get(f"/api/payments/{p['id']}/warning").json()
    assert w["language"] == "kk" and len(w["reasons"]) == len(p["signals"])
    assert client.get(f"/api/payments/{p['id']}/warning?lang=uz").json()["language"] == "uz"
    assert [h["id"] for h in client.get("/api/agent/holds").json()] == [p["id"]]


def test_fraudster_device_cannot_pass_step_up(client):
    p = confirm(client)
    for _ in range(3):
        r = client.post(f"/api/payments/{p['id']}/step-up/approve", json={"device_id": "unknown-android"})
        assert r.status_code == 403
    # locked after max attempts, even from the real device
    r = client.post(f"/api/payments/{p['id']}/step-up/approve", json={"device_id": "iphone-aigerim"})
    assert r.status_code == 423
    assert client.get(f"/api/payments/{p['id']}").json()["status"] == "HELD"


def test_owner_approves_on_trusted_device(client):
    p = confirm(client)
    r = client.post(f"/api/payments/{p['id']}/step-up/approve", json={"device_id": "iphone-aigerim"})
    assert r.json()["status"] == "RELEASED"


def test_not_me_cancels_and_reports_to_nafc(client):
    p = confirm(client)
    assert client.post(f"/api/payments/{p['id']}/step-up/deny").json()["status"] == "CANCELLED"

    incidents = client.get("/api/nafc/incidents").json()
    assert [i["payment_id"] for i in incidents] == [p["id"]]
    actions = [e["action"] for e in client.get(f"/api/audit/{p['id']}").json()]
    assert actions == ["SCORED", "HELD", "CANCELLED", "NAFC_REPORTED"]


def test_agent_fast_release_and_double_decision_rejected(client):
    p = confirm(client)
    decision = {"agent": "Dana", "reason": "customer called, genuine rent payment"}
    r = client.post(f"/api/agent/holds/{p['id']}/release", json=decision)
    assert r.json()["status"] == "RELEASED"
    assert client.post(f"/api/agent/holds/{p['id']}/cancel", json=decision).status_code == 409

    events = client.get(f"/api/audit/{p['id']}").json()
    assert events[-1]["actor"] == "agent:Dana"
    csv = client.get("/api/audit/export.csv").text
    assert csv.startswith("created_at,payment_id") and "RELEASED" in csv


def test_unknown_ids_return_404(client):
    assert client.get("/api/payments/nope").status_code == 404
    assert client.post("/api/payments/confirm", json={**FRAUD, "customer_id": "nope"}).status_code == 404
