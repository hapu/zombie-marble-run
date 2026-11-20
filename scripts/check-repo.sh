#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

fail=0
ok() { echo "ok    $1"; }
bad() { echo "FAIL  $1"; fail=1; }

required=(
  README.md
  WORKSHOP.md
  AGENTS.md
  PROJECT_CONTEXT.md
  HANDOFF.md
  TODO.md
  DECISIONS.md
  DEVELOPMENT_LOG.md
  docs/ARCHITECTURE.md
  docs/PROVIDERS.md
  docs/ROADMAP.md
  docs/SECURITY.md
  docs/WORKFLOW.md
  src/physicsUnits.js
  config/examples/env.example
  scripts/check-words.sh
  scripts/check-repo.sh
  scripts/serve.sh
  scripts/build-offline.py
  tests/physics-units.mjs
  tests/smoke.sh
  vendor/rapier.mjs
  vendor/LICENSE.rapier
)

for path in "${required[@]}"; do
  if [ -s "$path" ]; then
    ok "$path"
  else
    bad "$path (missing or empty)"
  fi
done

if git rev-parse --git-dir >/dev/null 2>&1; then
  secrets="$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '(^|/)\.env\.example$' || true)"
  if [ -z "$secrets" ]; then
    ok "no tracked .env files"
  else
    echo "FAIL  tracked .env files:"
    echo "$secrets"
    fail=1
  fi
else
  echo "skip  git checks (not a git repo)"
fi

for script in scripts/*.sh tests/*.sh; do
  [ -f "$script" ] || continue
  if bash -n "$script"; then
    ok "$script syntax"
  else
    bad "$script syntax"
  fi
done

if command -v python3 >/dev/null 2>&1; then
  if python3 - <<'PY'
from pathlib import Path
import re
import sys

files = [Path("README.md"), Path("WORKSHOP.md"), Path("AGENTS.md"), *Path("docs").glob("*.md")]
bad = []
for path in files:
    if not path.is_file():
        continue
    text = path.read_text(encoding="utf-8")
    for match in re.finditer(r"\]\(([^)]+)\)", text):
        target = match.group(1).strip().split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            bad.append(f"{path}: {target}")
if bad:
    print("FAIL  local Markdown links:")
    print("\n".join(bad))
    sys.exit(1)
print("ok    local Markdown links")
PY
  then
    :
  else
    fail=1
  fi
else
  echo "skip  local Markdown links (python3 not found)"
fi

exit "$fail"
