#!/usr/bin/env bash
# v2-quota-agreement-check.sh
#
# Verifies that the per-tier monthly generate quota in TWO sources of truth
# agree byte-for-byte:
#   (a) src/types/index.ts  TIER_CONFIG.<tier>.generateQuotaPerMonth
#   (b) Postgres function   dragonmadeit_tier_monthly_quota('<tier>')
#
# The v2 plan promises "Postgres-as-the-contract" for orchestrator quota
# enforcement. Until app-side TS reads from the Postgres function, the
# two are manually synced — and this script is the safety net that catches
# drift before it ships. Wire into CI or a pre-commit if you want it
# enforced automatically.
#
# Exits 0 if all tiers agree. Exits 1 with a diff if anything mismatches.
#
# Usage:
#   set -a && . .env && set +a   # load DIRECT_URL
#   ./scripts/v2-quota-agreement-check.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TYPES_FILE="${REPO_ROOT}/src/types/index.ts"

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "ERROR: DIRECT_URL is not set. Run: set -a && . .env && set +a" >&2
  exit 2
fi

if [[ ! -f "$TYPES_FILE" ]]; then
  echo "ERROR: cannot find $TYPES_FILE" >&2
  exit 2
fi

TIERS=("FREE" "SCHEDULER" "CREATOR" "CLIPPER" "STUDIO" "STUDIO_PRO" "AGENCY")
MISMATCHES=0

printf "%-12s  %12s  %12s  %s\n" "TIER" "TS_CONFIG" "POSTGRES_FN" "RESULT"
printf "%-12s  %12s  %12s  %s\n" "------------" "------------" "------------" "------"

for tier in "${TIERS[@]}"; do
  # Extract the generateQuotaPerMonth value for this tier from TIER_CONFIG.
  # The TS shape is roughly:
  #   TIER_CONFIG: Record<Tier, TierLimits> = {
  #     FREE: { ..., generateQuotaPerMonth: 4, ... },
  #     ...
  #   }
  # awk pulls the first generateQuotaPerMonth value within the tier's block.
  ts_value=$(awk -v tier="$tier" '
    $0 ~ ("^  " tier ":[[:space:]]*\\{") { in_block = 1; next }
    in_block && /^  [A-Z_]+:[[:space:]]*\{/ { in_block = 0 }
    in_block && /generateQuotaPerMonth/ {
      match($0, /generateQuotaPerMonth:[[:space:]]*([0-9]+|null)/, m)
      if (m[1] != "") { print m[1]; exit }
    }
  ' "$TYPES_FILE")

  # Normalize: TS uses null for "tier does not generate" while the Postgres
  # function returns 0 for the same concept. Treat them as agreeing.
  if [[ "$ts_value" == "null" ]]; then
    ts_normalized=0
  elif [[ -z "$ts_value" ]]; then
    ts_normalized=""
  else
    ts_normalized="$ts_value"
  fi

  pg_value=$(psql "$DIRECT_URL" -At -c "SELECT dragonmadeit_tier_monthly_quota('${tier}');" 2>/dev/null || echo "")

  # AGENCY is intentionally asymmetric: TS uses 0 to mean "custom contract"
  # (the UI reads this to render the price as "Custom" instead of a number),
  # while Postgres uses 9999 as the orchestrator's "don't gate this tier"
  # sentinel (so Agency rows always pass the COALESCE(used,0) < cap check).
  # Document the expected pair; only flag DRIFT if neither side matches the
  # documented sentinels.
  if [[ "$tier" == "AGENCY" ]]; then
    if [[ "$ts_normalized" == "0" && "$pg_value" == "9999" ]]; then
      printf "%-12s  %12s  %12s  %s\n" "$tier" "${ts_value} (custom)" "${pg_value} (sentinel)" "ok"
      continue
    fi
    printf "%-12s  %12s  %12s  %s\n" "$tier" "${ts_value:-<null>}" "$pg_value" "AGENCY-PAIR-BROKEN (expect TS=0, PG=9999)"
    MISMATCHES=$((MISMATCHES + 1))
    continue
  fi

  if [[ -z "$ts_normalized" ]]; then
    printf "%-12s  %12s  %12s  %s\n" "$tier" "<missing>" "$pg_value" "DRIFT"
    MISMATCHES=$((MISMATCHES + 1))
  elif [[ "$ts_normalized" != "$pg_value" ]]; then
    printf "%-12s  %12s  %12s  %s\n" "$tier" "${ts_value}" "$pg_value" "DRIFT"
    MISMATCHES=$((MISMATCHES + 1))
  else
    printf "%-12s  %12s  %12s  %s\n" "$tier" "${ts_value:-<null>}" "$pg_value" "ok"
  fi
done

echo ""
if [[ "$MISMATCHES" -gt 0 ]]; then
  echo "FAIL: ${MISMATCHES} tier(s) drifted between TS and Postgres."
  echo "Update both:"
  echo "  - ${TYPES_FILE}     (TIER_CONFIG.<tier>.generateQuotaPerMonth)"
  echo "  - prisma/migrations/20260425_pipeline_v2_routing/migration.sql"
  echo "    (then re-deploy migration if changing the function body)"
  exit 1
fi

echo "PASS: all tier quotas agree."
