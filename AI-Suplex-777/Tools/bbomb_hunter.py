#!/usr/bin/env python3
"""bbomb_hunter.py — Graph RAG Impl 1: Hidden-Connection B-Bomb Generator.

Discovers hidden connections between vault items across focuses using the
SQLite knowledge graph (Memory/knowledge-graph.db, read-only), then scores each pair
with an LLM (reusing the wqr_agent.py LangChain bridge pattern) to produce
ranked B-Bomb candidates for Saturday B-Bomb Day.

Two candidate mechanisms:
  A. shared-tag cross-focus pairs        (cheap, proven)
  B. 2nd-degree traversal via relates_to (transitive A→B→C)

Filters: cross-focus (both sides non-null, different focus), ≤7 weeks old
         (entities.date, ISO TEXT), deduped, capped at 30.

Usage:
  python3 Tools/bbomb_hunter.py             # full run (LLM scoring)
  python3 Tools/bbomb_hunter.py --dry       # SQL only, no LLM
  python3 Tools/bbomb_hunter.py --limit 5   # score at most 5 pairs

Env:
  DEEPSEEK_API_KEY  → ChatDeepSeek ("deepseek-chat")
  GEMINI_API_KEY    → ChatGoogleGenerativeAI (also accepts GOOGLE_API_KEY)
  LLM_BACKEND       → force "gemini" | "deepseek" (else auto-detect)
  GEMINI_MODEL      → Gemini model id (default gemini-2.0-flash)
  Keys load from the vault-root .env (python-dotenv) first; shell env wins over it.

Spec: Artifacts/Cycle 1/Week 6/2026-08-12-2230-...-bbomb-generator-spec-*.md
"""

import argparse
import os
import re
import sqlite3
from datetime import date, timedelta
from pathlib import Path

from dotenv import dotenv_values

VAULT = Path(__file__).resolve().parent.parent
DB = VAULT / "Memory" / "knowledge-graph.db"


def _load_env():
    """Vault-root .env is authoritative: non-empty values override the shell env,
    empty stubs defer to whatever the shell already exported (no clobbering)."""
    for k, v in dotenv_values(VAULT / ".env").items():
        if v:
            os.environ[k] = v


_load_env()

RECENCY_WEEKS = 7
MAX_CANDIDATES = 30
VERDICT_RANK = {"YES": 0, "MAYBE": 1, "NO": 2}

SCORE_TEMPLATE = (
    "You are the AI-Suplex Architect. Two vault items share a hidden connection.\n"
    "Evaluate whether they combine into a B-Bomb (polished, reusable, sellable asset).\n\n"
    "Item A: {a_title} ({a_type}, {a_focus}) — {a_summary}\n"
    "Item B: {b_title} ({b_type}, {b_focus}) — {b_summary}\n"
    "Connection: {connection}\n\n"
    "Reply in EXACTLY this format, nothing else:\n"
    "NARRATIVE: <1-2 sentences on why these belong together>\n"
    "TITLE: <a sellable B-Bomb title>\n"
    "IQ: <integer 1-10>\n"
    "VERDICT: <YES or MAYBE or NO>\n"
)


def connect():
    if not DB.exists():
        raise SystemExit(f"Graph DB not found: {DB}")
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def _pair(a_id, a_title, a_type, a_focus, a_summary,
          b_id, b_title, b_type, b_focus, b_summary, connection):
    def clip(s, n=250):
        s = (s or "").strip() or "(no summary)"
        return s if len(s) <= n else s[: n - 1] + "…"
    return {
        "a_id": a_id, "a_title": a_title, "a_type": a_type or "entity",
        "a_focus": a_focus, "a_summary": clip(a_summary),
        "b_id": b_id, "b_title": b_title, "b_type": b_type or "entity",
        "b_focus": b_focus, "b_summary": clip(b_summary),
        "connection": connection,
    }


# ── Mechanism A: shared-tag cross-focus pairs ──
def query_shared_tags(conn, cutoff):
    sql = """
    SELECT t1.tag AS connection,
           e1.id AS a_id, e1.title AS a_title, e1.type AS a_type,
           e1.focus AS a_focus, e1.summary AS a_summary,
           e2.id AS b_id, e2.title AS b_title, e2.type AS b_type,
           e2.focus AS b_focus, e2.summary AS b_summary
    FROM tags t1
    JOIN tags t2 ON t1.tag = t2.tag AND t1.entity_id < t2.entity_id
    JOIN entities e1 ON e1.id = t1.entity_id
    JOIN entities e2 ON e2.id = t2.entity_id
    WHERE e1.focus IS NOT NULL AND e2.focus IS NOT NULL
      AND e1.focus != e2.focus
      AND e1.date >= ? AND e2.date >= ?
    """
    pairs = []
    for r in conn.execute(sql, (cutoff, cutoff)):
        pairs.append(_pair(
            r["a_id"], r["a_title"], r["a_type"], r["a_focus"], r["a_summary"],
            r["b_id"], r["b_title"], r["b_type"], r["b_focus"], r["b_summary"],
            f"shared tag '{r['connection']}'",
        ))
    return pairs


