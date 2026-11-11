import pytest

from tests.test_flows import confirm


@pytest.mark.parametrize("action,status", [("release", "RELEASED"), ("cancel", "CANCELLED")])
def test_explicit_reason_trimmed_and_preserved(client, action, status):
    payment = confirm(client)
    response = client.post(f"/api/agent/holds/{payment['id']}/{action}", json={"agent": " Dana ", "reason": "  Explicit review  "})
    assert response.status_code == 200
    assert response.json()["status"] == status
    events = client.get(f"/api/audit/{payment['id']}").json()
    decision = next(e for e in events if e["action"] == status)
    assert decision["actor"] == "agent:Dana"
    assert decision["details"]["reason"] == "Explicit review"


def test_blank_operator_is_rejected(client):
    payment = confirm(client)
    response = client.post(f"/api/agent/holds/{payment['id']}/release", json={"agent": "  ", "reason": "Explicit review"})
    assert response.status_code == 422
    assert client.get(f"/api/payments/{payment['id']}").json()["status"] == "HELD"
