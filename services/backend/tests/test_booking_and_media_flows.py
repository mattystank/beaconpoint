import datetime
import os
import pathlib
import sys
import uuid

from fastapi.testclient import TestClient
import pytest


# Force a dedicated SQLite db for tests before importing app modules.
TEST_DB_PATH = pathlib.Path(__file__).resolve().parent.parent / "beaconpoint_test.db"
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

sys.path.append(str(pathlib.Path(__file__).resolve().parent.parent))

from main import app  # noqa: E402
from main import media_staging_sessions  # noqa: E402


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def login_admin(client: TestClient) -> str:
    res = client.post(
        "/auth/login",
        json={"email": "admin@beaconpoint.local", "password": "TestMe123!"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def create_user_and_login(client: TestClient, email: str) -> str:
    signup = client.post(
        "/auth/signup",
        json={"email": email, "password": "TestMe123!", "role": "advertiser"},
    )
    assert signup.status_code == 200

    login = client.post(
        "/auth/login",
        json={"email": email, "password": "TestMe123!"},
    )
    assert login.status_code == 200
    return login.json()["access_token"]


def create_active_ad(client: TestClient, token: str, title: str, media_suffix: str) -> str:
    response = client.post(
        "/ads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": title,
            "description": "test",
            "media_url": f"https://cdn.example.com/{media_suffix}.jpg",
            "media_type": "image",
            "duration_seconds": 15,
            "status": "active",
            "media_size_bytes": 512000,
            "width": 1200,
            "height": 628,
        },
    )
    assert response.status_code == 200
    return response.json()["id"]


def get_first_screen_id(client: TestClient, token: str) -> str:
    screens = client.get("/screens", headers={"Authorization": f"Bearer {token}"})
    assert screens.status_code == 200
    data = screens.json()
    assert len(data) > 0
    return data[0]["id"]


def device_auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_booking_transition_rules_are_enforced(client: TestClient) -> None:
    admin_token = login_admin(client)
    advertiser_token = create_user_and_login(client, f"booking-transitions-{uuid.uuid4().hex}@example.com")
    screen_id = get_first_screen_id(client, advertiser_token)
    ad_id = create_active_ad(client, advertiser_token, "Transition Ad", f"transition-{uuid.uuid4().hex}")

    now = datetime.datetime.utcnow() + datetime.timedelta(days=3)
    end = now + datetime.timedelta(days=2)
    create_booking = client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "screen_id": screen_id,
            "ad_id": ad_id,
            "start_date": now.isoformat(),
            "end_date": end.isoformat(),
            "total_price": 220.0,
            "status": "pending",
        },
    )
    assert create_booking.status_code == 200
    booking_id = create_booking.json()["id"]

    approve = client.put(
        f"/bookings/{booking_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "approved"},
    )
    assert approve.status_code == 200
    assert approve.json()["status"] == "approved"

    invalid = client.put(
        f"/bookings/{booking_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "completed"},
    )
    assert invalid.status_code == 400
    assert "Invalid status transition" in invalid.json()["detail"]


def test_availability_and_overlap_conflicts(client: TestClient) -> None:
    advertiser_token = create_user_and_login(client, f"booking-overlap-{uuid.uuid4().hex}@example.com")
    screen_id = get_first_screen_id(client, advertiser_token)
    ad_a = create_active_ad(client, advertiser_token, "Overlap Ad A", f"overlap-a-{uuid.uuid4().hex}")
    ad_b = create_active_ad(client, advertiser_token, "Overlap Ad B", f"overlap-b-{uuid.uuid4().hex}")

    start = datetime.datetime.utcnow() + datetime.timedelta(days=10)
    end = start + datetime.timedelta(days=2)

    first = client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "screen_id": screen_id,
            "ad_id": ad_a,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "total_price": 180.0,
            "status": "pending",
        },
    )
    assert first.status_code == 200

    availability = client.get(
        f"/screens/{screen_id}/availability",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        params={
            "start_date": (start + datetime.timedelta(hours=1)).isoformat(),
            "end_date": (end - datetime.timedelta(hours=1)).isoformat(),
        },
    )
    assert availability.status_code == 200
    body = availability.json()
    assert body["available"] is False
    assert len(body["conflicts"]) >= 1

    overlapping = client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "screen_id": screen_id,
            "ad_id": ad_b,
            "start_date": (start + datetime.timedelta(hours=2)).isoformat(),
            "end_date": end.isoformat(),
            "total_price": 190.0,
            "status": "pending",
        },
    )
    assert overlapping.status_code == 409


