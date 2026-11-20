#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
port="${1:-8123}"
cd "$root"

python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT
sleep 1

fail=0
check() {
  local path="$1" marker="$2"
  if curl -fsS "http://127.0.0.1:$port/$path" | grep -q "$marker"; then
    echo "ok    $path"
  else
    echo "FAIL  $path"
    fail=1
  fi
}

check index.html 'id="game"'
check vendor/rapier.mjs 'WebAssembly'
check src/main.js 'new RAPIER.World'

python3 scripts/build-offline.py >/tmp/zombie-build.log
check dist/zombie-marble-run.html 'const RAPIER = globalThis.__RAPIER__'
if ! grep -q 'type="module"' dist/zombie-marble-run.html; then
  echo "ok    dist/zombie-marble-run.html (no module imports)"
else
  echo "FAIL  dist/zombie-marble-run.html (contains module imports)"
  fail=1
fi

exit "$fail"
