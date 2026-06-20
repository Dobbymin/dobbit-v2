# Dobbit News Ingest — Pi Systemd Timer Setup

Automated news ingest pipeline that runs daily on the Raspberry Pi via systemd timer instead of GitHub Actions.

## Installation

1. **Copy systemd units to the Pi:**

   ```bash
   sudo cp dobbit-news-ingest.{service,timer} /etc/systemd/system/
   ```

2. **Copy the runner script to the deployment path:**

   ```bash
   sudo mkdir -p /home/dobbymin/project/dobbit-v2/ops/news-ingest
   sudo cp run-news-ingest.sh /home/dobbymin/project/dobbit-v2/ops/news-ingest/
   sudo chmod +x /home/dobbymin/project/dobbit-v2/ops/news-ingest/run-news-ingest.sh
   ```

3. **Reload systemd and enable the timer:**

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now dobbit-news-ingest.timer
   ```

## Verification

**Check timer status:**
```bash
systemctl list-timers dobbit-news-ingest.timer
systemctl status dobbit-news-ingest.timer
```

**View service logs:**
```bash
journalctl -u dobbit-news-ingest.service -n 50 --follow
```

**Check last execution:**
```bash
journalctl -u dobbit-news-ingest.service --since "1 hour ago"
```

## Configuration

- **Token source:** Reads `INTERNAL_CRON_TOKEN` from environment or `docker/.env`
- **Schedule:** Daily at 10:12 KST (`OnCalendar=*-*-* 10:12:00 Asia/Seoul` — timezone set explicitly, independent of system timezone)
- **Timeout:** 600 seconds (10 minutes) per HTTP request
- **Endpoints:**
  - `POST http://127.0.0.1:3003/api/news/ingest`
  - `POST http://127.0.0.1:3003/api/news/predictions/review`

## Troubleshooting

**Timer not running:**
```bash
sudo systemctl start dobbit-news-ingest.timer
sudo systemctl status dobbit-news-ingest.service
```

**Token not found:**
Check that `docker/.env` exists and contains `INTERNAL_CRON_TOKEN=<value>`, or set `INTERNAL_CRON_TOKEN` in the environment before running the service.

**API not responding:**
Ensure the NestJS API (`apps/api`) is running on port 3003. Check API logs and network connectivity from the Pi.

**Manual trigger (for testing):**
```bash
sudo systemctl start dobbit-news-ingest.service
journalctl -u dobbit-news-ingest.service -n 20 -f
```
