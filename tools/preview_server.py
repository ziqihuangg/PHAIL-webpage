#!/usr/bin/env python3
"""Local preview for PhAIL.

Serves the folder like `python3 -m http.server`, with two differences:
  - every response says Cache-Control: no-store, so an edited page is never
    shown from a stale cache (the cause of old tabs reappearing);
  - a tiny notes API behind the meeting-notes box on every tab:
      GET  /api/notes          -> {"notes": [...]}
      POST /api/notes          {"page": "ranking", "text": "..."} -> appends
      POST /api/notes/delete   {"id": "..."}                      -> removes
    Notes are written to data/notes.js, a plain data file the pages load, so
    they are part of the repo and ship with the next commit.
  - two buttons on the Checks tab (check.html):
      POST /api/expected      {"text": "..."} -> data/expected.js (the baseline)
      POST /api/raw/refresh   {}              -> tools/fetch_raw.py for every live board

Only binds to 127.0.0.1 and only accepts JSON from its own origin.
"""
import json
import os
import re
import sys
import threading
import time
import uuid
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_raw  # noqa: E402  (tools/fetch_raw.py)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root: this file is in tools/
NOTES_FILE = os.path.join(ROOT, "data", "notes.js")
EXPECTED_FILE = os.path.join(ROOT, "data", "expected.js")
HEADER = ("/* Meeting notes typed into the site during local preview (bash tools/preview.sh).\n"
          "   Written by tools/preview_server.py - edit by hand only while the server is stopped. */\n")
PAGE_KEY = re.compile(r"^[a-z0-9-]{1,32}$")
LOCK = threading.Lock()


def load_notes():
    try:
        with open(NOTES_FILE, encoding="utf-8") as handle:
            text = handle.read()
    except FileNotFoundError:
        return []
    match = re.search(r"window\.phailNotes\s*=\s*(\[.*\]);", text, re.S)
    return json.loads(match.group(1)) if match else []


def save_notes(notes):
    temp = NOTES_FILE + ".tmp"
    with open(temp, "w", encoding="utf-8") as handle:
        handle.write(HEADER + "window.phailNotes = " + json.dumps(notes, ensure_ascii=False, indent=2) + ";\n")
    os.replace(temp, NOTES_FILE)


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/notes":
            with LOCK:
                return self.send_json(200, {"notes": load_notes()})
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        origin = self.headers.get("Origin")
        host = self.headers.get("Host", "")
        if origin and origin not in ("http://" + host,):
            return self.send_json(403, {"error": "cross-origin request refused"})
        if "application/json" not in (self.headers.get("Content-Type") or ""):
            return self.send_json(415, {"error": "send JSON"})
        length = int(self.headers.get("Content-Length") or 0)
        if length > (2000000 if path == "/api/expected" else 20000):
            return self.send_json(413, {"error": "request too long"})
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            return self.send_json(400, {"error": "bad JSON"})

        if path == "/api/expected":
            text = str(body.get("text", ""))
            if not text.startswith("/* Baseline for check.html") or "window.phailExpected = " not in text:
                return self.send_json(400, {"error": "not a baseline file"})
            with LOCK:
                with open(EXPECTED_FILE + ".tmp", "w", encoding="utf-8") as handle:
                    handle.write(text)
                os.replace(EXPECTED_FILE + ".tmp", EXPECTED_FILE)
            return self.send_json(200, {"saved": "data/expected.js"})
        if path == "/api/raw/refresh":
            with LOCK:
                return self.send_json(200, {"results": fetch_raw.fetch_all()})

        with LOCK:
            notes = load_notes()
            if path == "/api/notes":
                page = str(body.get("page", ""))
                text = str(body.get("text", "")).strip()
                if not PAGE_KEY.match(page) or not text or len(text) > 2000:
                    return self.send_json(400, {"error": "need a page key and 1-2000 characters of text"})
                notes.append({"id": uuid.uuid4().hex[:10], "page": page, "text": text,
                              "time": time.strftime("%Y-%m-%d %H:%M")})
            elif path == "/api/notes/delete":
                note_id = str(body.get("id", ""))
                notes = [note for note in notes if note.get("id") != note_id]
            else:
                return self.send_json(404, {"error": "unknown endpoint"})
            save_notes(notes)
        return self.send_json(200, {"notes": notes})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=ROOT))
    print(f"PhAIL preview at http://127.0.0.1:{port}/ (notes save to data/notes.js; Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