def test_media_staging_request_and_complete(client: TestClient) -> None:
    advertiser_token = create_user_and_login(client, f"media-staging-{uuid.uuid4().hex}@example.com")

    request_session = client.post(
        "/media/staging/request",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "filename": f"creative-{uuid.uuid4().hex}.jpg",
            "media_type": "image",
            "media_size_bytes": 2048,
            "width": 1080,
            "height": 1080,
            "duration_seconds": 10,
            "content_sha256": "a" * 64,
        },
    )
    assert request_session.status_code == 200
    payload = request_session.json()
    assert payload["upload_url"].startswith("https://uploads.beaconpoint.local/staging/")

    complete = client.post(
        "/media/staging/complete",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "upload_id": payload["upload_id"],
            "upload_token": payload["headers"]["x-beaconpoint-upload-token"],
            "final_media_url": payload["final_media_url"],
        },
    )
    assert complete.status_code == 200
    assert complete.json()["media_type"] == "image"


def test_media_staging_complete_forbidden_for_other_user(client: TestClient) -> None:
    owner_token = create_user_and_login(client, f"media-owner-{uuid.uuid4().hex}@example.com")
    attacker_token = create_user_and_login(client, f"media-attacker-{uuid.uuid4().hex}@example.com")

    request_session = client.post(
        "/media/staging/request",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "filename": f"creative-{uuid.uuid4().hex}.jpg",
            "media_type": "image",
            "media_size_bytes": 4096,
            "width": 1080,
            "height": 1080,
            "duration_seconds": 8,
        },
    )
    assert request_session.status_code == 200
    payload = request_session.json()

    forbidden = client.post(
        "/media/staging/complete",
        headers={"Authorization": f"Bearer {attacker_token}"},
        json={
            "upload_id": payload["upload_id"],
            "upload_token": payload["headers"].get("x-beaconpoint-upload-token"),
            "final_media_url": payload["final_media_url"],
        },
    )
    assert forbidden.status_code == 403
    assert "does not belong" in forbidden.json()["detail"]


def test_media_staging_complete_rejects_expired_session(client: TestClient) -> None:
    advertiser_token = create_user_and_login(client, f"media-expiry-{uuid.uuid4().hex}@example.com")

    request_session = client.post(
        "/media/staging/request",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "filename": f"creative-{uuid.uuid4().hex}.jpg",
            "media_type": "image",
            "media_size_bytes": 4096,
            "width": 1200,
            "height": 628,
            "duration_seconds": 9,
        },
    )
    assert request_session.status_code == 200
    payload = request_session.json()

    media_staging_sessions[payload["upload_id"]]["expires_at"] = datetime.datetime.utcnow() - datetime.timedelta(seconds=1)

    expired = client.post(
        "/media/staging/complete",
        headers={"Authorization": f"Bearer {advertiser_token}"},
        json={
            "upload_id": payload["upload_id"],
            "upload_token": payload["headers"].get("x-beaconpoint-upload-token"),
            "final_media_url": payload["final_media_url"],
        },
    )
    assert expired.status_code == 401
    assert "expired" in expired.json()["detail"].lower()


