# Dobbit News Ingest — User-Level Systemd Timer Setup

Automated news ingest pipeline that runs daily on the Raspberry Pi via user-level systemd timer.

## Prerequisites

On the Pi, enable user lingering for dobbymin (one-time setup):

```bash
sudo loginctl enable-linger dobbymin
```

This allows the user-level timer to run even when the user is not logged in.

## Installation

1. **Navigate to the project directory:**

   ```bash
   cd /home/dobbymin/project/dobbit-v2
   ```

2. **Create user systemd directory:**

   ```bash
   mkdir -p ~/.config/systemd/user
   ```

3. **Copy timer and service files:**

   ```bash
   cp ops/news-ingest/dobbit-news-ingest.{service,timer} ~/.config/systemd/user/
   ```

4. **Reload and enable the timer:**

   ```bash
   systemctl --user daemon-reload
   systemctl --user enable --now dobbit-news-ingest.timer
   ```

## Verification

**Check timer status:**
```bash
systemctl --user list-timers dobbit-news-ingest.timer
systemctl --user status dobbit-news-ingest.timer
```

**View service logs:**
```bash
journalctl --user -u dobbit-news-ingest.service -n 50 --follow
```

**Check last execution:**
```bash
journalctl --user -u dobbit-news-ingest.service --since "1 hour ago"
```

## Configuration

- **Token source:** Reads `INTERNAL_CRON_TOKEN` from environment or `docker/.env`
- **Schedule:** Daily at 10:12 AM (system timezone configured as Asia/Seoul in systemd)
- **Timeout:** 600 seconds (10 minutes) per HTTP request
- **Endpoints:**
  - `POST http://127.0.0.1:3003/api/news/ingest`
  - `POST http://127.0.0.1:3003/api/news/predictions/review`

## Troubleshooting

**Timer not running:**
```bash
systemctl --user start dobbit-news-ingest.service
systemctl --user status dobbit-news-ingest.service
journalctl --user -u dobbit-news-ingest.service -n 20 -f
```

**Linger not enabled:**
If the timer stops after logout, ensure `sudo loginctl enable-linger dobbymin` was run and try logging in again.

**Token not found:**
Check that `docker/.env` exists and contains `INTERNAL_CRON_TOKEN=<value>`, or set the environment variable before running the service.

**API not responding:**
Ensure the NestJS API (`apps/api`) is running on port 3003. Check `docker ps` and network logs.

## Deployment (CI/CD)

The `.github/workflows/deploy.yml` workflow automatically installs this user-level timer on every deployment. Manual installation is typically only needed for development environments.
