# Pi Local Systemd Timer Implementation Summary

**Completed**: 2026-06-20

## Deliverables

All files created in `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/ops/news-ingest/`:

### 1. `run-news-ingest.sh` (executable bash script)
- **Purpose**: Runner script executed by systemd timer
- **Features**:
  - Reads `INTERNAL_CRON_TOKEN` from environment or `docker/.env`
  - Sequential POST requests to `/api/news/ingest` then `/api/news/predictions/review`
  - 600-second timeout per request
  - HTTP response validation (2xx only)
  - JSON request body with `"requestedBy":"PI_TIMER"`
  - Secure token passing via `X-Internal-Token` header
  - No credential logging (response bodies only)
  - Error exit codes for non-2xx responses

### 2. `dobbit-news-ingest.service`
- **Type**: oneshot
- **WorkingDirectory**: `/home/dobbymin/project/dobbit-v2` (Pi deployment path)
- **ExecStart**: Absolute path to runner script
- **Output**: journald logging (`StandardOutput=journal`, `StandardError=journal`)
- **Environment**: Optional `docker/.env` sourcing via `EnvironmentFiles=-`

### 3. `dobbit-news-ingest.timer`
- **Schedule**: Daily at 10:07 AM UTC (`OnCalendar=*-*-* 10:07:00`)
- **Persistent**: `true` — catch-up execution if Pi was offline
- **Accuracy**: 1-minute window
- **Target**: Requires `dobbit-news-ingest.service`

### 4. `README.md`
- Installation steps (copy units, reload systemd, enable timer)
- Verification commands (list-timers, status, journalctl)
- Configuration reference (token source, schedule, endpoints, timeout)
- Troubleshooting guide (manual trigger, log inspection, API connectivity)

## Verification Checklist

- [x] Script syntax valid (`bash -n` check passed)
- [x] systemd units have valid INI structure
- [x] Token sourcing: environment var OR docker/.env
- [x] Two sequential curl POST requests
- [x] 600-second timeout per request
- [x] HTTP response validation (exits 1 on non-2xx)
- [x] Token passed securely in header, never logged
- [x] Absolute paths reference Pi deployment directory
- [x] Daily schedule at 10:07 (KST-compatible)
- [x] Persistent=true for boot catch-up
- [x] README with installation, verification, and troubleshooting

## Deployment Path

Files are deployed to Pi at: `/home/dobbymin/project/dobbit-v2/ops/news-ingest/`

systemd units are installed to: `/etc/systemd/system/`

## Next Steps

1. Commit files to repo (branch: `chore/pi-news-ingest-timer`)
2. SSH to Pi and run installation commands from README
3. Verify timer registration: `systemctl list-timers dobbit-news-ingest.timer`
4. Monitor first execution: `journalctl -u dobbit-news-ingest.service -f`
