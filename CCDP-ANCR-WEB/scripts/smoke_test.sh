#!/usr/bin/env bash
# CCDP post-deploy smoke test.
# Usage: BASE="https://your-domain.com" bash scripts/smoke_test.sh
set -euo pipefail

BASE="${BASE:-http://localhost:8001}"
echo "▶ Smoke testing $BASE"

echo -n "1) Health check ... "
curl -fsS "$BASE/api/health" | grep -q '"status":"ok"' && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "2) Public config ... "
curl -fsS "$BASE/api/config" | grep -q 'schedulingUrl' && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "3) Submit a test inquiry ... "
RESP=$(curl -fsS -X POST "$BASE/api/inquiries" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Smoke","lastName":"Test","organization":"Smoke Org","jobTitle":"QA","organizationType":"Other","email":"smoke-test@example.com","areaOfInterest":"General Inquiry","message":"Automated smoke test submission.","source":"smoke_test"}')
echo "$RESP" | grep -q '"status":"success"' && echo "OK" || { echo "FAIL: $RESP"; exit 1; }

echo -n "4) Admin endpoint is protected (expect 401) ... "
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/inquiries")
[ "$CODE" = "401" ] && echo "OK" || { echo "FAIL (got $CODE)"; exit 1; }

echo "✅ Smoke test passed. (Review/remove the test inquiry from the CRM if desired.)"
