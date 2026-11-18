#!/usr/bin/env bash
set -euo pipefail
port="${1:-8000}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
echo "Serving $root at http://localhost:$port/"
echo "On another device, use this machine's LAN IP with the same port."
exec python3 -m http.server "$port" --bind 0.0.0.0
