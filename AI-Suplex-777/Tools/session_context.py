#!/usr/bin/env python3
"""session_context.py — thin wrapper over the canonical session brief.

Tier 2 re-scope: this script used to be an LLM generator (langchain +
DeepSeek/Gemini) writing a parallel `Context Kick-start/Active/*-session-context-*.md`
file. Per the Tier 2 PRD (Option b), there is now exactly ONE context generator:
`Tools/vault-index.js --current` writes `Memory/vault-context.md` — the read-always
session brief. This wrapper delegates to it and prints the result, so
`3lm start --context` and `vault-index.js --current` converge on the same artifact.

Usage:
  python3 Tools/session_context.py          # regenerate the brief, then print it
  python3 Tools/session_context.py --dry    # print vault-context.md without regenerating
  python3 Tools/session_context.py --save   # alias for the default (regenerate + print)
  python3 Tools/session_context.py --focus wqr   # accepted for compatibility; ignored

Spec: Artifacts/Cycle 2/Week 2/2026-09-05-vault-index-rescope-prd-spec-ai-engineering.md
"""

import argparse
import subprocess
import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
CONTEXT = VAULT / "Memory" / "vault-context.md"
GENERATOR = VAULT / "Tools" / "vault-index.js"


def regenerate() -> int:
    """Run the single context generator; return its exit code."""
    r = subprocess.run(
        ["node", str(GENERATOR), "--current"],
        cwd=str(VAULT),
        capture_output=True,
        text=True,
        timeout=30,
    )
    if r.returncode != 0:
        print(r.stderr.strip() or "vault-index.js --current failed", file=sys.stderr)
    return r.returncode


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Thin wrapper: delegate to vault-index.js --current, print vault-context.md."
    )
    ap.add_argument("--dry", action="store_true",
                    help="print vault-context.md without regenerating it.")
    ap.add_argument("--save", action="store_true",
                    help="accepted for compatibility (the brief is always written by --current).")
    ap.add_argument("--focus", default=None,
                    help="accepted for compatibility; focus is derived from the vault.")
    args = ap.parse_args()

    if not args.dry:
        code = regenerate()
        if code != 0:
            sys.exit(code)

    if not CONTEXT.exists():
        print(f"No brief found: {CONTEXT} — run: node Tools/vault-index.js --current",
              file=sys.stderr)
        sys.exit(1)

    print(CONTEXT.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
