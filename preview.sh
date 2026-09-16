#!/usr/bin/env bash
# Starts a local static server for previewing the PHAIL webpage.
set -euo pipefail

PORT=4173
cd "$(dirname "$0")"

if lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use — preview is likely already running at http://127.0.0.1:$PORT/"
  exit 0
fi

echo "Starting preview server at http://127.0.0.1:$PORT/ (Ctrl+C to stop)"
python3 -m http.server "$PORT"
