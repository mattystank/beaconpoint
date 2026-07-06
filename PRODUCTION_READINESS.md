# BeaconPoint Production Readiness

This checklist separates code-complete items from infra/deployment tasks you must finish before real rollout.

## Code-Complete In This Repo

- Device auth and pairing flow.
- Fleet command queue with retry/timeout reconciliation.
- OTA command orchestration (update, bulk update, rollback).
- Proof-of-play ingestion and admin query.
- Basic monitoring summary endpoint and audit log endpoint.
- CORS allowlist support and write/auth rate limiting.

## Required Before Real Deployment

1. Public HTTPS endpoints (no local IPs)
- Deploy backend behind TLS (Nginx, Traefik, ALB, Cloudflare Tunnel, etc.).
- Deploy dashboard and player under HTTPS domains.
- Set backend and player URL config to production domains.

2. Reliable startup/kiosk watchdog on TV hardware
- Use a watchdog on device OS (systemd or supervisor).
- Auto-launch browser/webview in kiosk mode at boot.
- Auto-restart player process on crash/network recovery.

3. OTA artifact delivery hardening
- Host signed release artifacts and immutable manifests.
- Validate SHA256 checksums in player before marking OTA executed.
- Maintain staged rollout policy (canary -> batch -> full fleet).

4. Monitoring, alerts, retention operations
- Run periodic retention cleanup job calling:
  - POST /proof-of-play/retention/enforce
- Poll monitoring endpoint and alert when thresholds fail:
  - GET /monitoring/alerts
- Export logs/metrics to external system (Grafana/Datadog/CloudWatch).

5. Production DB/object-storage secrets and backups
- Move SQLite to managed PostgreSQL for production.
- Store secrets in secret manager (not env files committed to repo).
- Enable DB backups and point-in-time recovery.
- Enable object storage versioning/lifecycle policy.

6. Network and auth hardening
- Restrict CORS allowlist to exact domains.
- Set strong SECRET_KEY and token TTLs.
- Rotate credentials and API keys on schedule.
- Add WAF/firewall rules and IP restrictions for admin surfaces.

## Recommended Environment Variables

- SECRET_KEY=<strong-random-secret>
- DATABASE_URL=postgresql://...
- CORS_ALLOW_ORIGINS=https://admin.example.com,https://player.example.com
- ACCESS_TOKEN_EXPIRE_MINUTES=15
- REFRESH_TOKEN_EXPIRE_DAYS=30
- DEVICE_COMMAND_DELIVERY_TIMEOUT_SECONDS=45
- DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS=3
- POP_RETENTION_DAYS=30
- RATE_LIMIT_WINDOW_SECONDS=60
- RATE_LIMIT_MAX_REQUESTS=1000

Object storage:
- OBJECT_STORAGE_PROVIDER=s3
- OBJECT_STORAGE_BUCKET=<bucket-name>
- OBJECT_STORAGE_REGION=<region>
- OBJECT_STORAGE_ENDPOINT_URL=<optional-r2-or-custom>
- OBJECT_STORAGE_PUBLIC_BASE_URL=https://cdn.example.com

## Go/No-Go for Device Registration

Register devices only when all of these are true:
- Backend and player are reachable over HTTPS from your target devices.
- Admin login and pairing flow works in production domain.
- At least one OTA release exists with valid checksum.
- Monitoring endpoint is wired into alerting.
- Backup and restore runbook is tested.
