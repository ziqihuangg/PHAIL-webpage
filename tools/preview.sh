#!/usr/bin/env bash
# Starts a local static server for previewing the PHAIL webpage.
set -euo pipefail

PORT=4173
cd "$(dirname "$0")/.."   # serve the repo root, where the pages are

# python3 on macOS/Linux, python on Windows (Git Bash)
PY=$(command -v python3 || command -v python || true)
if [ -z "$PY" ]; then
  echo "Need Python on PATH to serve this folder." >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1 && lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use. If it is an old 'python3 -m http.server', stop it and rerun this script: that one caches pages and cannot save meeting notes."
  exit 0
fi

# tools/preview_server.py = http.server with caching off, plus the meeting-notes API
# that writes data/notes.js. Needs Python 3.7+.
"$PY" tools/preview_server.py "$PORT"
