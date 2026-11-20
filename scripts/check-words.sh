#!/usr/bin/env bash
# Flags context files that exceed their word budget.
fail=0
check() {
  [ -f "$1" ] || return 0
  n=$(wc -w < "$1")
  if [ "$n" -gt "$2" ]; then echo "OVER  $1: $n / $2"; fail=1
  else echo "ok    $1: $n / $2"; fi
}
check WORKSHOP.md 2000
check AGENTS.md 500
check PROJECT_CONTEXT.md 800
check HANDOFF.md 300
check TODO.md 500
check docs/ARCHITECTURE.md 600
check docs/WORKFLOW.md 800
exit $fail
