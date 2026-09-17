#!/usr/bin/env bash
# Starts a local static server for previewing the PHAIL webpage.
set -euo pipefail

PORT=4173
cd "$(dirname "$0")"

# python3 on macOS/Linux, python on Windows (Git Bash)
PY=$(command -v python3 || command -v python || true)
if [ -z "$PY" ]; then
  echo "Need Python on PATH to serve this folder." >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1 && lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use - preview is likely already running at http://127.0.0.1:$PORT/"
  exit 0
fi

echo "Starting preview server at http://127.0.0.1:$PORT/ (Ctrl+C to stop)"
"$PY" -m http.server "$PORT" --bind 127.0.0.1
