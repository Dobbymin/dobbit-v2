#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/../.." && pwd)
TMP_DIR=$(mktemp -d)
CALL_COUNT_FILE="${TMP_DIR}/curl-call-count"
trap 'rm -rf "${TMP_DIR}"' EXIT

printf '0' > "${CALL_COUNT_FILE}"

cat > "${TMP_DIR}/curl" <<'FAKE_CURL'
#!/bin/bash

set -euo pipefail

COUNT_FILE=${NEWS_INGEST_TEST_CALL_COUNT_FILE:?}
COUNT=$(cat "${COUNT_FILE}")
COUNT=$((COUNT + 1))
printf '%s' "${COUNT}" > "${COUNT_FILE}"

case "${COUNT}" in
  1)
    printf '{"ok":true,"step":"ingest"}\n201\n'
    ;;
  2)
    printf '{"ok":true,"step":"review"}\n204\n'
    ;;
  *)
    printf 'Unexpected curl call #%s\n' "${COUNT}" >&2
    exit 1
    ;;
esac
FAKE_CURL
chmod +x "${TMP_DIR}/curl"

OUTPUT_FILE="${TMP_DIR}/run-news-ingest.out"
if ! (
  cd "${REPO_ROOT}"
  PATH="${TMP_DIR}:${PATH}" \
    INTERNAL_CRON_TOKEN=test-token \
    NEWS_INGEST_TEST_CALL_COUNT_FILE="${CALL_COUNT_FILE}" \
    bash ops/news-ingest/run-news-ingest.sh
) >"${OUTPUT_FILE}" 2>&1; then
  cat "${OUTPUT_FILE}" >&2
  exit 1
fi

CALL_COUNT=$(cat "${CALL_COUNT_FILE}")
if [ "${CALL_COUNT}" != "2" ]; then
  cat "${OUTPUT_FILE}" >&2
  echo "Expected curl to be called twice, got ${CALL_COUNT}" >&2
  exit 1
fi

if ! grep -q 'News ingest pipeline completed successfully' "${OUTPUT_FILE}"; then
  cat "${OUTPUT_FILE}" >&2
  echo "Expected success message in output" >&2
  exit 1
fi

cat "${OUTPUT_FILE}"
echo "PASS: run-news-ingest accepts HTTP 2xx responses for ingest and review"
