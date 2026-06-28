import glob
import json
import os

out = r"c:\Users\Kaelo\frontrowly\scripts\data\pastes\match-86.txt"
start = "World Cup Tickets - Hard Rock Stadium - Complex"
end = "Showing 243 of 246"
base = r"C:\Users\Kaelo\.cursor\projects\c-Users-Kaelo-frontrowly\agent-transcripts"


def decode_fragment(raw: str) -> str:
    if "\\n" in raw and "\n" not in raw[:500]:
        try:
            return json.loads('"' + raw.replace("\\", "\\\\").replace('"', '\\"') + '"')
        except Exception:
            return raw.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t")
    return raw


paths = sorted(glob.glob(os.path.join(base, "**", "*.jsonl"), recursive=True), key=os.path.getmtime, reverse=True)
best_path = None
best = None

for path in paths:
    content = open(path, encoding="utf-8", errors="replace").read()
    idx = 0
    while True:
        i = content.find(start, idx)
        if i < 0:
            break
        j = content.find(end, i)
        if j >= 0:
            raw = content[i : j + len(end)]
            if len(raw) < 10000 or "Hard Rock Stadium - Complex - Section" not in raw:
                idx = i + 1
                continue
            if best is None or len(raw) > len(best):
                best = raw
                best_path = path
        idx = i + 1

if not best:
    raise SystemExit(f"Paste not found in {len(paths)} transcript files")

decoded = decode_fragment(best)
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write(decoded + "\n")

lines = decoded.splitlines()
print(f"SUCCESS from {best_path}")
print(f"lines={len(lines)} chars={len(decoded)}")
print("first:", lines[0] if lines else "")
print("last:", lines[-1] if lines else "")