def test_device_registry_bootstrap_and_playlist_flow(client: TestClient) -> None:
    admin_token = login_admin(client)
    advertiser_token = create_user_and_login(client, f"device-playlist-{uuid.uuid4().hex}@example.com")
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "Living Room TV"},
    )
    assert register.status_code == 200
    reg_body = register.json()
    device_id = reg_body["device_id"]
    pairing_code = reg_body["pairing_code"]

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": device_id, "pairing_code": pairing_code},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    session = client.get("/devices/session", headers=device_auth(device_token))
    assert session.status_code == 200
    assert session.json()["screen_id"] == screen_id

    playlist = client.get("/devices/playlist", headers=device_auth(device_token))
    assert playlist.status_code == 200
    playlist_body = playlist.json()
    assert isinstance(playlist_body["checksum"], str)
    assert len(playlist_body["checksum"]) == 64
    assert isinstance(playlist_body["items"], list)

    unpair = client.post(f"/devices/{device_id}/unpair", headers=device_auth(admin_token))
    assert unpair.status_code == 200

    session_after_unpair = client.get("/devices/session", headers=device_auth(device_token))
    assert session_after_unpair.status_code == 403


def test_device_command_queue_and_ack_flow(client: TestClient) -> None:
    admin_token = login_admin(client)
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "Fleet Command Test Device"},
    )
    assert register.status_code == 200
    reg_body = register.json()
    device_id = reg_body["device_id"]

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": device_id, "pairing_code": reg_body["pairing_code"]},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    enqueue = client.post(
        f"/devices/{device_id}/commands",
        headers=device_auth(admin_token),
        json={"command": "sync_now", "payload": {"reason": "test"}},
    )
    assert enqueue.status_code == 200
    command_id = enqueue.json()["id"]

    next_command = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert next_command.status_code == 200
    cmd = next_command.json()["command"]
    assert cmd is not None
    assert cmd["id"] == command_id
    assert cmd["command"] == "sync_now"

    ack = client.post(
        f"/devices/commands/{command_id}/ack",
        headers=device_auth(device_token),
        json={"status": "executed", "result": {"ok": True}},
    )
    assert ack.status_code == 200
    assert ack.json()["status"] == "executed"

    bulk_enqueue = client.post(
        "/devices/commands/bulk",
        headers=device_auth(admin_token),
        json={"device_ids": [device_id], "command": "restart"},
    )
    assert bulk_enqueue.status_code == 200
    assert bulk_enqueue.json()["queued"] == 1

    restart_cmd = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert restart_cmd.status_code == 200
    restart_command_id = restart_cmd.json()["command"]["id"]
    assert restart_cmd.json()["command"]["command"] == "restart"

    restart_ack = client.post(
        f"/devices/commands/{restart_command_id}/ack",
        headers=device_auth(device_token),
        json={"status": "executed", "result": {"ok": True}},
    )
    assert restart_ack.status_code == 200
    assert restart_ack.json()["status"] == "executed"

    none_left = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert none_left.status_code == 200
    assert none_left.json()["command"] is None