# ── Mechanism B: 2nd-degree traversal via relates_to ──
def query_second_degree(conn, cutoff):
    sql = """
    SELECT r1.type AS hop1, e2.title AS mid_title, r2.type AS hop2,
           e1.id AS a_id, e1.title AS a_title, e1.type AS a_type,
           e1.focus AS a_focus, e1.summary AS a_summary,
           e3.id AS b_id, e3.title AS b_title, e3.type AS b_type,
           e3.focus AS b_focus, e3.summary AS b_summary
    FROM relationships r1
    JOIN entities e1 ON e1.id = r1.source_id
    JOIN entities e2 ON e2.id = r1.target_id
    JOIN relationships r2 ON r2.source_id = e2.id AND r2.target_id != e1.id
    JOIN entities e3 ON e3.id = r2.target_id
    WHERE r1.type = 'relates_to' AND r2.type = 'relates_to'
      AND e1.id != e3.id
      AND e1.focus IS NOT NULL AND e3.focus IS NOT NULL
      AND e1.focus != e3.focus
      AND e1.date >= ? AND e3.date >= ?
    """
    pairs = []
    for r in conn.execute(sql, (cutoff, cutoff)):
        pairs.append(_pair(
            r["a_id"], r["a_title"], r["a_type"], r["a_focus"], r["a_summary"],
            r["b_id"], r["b_title"], r["b_type"], r["b_focus"], r["b_summary"],
            f"{r['hop1']} → {r['mid_title']} → {r['hop2']}",
        ))
    return pairs


# ── Merge, filter, dedupe, cap ──
def build_pairs(conn, cutoff, cap):
    raw = query_shared_tags(conn, cutoff) + query_second_degree(conn, cutoff)
    seen, pairs = set(), []
    for p in raw:
        key = (min(p["a_id"], p["b_id"]), max(p["a_id"], p["b_id"]))
        if key in seen:
            continue
        seen.add(key)
        pairs.append(p)
    return pairs[:cap]


# ── LLM bridge (reuses wqr_agent.py pattern) ──
def pick_backend():
    backend = os.getenv("LLM_BACKEND", "").strip().lower()
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if backend == "gemini":
        if not gemini_key:
            raise SystemExit("LLM_BACKEND=gemini but GEMINI_API_KEY/GOOGLE_API_KEY is not set")
        return "gemini", {"model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
                          "google_api_key": gemini_key}
    if backend == "deepseek":
        if not deepseek_key:
            raise SystemExit("LLM_BACKEND=deepseek but DEEPSEEK_API_KEY is not set")
        return "deepseek", {"model": "deepseek-chat"}
    if deepseek_key:                       # auto-detect
        return "deepseek", {"model": "deepseek-chat"}
    if gemini_key:
        return "gemini", {"model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
                          "google_api_key": gemini_key}
    raise SystemExit(
        "No LLM key found. Set DEEPSEEK_API_KEY or GEMINI_API_KEY "
        "(or GOOGLE_API_KEY), or run with --dry for SQL-only output."
    )


def get_chain():
    backend, kwargs = pick_backend()
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    if backend == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(**kwargs)
    else:
        from langchain_deepseek import ChatDeepSeek
        llm = ChatDeepSeek(**kwargs)
    prompt = ChatPromptTemplate.from_template(SCORE_TEMPLATE)
    return prompt | llm | StrOutputParser()


def parse_score(text):
    out = {"narrative": "", "title": "", "iq": 5, "verdict": "MAYBE"}
    for line in (text or "").splitlines():
        m = re.match(r"^(NARRATIVE|TITLE|IQ|VERDICT)\s*:\s*(.*)$",
                     line.strip(), re.IGNORECASE)
        if not m:
            continue
        key, val = m.group(1).lower(), m.group(2).strip()
        if key == "narrative":
            out["narrative"] = val
        elif key == "title":
            out["title"] = val
        elif key == "iq":
            mi = re.search(r"\d+", val)
            if mi:
                out["iq"] = max(1, min(10, int(mi.group())))
        elif key == "verdict":
            v = val.upper()
            out["verdict"] = "YES" if "YES" in v else ("NO" if "NO" in v else "MAYBE")
    return out


def main():
    ap = argparse.ArgumentParser(description="Hidden-connection B-Bomb candidate generator.")
    ap.add_argument("--dry", action="store_true", help="SQL only, skip LLM scoring.")
    ap.add_argument("--limit", type=int, default=MAX_CANDIDATES,
                    help=f"max candidates to consider (default {MAX_CANDIDATES}).")
    args = ap.parse_args()

    conn = connect()
    cutoff = (date.today() - timedelta(weeks=RECENCY_WEEKS)).isoformat()
    pairs = build_pairs(conn, cutoff, max(1, args.limit))
    conn.close()

    today = date.today().isoformat()
    print(f"=== 💣 B-BOMB CANDIDATES — {today} ===")
    print(f"Cutoff: {cutoff} ({RECENCY_WEEKS}wk) · cross-focus pairs: {len(pairs)}")

    if args.dry:
        for i, p in enumerate(pairs, 1):
            print(f"\n#{i} \"{p['a_title']}\" ({p['a_focus']}) "
                  f"↔ \"{p['b_title']}\" ({p['b_focus']})")
            print(f"   Connection: {p['connection']}")
        print("\n[dry run — no LLM scoring]")
        return

    chain = get_chain()
    results = []
    for p in pairs:
        raw = chain.invoke({
            "a_title": p["a_title"], "a_type": p["a_type"],
            "a_focus": p["a_focus"], "a_summary": p["a_summary"],
            "b_title": p["b_title"], "b_type": p["b_type"],
            "b_focus": p["b_focus"], "b_summary": p["b_summary"],
            "connection": p["connection"],
        })
        s = parse_score(raw)
        s["pair"] = p
        results.append(s)

    results.sort(key=lambda s: (-s["iq"], VERDICT_RANK[s["verdict"]]))
    for i, s in enumerate(results, 1):
        p = s["pair"]
        title = s["title"] or "Untitled B-Bomb"
        print(f"\n#{i} [IQ {s['iq']} · {s['verdict']}] \"{title}\"")
        print(f"   Connection: {p['connection']}")
        if s["narrative"]:
            print(f"   → Build: {s['narrative']}")


if __name__ == "__main__":
    main()
