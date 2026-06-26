#!/bin/bash

set -euo pipefail

# Script: News Ingest Runner
# Purpose: Trigger news ingest and prediction review via HTTP
# Runs: On systemd timer (daily 10:12 KST)

# Get token from environment or docker/.env
TOKEN="${INTERNAL_CRON_TOKEN:-}"

if [ -z "$TOKEN" ] && [ -f "docker/.env" ]; then
  TOKEN=$(grep '^INTERNAL_CRON_TOKEN=' docker/.env 2>/dev/null | cut -d'=' -f2- | tr -d '\n' | sed -e 's/^["'"'"']//' -e 's/["'"'"']$//' || true)
fi

if [ -z "$TOKEN" ]; then
  echo "Error: INTERNAL_CRON_TOKEN not found in environment or docker/.env" >&2
  exit 1
fi

# API endpoint (localhost only, Pi deployment)
API_HOST="http://127.0.0.1:3003/api"
TIMEOUT_SECONDS=600

echo "Starting news ingest pipeline at $(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Step 1: Ingest news
echo "Calling ingest endpoint..."
INGEST_RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" \
  -X POST "${API_HOST}/news/ingest" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: ${TOKEN}" \
  -d '{"requestedBy":"PI_TIMER"}' \
  -w "\n%{http_code}") || {
  echo "Error: Ingest request failed" >&2
  exit 1
}

INGEST_HTTP_CODE=$(echo "$INGEST_RESPONSE" | tail -1)
INGEST_BODY=$(echo "$INGEST_RESPONSE" | head -n -1)

if [[ ! "$INGEST_HTTP_CODE" =~ ^2[0-9][0-9]$ ]]; then
  echo "Error: Ingest returned HTTP $INGEST_HTTP_CODE" >&2
  echo "$INGEST_BODY" >&2
  exit 1
fi

echo "Ingest response: $INGEST_BODY"

# Step 2: Review predictions
echo "Calling review endpoint..."
REVIEW_RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" \
  -X POST "${API_HOST}/news/predictions/review" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: ${TOKEN}" \
  -w "\n%{http_code}") || {
  echo "Error: Review request failed" >&2
  exit 1
}

REVIEW_HTTP_CODE=$(echo "$REVIEW_RESPONSE" | tail -1)
REVIEW_BODY=$(echo "$REVIEW_RESPONSE" | head -n -1)

if [[ ! "$REVIEW_HTTP_CODE" =~ ^2[0-9][0-9]$ ]]; then
  echo "Error: Review returned HTTP $REVIEW_HTTP_CODE" >&2
  echo "$REVIEW_BODY" >&2
  exit 1
fi

echo "Review response: $REVIEW_BODY"

echo "News ingest pipeline completed successfully at $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
exit 0