def test_device_ota_update_and_rollback_flow(client: TestClient) -> None:
    admin_token = login_admin(client)
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "OTA Test Device"},
    )
    assert register.status_code == 200
    reg_body = register.json()
    device_id = reg_body["device_id"]

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": device_id, "pairing_code": reg_body["pairing_code"]},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    create_release_1 = client.post(
        "/player/releases",
        headers=device_auth(admin_token),
        json={
            "version": "1.0.0",
            "manifest_url": "https://downloads.example.com/player/1.0.0/manifest.json",
            "checksum": "a" * 64,
            "notes": "baseline",
            "is_active": True,
        },
    )
    assert create_release_1.status_code == 200

    create_release_2 = client.post(
        "/player/releases",
        headers=device_auth(admin_token),
        json={
            "version": "1.1.0",
            "manifest_url": "https://downloads.example.com/player/1.1.0/manifest.json",
            "checksum": "b" * 64,
            "notes": "feature release",
            "is_active": True,
        },
    )
    assert create_release_2.status_code == 200

    hb_initial = client.post(
        "/devices/heartbeat",
        headers=device_auth(device_token),
        json={
            "playback_state": "idle",
            "player_version": "1.0.0",
            "update_status": "executed",
        },
    )
    assert hb_initial.status_code == 200

    enqueue_update = client.post(
        f"/devices/{device_id}/ota/update",
        headers=device_auth(admin_token),
        json={"version": "1.1.0"},
    )
    assert enqueue_update.status_code == 200

    update_cmd = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert update_cmd.status_code == 200
    update_command_body = update_cmd.json()["command"]
    assert update_command_body is not None
    assert update_command_body["command"] == "apply_release"
    assert update_command_body["payload"]["version"] == "1.1.0"

    update_ack = client.post(
        f"/devices/commands/{update_command_body['id']}/ack",
        headers=device_auth(device_token),
        json={"status": "executed", "result": {"fromVersion": "1.0.0", "toVersion": "1.1.0"}},
    )
    assert update_ack.status_code == 200

    hb_after_update = client.post(
        "/devices/heartbeat",
        headers=device_auth(device_token),
        json={
            "playback_state": "idle",
            "player_version": "1.1.0",
            "previous_player_version": "1.0.0",
            "update_status": "executed",
        },
    )
    assert hb_after_update.status_code == 200

    rollback = client.post(
        f"/devices/{device_id}/ota/rollback",
        headers=device_auth(admin_token),
    )
    assert rollback.status_code == 200
    assert rollback.json()["target_version"] == "1.0.0"

    rollback_cmd = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert rollback_cmd.status_code == 200
    rollback_command_body = rollback_cmd.json()["command"]
    assert rollback_command_body is not None
    assert rollback_command_body["command"] == "apply_release"
    assert rollback_command_body["payload"]["version"] == "1.0.0"


def test_device_proof_of_play_ingest_and_admin_query(client: TestClient) -> None:
    admin_token = login_admin(client)
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "PoP Device"},
    )
    assert register.status_code == 200
    reg_body = register.json()

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": reg_body["device_id"], "pairing_code": reg_body["pairing_code"]},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    proof = client.post(
        "/devices/proof-of-play",
        headers=device_auth(device_token),
        json={
            "content_hash": "abc123",
            "duration_seconds": 15,
        },
    )
    assert proof.status_code == 200
    assert proof.json()["device_id"] == reg_body["device_id"]

    listed = client.get(
        "/proof-of-play",
        headers=device_auth(admin_token),
        params={"device_id": reg_body["device_id"]},
    )
    assert listed.status_code == 200
    rows = listed.json()
    assert len(rows) >= 1
    assert rows[0]["device_id"] == reg_body["device_id"]


def test_command_retry_timeout_and_history_panel_data(client: TestClient) -> None:
    admin_token = login_admin(client)
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "Retry Test Device"},
    )
    assert register.status_code == 200
    reg_body = register.json()
    device_id = reg_body["device_id"]

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": device_id, "pairing_code": reg_body["pairing_code"]},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    enqueue = client.post(
        f"/devices/{device_id}/commands",
        headers=device_auth(admin_token),
        json={"command": "restart"},
    )
    assert enqueue.status_code == 200
    command_id = enqueue.json()["id"]

    pull1 = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert pull1.status_code == 200
    assert pull1.json()["command"]["id"] == command_id

    reconcile1 = client.post(
        "/devices/commands/reconcile",
        headers=device_auth(admin_token),
        params={"older_than_seconds": 0},
    )
    assert reconcile1.status_code == 200
    assert reconcile1.json()["requeued"] >= 1

    pull2 = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert pull2.status_code == 200
    assert pull2.json()["command"]["id"] == command_id

    reconcile2 = client.post(
        "/devices/commands/reconcile",
        headers=device_auth(admin_token),
        params={"older_than_seconds": 0},
    )
    assert reconcile2.status_code == 200

    pull3 = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert pull3.status_code == 200
    assert pull3.json()["command"]["id"] == command_id

    reconcile3 = client.post(
        "/devices/commands/reconcile",
        headers=device_auth(admin_token),
        params={"older_than_seconds": 0},
    )
    assert reconcile3.status_code == 200
    assert reconcile3.json()["failed"] >= 1

    none_left = client.get("/devices/commands/next", headers=device_auth(device_token))
    assert none_left.status_code == 200
    assert none_left.json()["command"] is None

    history = client.get(
        "/devices/commands/history",
        headers=device_auth(admin_token),
        params={"device_id": device_id, "status_filter": "failed", "limit": 20},
    )
    assert history.status_code == 200
    rows = history.json()
    assert len(rows) >= 1
    assert rows[0]["id"] == command_id
    assert rows[0]["status"] == "failed"
    assert rows[0]["delivery_attempts"] >= rows[0]["max_delivery_attempts"]


