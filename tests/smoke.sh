#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if [ "$#" -gt 0 ]; then
  port="$1"
else
  port="$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)"
fi

python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  if curl -fsS "http://127.0.0.1:$port/index.html" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

fail=0
bash scripts/check-repo.sh || fail=1

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
node tests/physics-units.mjs
node tests/race-combat.mjs
node tests/target-filtering.mjs
node tests/camera-follow.mjs
python3 scripts/build-offline.py >/tmp/zombie-build.log
check dist/zombie-marble-run.html 'const RAPIER = globalThis.__RAPIER__'
check dist/zombie-marble-run.html 'PX_PER_METER'
node tests/offline-start.mjs
if ! grep -q 'type="module"' dist/zombie-marble-run.html; then
  echo "ok    dist/zombie-marble-run.html (no module imports)"
else
  echo "FAIL  dist/zombie-marble-run.html (contains module imports)"
  fail=1
fi

exit "$fail"
