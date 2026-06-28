import time, os, json
path = r"C:\Users\Kaelo\.cursor\projects\c-Users-Kaelo-frontrowly\agent-transcripts\da94ca5f-db5c-4d2a-a7cc-3e9e14912c95\da94ca5f-db5c-4d2a-a7cc-3e9e14912c95.jsonl"
out = r"c:\Users\Kaelo\frontrowly\scripts\data\pastes\match-86.txt"
start = "World Cup Tickets - Hard Rock Stadium - Complex"
end = "Showing 243 of 246"

def decode_fragment(raw):
    if "\\n" in raw and "\n" not in raw:
        try:
            return json.loads('"' + raw.replace("\\", "\\\\").replace('"', '\\"') + '"')
        except Exception:
            return raw.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t")
    return raw

def try_extract():
    content = open(path, encoding="utf-8").read()
    best = None
    idx = 0
    while True:
        i = content.find(start, idx)
        if i < 0:
            break
        j = content.find(end, i)
        if j >= 0:
            raw = content[i : j + len(end)]
            if best is None or len(raw) > len(best):
                best = raw
        idx = i + 1
    if not best:
        return False
    decoded = decode_fragment(best)
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(decoded)
    lines = decoded.splitlines()
    print("SUCCESS lines", len(lines))
    print("first", lines[0] if lines else "")
    print("last", lines[-1] if lines else "")
    return True

last_size = os.path.getsize(path)
for n in range(24):
    if try_extract():
        raise SystemExit(0)
    size = os.path.getsize(path)
    if size != last_size:
        print("size changed", last_size, "->", size)
        last_size = size
    time.sleep(5)
print("FAILED: paste not in transcript after 120s")
raise SystemExit(1)