def test_release_checksum_validation_and_ops_monitoring_endpoints(client: TestClient) -> None:
    admin_token = login_admin(client)

    bad_checksum_release = client.post(
        "/player/releases",
        headers=device_auth(admin_token),
        json={
            "version": "2.0.0",
            "manifest_url": "https://downloads.example.com/player/2.0.0/manifest.json",
            "checksum": "NOT_A_SHA256",
            "notes": "invalid checksum",
            "is_active": True,
        },
    )
    assert bad_checksum_release.status_code == 400

    retention_cleanup = client.post(
        "/proof-of-play/retention/enforce",
        headers=device_auth(admin_token),
        params={"retention_days": 1},
    )
    assert retention_cleanup.status_code == 200
    assert "deleted" in retention_cleanup.json()

    alerts = client.get(
        "/monitoring/alerts",
        headers=device_auth(admin_token),
    )
    assert alerts.status_code == 200
    alert_body = alerts.json()
    assert "offline_devices" in alert_body
    assert "failed_commands_last_hour" in alert_body
    assert "proof_of_play_events_last_hour" in alert_body

    audit_logs = client.get(
        "/audit/logs",
        headers=device_auth(admin_token),
        params={"limit": 100},
    )
    assert audit_logs.status_code == 200
    rows = audit_logs.json()
    assert isinstance(rows, list)
    # At least one retention/audit action should be present from the call above.
    assert any(row.get("action") == "proof_of_play.retention.enforce" for row in rows)


def test_rollback_noop_guard_when_already_on_previous_version(client: TestClient) -> None:
    admin_token = login_admin(client)
    screen_id = get_first_screen_id(client, admin_token)

    register = client.post(
        "/devices/register",
        headers=device_auth(admin_token),
        json={"screen_id": screen_id, "name": "Rollback Guard Device"},
    )
    assert register.status_code == 200
    reg_body = register.json()
    device_id = reg_body["device_id"]

    bootstrap = client.post(
        "/devices/bootstrap",
        json={"device_id": device_id, "pairing_code": reg_body["pairing_code"]},
    )
    assert bootstrap.status_code == 200
    device_token = bootstrap.json()["device_token"]

    release_prev = client.post(
        "/player/releases",
        headers=device_auth(admin_token),
        json={
            "version": "3.0.0",
            "manifest_url": "https://downloads.example.com/player/3.0.0/manifest.json",
            "checksum": "c" * 64,
            "notes": "rollback target",
            "is_active": True,
        },
    )
    assert release_prev.status_code == 200

    hb = client.post(
        "/devices/heartbeat",
        headers=device_auth(device_token),
        json={
            "playback_state": "idle",
            "player_version": "3.0.0",
            "previous_player_version": "3.0.0",
            "update_status": "executed",
        },
    )
    assert hb.status_code == 200

    rollback_noop = client.post(
        f"/devices/{device_id}/ota/rollback",
        headers=device_auth(admin_token),
    )
    assert rollback_noop.status_code == 400
    assert "already on target rollback version" in rollback_noop.json()["detail"]
