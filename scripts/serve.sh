#!/usr/bin/env bash
set -euo pipefail
bind="127.0.0.1"
if [[ "${1:-}" == "--lan" ]]; then
  bind="0.0.0.0"
  shift
fi
if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [--lan] [port]" >&2
  exit 2
fi

port="${1:-8000}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
if [[ "$bind" == "0.0.0.0" ]]; then
  echo "WARNING: Serving the repository on all interfaces without authentication."
  echo "Use --lan only on a trusted, firewalled LAN; do not expose this port to the internet."
  echo "On another device, use this machine's LAN IP on port $port."
else
  echo "Serving locally at http://127.0.0.1:$port/"
fi
exec python3 -m http.server "$port" --bind "$bind"
