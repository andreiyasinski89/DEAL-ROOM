"""Lists the translation keys used in src (tr("...")/T("...")) and which are missing in the en/pl/uk dictionaries.

Usage: python scripts/keys.py [en|pl|uk]   (JSON on stdout, summary on stderr)
"""
import glob
import json
import re
import sys

KEY_RE = re.compile(r'\b(?:tr|T)\(\s*("(?:[^"\\]|\\.)*")')
ENTRY_RE = re.compile(r'^\s*("(?:[^"\\]|\\.)*"):\s*("(?:[^"\\]|\\.)*"),?\s*$', re.M)


def used_keys():
    keys, seen = [], set()
    for f in sorted(glob.glob("src/**/*.ts*", recursive=True)):
        if re.search(r"\.test\.|src[\\/]i18n", f):
            continue
        s = open(f, encoding="utf-8").read()
        for m in KEY_RE.finditer(s):
            k = json.loads(m.group(1))
            if k not in seen:
                seen.add(k)
                keys.append(k)
    return keys, seen


def load(lang):
    s = open(f"src/i18n/{lang}.ts", encoding="utf-8").read()
    return {json.loads(m.group(1)): json.loads(m.group(2)) for m in ENTRY_RE.finditer(s)}


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "en"
    keys, seen = used_keys()
    d = load(which)
    miss = [k for k in keys if k not in d]
    stale = [k for k in d if k not in seen]
    print(f"used={len(keys)} have={len(d)} missing={len(miss)} stale={len(stale)}", file=sys.stderr)
    json.dump({"missing": miss, "stale": stale}, sys.stdout, ensure_ascii=False, indent=0)
