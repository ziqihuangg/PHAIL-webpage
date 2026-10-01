#!/usr/bin/env python3
"""Download PhAIL's raw sources again: every board listed in data/raw/sources.js.

    python3 tools/fetch_raw.py              all sources that are not frozen
    python3 tools/fetch_raw.py paw-gen-10   just these

Each file is saved exactly as served, inside data/raw/<id>.js as a JSON string
(so the site still opens from disk), with its URL, download time and byte count.
Nothing is parsed or rounded here: js/engine/raw-sources.js does that in the
page. Python 3 standard library only. Also used by tools/preview_server.py for
the "Download every raw source again" button on the Checks tab.
"""
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
HEADER = ("/* Raw source, saved exactly as served - do not edit. Written by tools/fetch_raw.py;\n"
          "   js/engine/raw-sources.js parses it into the Ledger when a page loads. */\n"
          "window.phailRaw = window.phailRaw || { files: {} };\n")


def sources():
    """[{id, url, frozen}] from data/raw/sources.js (one source per line there)."""
    with open(os.path.join(RAW, "sources.js"), encoding="utf-8") as handle:
        text = handle.read()
    found = []
    for line in text.splitlines():
        match = re.search(r'\bid:\s*"([^"]+)".*\burl:\s*"([^"]+)"', line)
        if match:
            found.append({"id": match.group(1), "url": match.group(2), "frozen": "frozen: true" in line})
    return found


def fetch(source):
    request = urllib.request.Request(source["url"], headers={"User-Agent": "PhAIL-raw-fetch (research ledger)"})
    with urllib.request.urlopen(request, timeout=60) as response:
        body = response.read()
    text = body.decode("utf-8")
    payload = {"url": source["url"], "fetched": time.strftime("%Y-%m-%d %H:%M"), "bytes": len(body), "text": text}
    path = os.path.join(RAW, source["id"] + ".js")
    with open(path + ".tmp", "w", encoding="utf-8") as handle:
        handle.write(HEADER + "window.phailRaw.files[" + json.dumps(source["id"]) + "] = " + json.dumps(payload, ensure_ascii=False) + ";\n")
    os.replace(path + ".tmp", path)
    return {"id": source["id"], "ok": True, "bytes": len(body)}


def fetch_all(ids=None):
    results = []
    for source in sources():
        if ids and source["id"] not in ids:
            continue
        if not ids and source["frozen"]:
            continue
        try:
            results.append(fetch(source))
        except Exception as error:  # report per source, keep going
            results.append({"id": source["id"], "ok": False, "error": str(error)})
    return results


if __name__ == "__main__":
    for result in fetch_all(sys.argv[1:] or None):
        print(result["id"], "saved" if result["ok"] else "FAILED: " + result["error"], result.get("bytes", ""))
