#!/usr/bin/env python3
"""paths.py — the AI-Suplex path contract, Python runtime.

The twin of `Tools/paths.js`: one contract, two runtimes, **identical output**.
Both parse `period.md` at the vault root — the ONLY source of a period label.

Consumers: `Tools/session_context.py` · `Tools/bbomb_hunter.py`

Contract rules enforced here (mirroring paths.js):
  1. `period.md` is the only source of a period label — missing file fails loudly.
  2. A label is DERIVED from dates (`YYYY-YYYY`), never authored.
  3. Cycle 0 belongs to the reserved pre-period label `0000-Build`.
  4. Callers receive POSIX, vault-relative paths (no leading slash).

API mapping (JS → Python):

    periodLabel()          → period_label()
    artifactDir(c, w)      → artifact_dir(c, w)
    bBombDir(c, w)         → b_bomb_dir(c, w)
    insightDir(c, w)       → insight_dir(c, w)
    reviewDir(c, w)        → review_dir(c, w)
    reviewCycleDir(c)      → review_cycle_dir(c)
    reviewReviewFile(c, w) → review_review_file(c, w)
    reviewDataFile(c, w)   → review_data_file(c, w)
    mocsDir(c)             → mocs_dir(c)
    periodCardDir()        → period_card_dir()
    planDir(c)             → plan_dir(c)
    periodPlanDir()        → period_plan_dir()
    episodicDir(c, w)      → episodic_dir(c, w)
    currentPeriod()        → current_period()
    parseCyclePath(p)      → parse_cycle_path(p)

camelCase aliases are provided at the bottom of this module so a cross-runtime
parity test can call both modules by the same names.

CLI:
    python3 Tools/paths.py               # print the resolved period + a path sample
    python3 Tools/paths.py --self-test   # assert the contract round-trips

Spec: `Projects/AI-Suplex Ultra Edition/Period Structure — Design Spec.md`
      §4 (contract) · §5 (resolver API) · §6 (Cycle 0 → `0000-Build/`)
"""

from __future__ import annotations

import re
import sys
from datetime import date, timedelta
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parent.parent
PERIOD_FILE = VAULT_ROOT / "period.md"

#: Reserved label for pre-period cycles (spec §6).
PRE_PERIOD_LABEL = "0000-Build"

#: Canonical rhythm (spec §3): 7 cycles of 7 weeks.
CYCLES_PER_PERIOD = 7
WEEKS_PER_CYCLE = 7

#: Days from `period_start` to `period_end`.
#:
#: **343 days = 7 cycles × 7 weeks = 49 weeks.** Ruled by the Hustler (2026-09-26)
#: after the T006 review escalated the spec §4.1 example (which said 364 = the spec's
#: `2026-06-19 → 2027-06-18`). The rhythm is the authority:
#: *"7 cycles of 7 weeks = 49 weeks of work; 52 weeks in a year − 49 = 3 weeks vacation."*
#: — `B-Bombs/Cycle 0/Week 2/2026-05-16-b-bomb-7-7-7-rhythm-math-digital-products`
#:
#: The derived label is unchanged either way; the span is not. Change this in BOTH runtimes.
PERIOD_SPAN_DAYS = 343

_ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# ── FRONTMATTER ────────────────────────────────────────


def parse_frontmatter(text: str) -> dict[str, str]:
    """Minimal YAML-frontmatter reader — same shape `paths.js` uses.

    Handles `key: value`, quoted values, and ignores nested/block content.
    """
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.DOTALL)
    if not m:
        return {}
    out: dict[str, str] = {}
    for line in m.group(1).split("\n"):
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        val = val.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        out[key.strip()] = val
    return out


# ── DATE DERIVATION ────────────────────────────────────


def is_iso_date(value: object) -> bool:
    """A real calendar date — the pattern alone is not enough (2026-13-99 matches)."""
    if not isinstance(value, str) or not _ISO_DATE.match(value):
        return False
    try:
        date.fromisoformat(value)
    except ValueError:
        return False
    return True


def add_days(iso: str, days: int) -> str:
    """Add days to an ISO date. `date` is timezone-free — no drift."""
    if not is_iso_date(iso):
        raise ValueError(f"paths.py: date must be a real ISO date (YYYY-MM-DD), got {iso!r}")
    return (date.fromisoformat(iso) + timedelta(days=days)).isoformat()


def derive_period_end(start_iso: str, span_days: int = PERIOD_SPAN_DAYS) -> str:
    """period_end = period_start + PERIOD_SPAN_DAYS. Derived, never authored."""
    return add_days(start_iso, span_days)


def derive_period_label(start_iso: str, end_iso: str) -> str:
    """period_label = "YYYY-YYYY" from the start and end years. Never authored."""
    if not is_iso_date(start_iso):
        raise ValueError(f"paths.py: period_start must be a real ISO date, got {start_iso!r}")
    if not is_iso_date(end_iso):
        raise ValueError(f"paths.py: period_end must be a real ISO date, got {end_iso!r}")
    return f"{start_iso[:4]}-{end_iso[:4]}"


# ── PERIOD SOURCE OF TRUTH ─────────────────────────────

_cache: dict | None = None


def read_period(fresh: bool = False) -> dict:
    """Read `period.md` — the single source of truth.

    Raises on a missing file or an absent/invalid field. Never guesses a label.
    """
    global _cache
    if _cache is not None and not fresh:
        return _cache

    if not PERIOD_FILE.exists():
        raise FileNotFoundError(
            f"paths.py: period.md not found at {PERIOD_FILE}.\n"
            f"  The vault has no Period source of truth. Run the vault initialiser\n"
            f'  ("Sweeper – Initialise Vault") or restore period.md. Refusing to guess a label.'
        )

    fm = parse_frontmatter(PERIOD_FILE.read_text(encoding="utf-8"))

    raw_index = fm.get("period_index", "")
    label = fm.get("period_label", "")
    start = fm.get("period_start", "")
    end = fm.get("period_end", "")
    cycle_1_start = fm.get("cycle_1_start", "") or start

    bad: list[str] = []
    try:
        index = int(raw_index)
        if index < 1:
            raise ValueError
    except (TypeError, ValueError):
        index = 0
        bad.append("period_index (positive integer)")
    if not label:
        bad.append("period_label")
    if not is_iso_date(start):
        bad.append("period_start (a real YYYY-MM-DD date)")
    if not is_iso_date(end):
        bad.append("period_end (a real YYYY-MM-DD date)")
    if bad:
        raise ValueError(f"paths.py: period.md is missing/invalid fields: {', '.join(bad)}\n  → {PERIOD_FILE}")
    if end <= start:
        raise ValueError(f"paths.py: period_end ({end}) must fall after period_start ({start}).\n  → {PERIOD_FILE}")
    if not is_iso_date(cycle_1_start):
        raise ValueError(f"paths.py: cycle_1_start must be a real YYYY-MM-DD date, got {cycle_1_start!r}\n  → {PERIOD_FILE}")

    # A hand-typed label is a contract violation — the label must be derived.
    derived = derive_period_label(start, end)
    if not re.match(r"^\d{4}-\d{4}$", label):
        raise ValueError(
            f'paths.py: period_label "{label}" is not a derived label.\n'
            f'  Expected "YYYY-YYYY" derived from period_start/period_end (e.g. "{derived}").'
        )
    if label != derived:
        raise ValueError(
            f'paths.py: period_label "{label}" contradicts its dates — derived value is "{derived}".\n'
            f"  The label is derived, never authored. Fix period.md (or the initialiser that wrote it)."
        )

    _cache = {
        "index": index,
        "label": label,
        "start": start,
        "end": end,
        "cycle1Start": cycle_1_start,
    }
    return _cache


def reset_cache() -> None:
    """Drop the memoised period + tree layouts (after a rollover, rewrite, or file move)."""
    global _cache
    _cache = None
    _layout_cache.clear()


# ── GUARDS ─────────────────────────────────────────────


def _int(value: object, what: str, minimum: int) -> int:
    try:
        n = int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        raise ValueError(f"paths.py: {what} must be an integer ≥ {minimum}, got {value!r}") from None
    if isinstance(value, float) and not value.is_integer():
        raise ValueError(f"paths.py: {what} must be an integer ≥ {minimum}, got {value!r}")
    if n < minimum:
        raise ValueError(f"paths.py: {what} must be an integer ≥ {minimum}, got {value!r}")
    return n


def period_for_cycle(cycle: object) -> str:
    """Cycle 0 is pre-period; every other cycle belongs to the current period."""
    c = _int(cycle, "cycle", 0)
    return PRE_PERIOD_LABEL if c == 0 else read_period()["label"]


def _j(*parts: object) -> str:
    """POSIX join for vault-relative paths."""
    cleaned = [str(p).replace("\\", "/").strip("/") for p in parts]
    return "/".join(p for p in cleaned if p)


# ── THE CONTRACT (spec §5) ─────────────────────────────


def period_label() -> str:
    """'<Period>'"""
    return read_period()["label"]


def artifact_dir(cycle, week) -> str:
    """'Artifacts/<Period>/Cycle 2/Week 4'"""
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j("Artifacts", period_for_cycle(c), f"Cycle {c}", f"Week {w}")


def b_bomb_dir(cycle, week) -> str:
    """'B-Bombs/<Period>/Cycle 2/Week 4'"""
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j("B-Bombs", period_for_cycle(c), f"Cycle {c}", f"Week {w}")


def outreach_dir() -> str:
    """'Outreach/<Period>' — the Outreach entity tree (Outreach spec §7).

    NOT cycle-scoped on purpose: an outreach record is created when contact
    happens and must stay visible until it closes, regardless of the running
    cycle. The period comes from `period.md` at runtime — never a literal label.
    """
    return _j("Outreach", read_period()["label"])


def insight_dir(cycle, week) -> str:
    """'Insights/<Period>/Cycle 2/Week 4.md' — returns the FILE path (spec §4)."""
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j("Insights", period_for_cycle(c), f"Cycle {c}", f"Week {w}.md")


def review_dir(cycle, week) -> str:
    """'Reviews/<Period>/Weekly/Cycle 2/Week 4' — the week's review **directory**.

    CORRECTED 2026-09-26 (decision 8, ruled after the T010 migration). The spec
    originally described a flat ``.../Week <n>.md`` FILE. That shape never existed:
    a week of review is a directory holding two files — the narrative review and
    the raw aggregate data that fed it. The contract now describes reality.
    """
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j("Reviews", period_for_cycle(c), "Weekly", f"Cycle {c}", f"Week {w}")


def review_cycle_dir(cycle) -> str:
    """'Reviews/<Period>/Weekly/Cycle <n>' — the cycle's review directory"""
    c = _int(cycle, "cycle", 0)
    return _j("Reviews", period_for_cycle(c), "Weekly", f"Cycle {c}")


def review_weekly_dir() -> str:
    """'Reviews/<Period>/Weekly' — the period-level reviews root (no cycle segment)"""
    return _j("Reviews", read_period()["label"], "Weekly")


def review_review_file(cycle, week) -> str:
    """'.../Week 4/Week 4 Review.md' — the narrative review for the week."""
    w = _int(week, "week", 1)
    return _j(review_dir(cycle, w), f"Week {w} Review.md")


def review_data_file(cycle, week) -> str:
    """'.../Week 4/Week 4 Aggregate Data.md' — the raw aggregate that fed the review."""
    w = _int(week, "week", 1)
    return _j(review_dir(cycle, w), f"Week {w} Aggregate Data.md")


def mocs_dir(cycle) -> str:
    """'MOCs/<Period>/Weekly/Cycle 2'"""
    c = _int(cycle, "cycle", 0)
    return _j("MOCs", period_for_cycle(c), "Weekly", f"Cycle {c}")


def period_card_dir() -> str:
    """'MOCs/<Period>' — the period card lives inside as <Period>.md"""
    return _j("MOCs", read_period()["label"])


def plan_dir(cycle) -> str:
    """'Plans/<Period>/Cycle 2'"""
    c = _int(cycle, "cycle", 0)
    return _j("Plans", period_for_cycle(c), f"Cycle {c}")


def period_plan_dir() -> str:
    """'Plans/<Period>' — the period plan lives inside as <Period> Plan.md"""
    return _j("Plans", read_period()["label"])


def episodic_dir(cycle, week) -> str:
    """'Memory/episodic/<Period>/Cycle-2/Week-4'"""
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j("Memory", "episodic", period_for_cycle(c), f"Cycle-{c}", f"Week-{w}")


def next_steps_dir(cycle) -> str:
    """'Next Steps/<Period>/Cycle 2' — cycle-scoped, and MISSING from the original
    §4 contract and the T010 migration manifest. Found by **T015 / F-3**; had it
    stayed un-migrated it would have silently merged across two periods.
    """
    c = _int(cycle, "cycle", 0)
    return _j("Next Steps", period_for_cycle(c), f"Cycle {c}")


def current_period() -> dict:
    """{ index, label, start, end }"""
    p = read_period()
    return {"index": p["index"], "label": p["label"], "start": p["start"], "end": p["end"]}


def parse_cycle_path(path_value) -> dict | None:
    """Parse a cycle-scoped path back into its parts. Replaces regex/max-cycle guessing.

    A path qualifies only if it names a **Cycle** — this keeps tasklist filenames
    (which contain "week 4" but are not cycle-scoped) from matching.

    Returns ``{'period': str|None, 'cycle': str, 'week': str|None}`` or ``None``.
    ``period`` is None for legacy (pre-migration) paths; ``cycle``/``week`` are
    strings, matching the existing tools' ``extractCycleWeek`` return shape.
    """
    if not isinstance(path_value, str) or not path_value.strip():
        return None
    p = path_value.replace("\\", "/")

    cm = re.search(r"Cycle[-\s]+(\d+)", p, re.IGNORECASE)
    if not cm:
        return None

    pm = re.search(r"(?:^|/)(\d{4}-\d{4}|0000-Build)(?=/|$)", p)
    wm = re.search(r"Week[-\s]+(\d+)", p, re.IGNORECASE)

    return {
        "period": pm.group(1) if pm else None,
        "cycle": cm.group(1),
        "week": wm.group(1) if wm else None,
    }


# ── MIGRATION-TOLERANT LOOKUP ──────────────────────────


def legacy_of(rel_path) -> str | None:
    """Map a canonical contract path to its legacy (pre-period) equivalent.

    ``Artifacts/<Period>/Cycle 2/Week 4``       → ``Artifacts/Cycle 2/Week 4``
    ``Memory/episodic/<Period>/Cycle-2/Week-4`` → ``Memory/episodic/Cycle-2/Week-4``

    Works by removing the period segment. Returns None when there is none.
    """
    if not isinstance(rel_path, str) or not rel_path:
        return None
    parts = rel_path.replace("\\", "/").split("/")
    for i, part in enumerate(parts):
        if part == PRE_PERIOD_LABEL or re.match(r"^\d{4}-\d{4}$", part):
            return "/".join(p for j, p in enumerate(parts) if j != i)
    return None


#: The cycle-scoped trees the contract governs.
TREE_ROOTS = ["Artifacts", "B-Bombs", "Insights", "Reviews", "MOCs", "Plans", "Next Steps", "Outreach", "Memory/episodic"]
_layout_cache: dict[str, str] = {}


def tree_root_of(rel_path) -> str:
    parts = str(rel_path).replace("\\", "/").split("/")
    if len(parts) > 1 and parts[0] == "Memory" and parts[1] == "episodic":
        return "Memory/episodic"
    return parts[0]


def tree_layout(tree: str) -> str:
    """Which layout does a tree currently use? ``'period'`` | ``'legacy'`` | ``'absent'``.

    Detected by looking for a period-labelled child (``<Period>`` or ``0000-Build``).
    This keeps Phase 3 (tooling) safe while Phase 4 (files) has not run yet — tools keep
    writing where the tree actually lives, so there is no split-brain.
    """
    if tree in _layout_cache:
        return _layout_cache[tree]
    layout = "absent"
    base = abs_path(tree)
    if base.exists():
        try:
            entries = [e.name for e in base.iterdir()]
        except OSError:
            entries = []
        if any(e == PRE_PERIOD_LABEL or re.match(r"^\d{4}-\d{4}$", e) for e in entries):
            layout = "period"
        elif entries:
            layout = "legacy"
    _layout_cache[tree] = layout
    return layout


def resolve(rel_path) -> str:
    """Where should this contract path live **right now**?

    1. canonical exists on disk → canonical
    2. legacy exists on disk    → legacy
    3. neither → wherever its tree currently lives (legacy during Phase 3, canonical after Phase 4)

    Use this for both reads and writes until the migration completes.
    """
    canonical = str(rel_path).replace("\\", "/")
    if abs_path(canonical).exists():
        return canonical
    legacy = legacy_of(canonical)
    if legacy and abs_path(legacy).exists():
        return legacy
    if legacy and tree_layout(tree_root_of(canonical)) == "legacy":
        return legacy
    return canonical


# ── NAMED FILES (implied by spec §4) ───────────────────


def period_plan_file() -> str:
    """'Plans/<Period>/<Period> Plan.md' — tier 1"""
    label = read_period()["label"]
    return _j("Plans", label, f"{label} Plan.md")


def period_card_file() -> str:
    """'MOCs/<Period>/<Period>.md' — the period card"""
    label = read_period()["label"]
    return _j("MOCs", label, f"{label}.md")


def weekly_rollup_file(cycle, week) -> str:
    """'MOCs/<Period>/Weekly/Cycle 2/Cycle 2 Week 4.md' — the frozen weekly rollup"""
    c, w = _int(cycle, "cycle", 0), _int(week, "week", 1)
    return _j(mocs_dir(c), f"Cycle {c} Week {w}.md")


# ── MISC ───────────────────────────────────────────────


def vault_root() -> Path:
    return VAULT_ROOT


def period_file_path() -> Path:
    return PERIOD_FILE


def abs_path(rel_path: str) -> Path:
    """Resolve a vault-relative contract path to an absolute path."""
    return VAULT_ROOT / rel_path


def is_pre_period(label) -> bool:
    return label == PRE_PERIOD_LABEL


# ── CLI ────────────────────────────────────────────────


def _self_test() -> bool:
    checks: list[tuple[str, object, object]] = []

    def eq(name: str, actual, expected) -> None:
        checks.append((name, actual, expected))

    p = read_period()
    eq("period label", period_label(), p["label"])

    eq("artifact_dir(2,4)", artifact_dir(2, 4), f"Artifacts/{p['label']}/Cycle 2/Week 4")
    eq("b_bomb_dir(2,4)", b_bomb_dir(2, 4), f"B-Bombs/{p['label']}/Cycle 2/Week 4")
    eq("insight_dir(2,4)", insight_dir(2, 4), f"Insights/{p['label']}/Cycle 2/Week 4.md")
    eq("review_dir(2,4)", review_dir(2, 4), f"Reviews/{p['label']}/Weekly/Cycle 2/Week 4")
    eq("review_review_file(2,4)", review_review_file(2, 4), f"Reviews/{p['label']}/Weekly/Cycle 2/Week 4/Week 4 Review.md")
    eq("review_data_file(2,4)", review_data_file(2, 4), f"Reviews/{p['label']}/Weekly/Cycle 2/Week 4/Week 4 Aggregate Data.md")
    eq("mocs_dir(2)", mocs_dir(2), f"MOCs/{p['label']}/Weekly/Cycle 2")
    eq("plan_dir(2)", plan_dir(2), f"Plans/{p['label']}/Cycle 2")
    eq("episodic_dir(2,4)", episodic_dir(2, 4), f"Memory/episodic/{p['label']}/Cycle-2/Week-4")
    eq("weekly_rollup_file(2,4)", weekly_rollup_file(2, 4), f"MOCs/{p['label']}/Weekly/Cycle 2/Cycle 2 Week 4.md")

    # Cycle 0 → reserved pre-period label
    eq("artifact_dir(0,1)", artifact_dir(0, 1), "Artifacts/0000-Build/Cycle 0/Week 1")
    eq("episodic_dir(0,1)", episodic_dir(0, 1), "Memory/episodic/0000-Build/Cycle-0/Week-1")

    # Round-trip every builder
    round_trips = [
        (artifact_dir(2, 4), "2", "4"),
        (b_bomb_dir(2, 4), "2", "4"),
        (insight_dir(2, 4), "2", "4"),
        (review_dir(2, 4), "2", "4"),
        (weekly_rollup_file(2, 4), "2", "4"),
        (episodic_dir(2, 4), "2", "4"),
        (plan_dir(3), "3", None),
        (mocs_dir(5), "5", None),
        (artifact_dir(0, 1), "0", "1"),
    ]
    for built, cycle, week in round_trips:
        got = parse_cycle_path(built)
        eq(
            f"round-trip {built}",
            {"cycle": got["cycle"], "week": got["week"]} if got else None,
            {"cycle": cycle, "week": week},
        )

    # Legacy paths parse with a null period (migration safety)
    legacy = parse_cycle_path("Artifacts/Cycle 1/Week 4/2026-06-08-foo.md")
    eq("legacy period is None", legacy["period"] if legacy else "MISS", None)
    eq("legacy cycle", legacy["cycle"] if legacy else "MISS", "1")

    # Non-cycle paths must NOT match
    eq("tasklist filename ignored", parse_cycle_path("Tasklists/Active/2026-09-24-week-4-controlled-lanes.md"), None)
    eq("plain string ignored", parse_cycle_path("Memory/lessons.md"), None)
    eq("None ignored", parse_cycle_path(None), None)

    failed = [c for c in checks if c[1] != c[2]]
    for name, actual, expected in checks:
        mark = "  ✅" if actual == expected else "  ❌"
        print(f"{mark} {name}")
        if actual != expected:
            print(f"      expected {expected!r} · got {actual!r}")
    print(f"\n  {len(checks) - len(failed)}/{len(checks)} checks passed")
    return not failed


def _main() -> None:
    if "--self-test" in sys.argv:
        sys.exit(0 if _self_test() else 1)
    p = read_period()
    print("🦸 AI-Suplex path contract (python)")
    print(f"  vault root : {VAULT_ROOT}")
    print(f"  period.md  : {PERIOD_FILE}")
    print(f"  period     : {p['label']}  (index {p['index']})")
    print(f"  start → end: {p['start']} → {p['end']}")
    print(f"  cycle 1    : {p['cycle1Start']}")
    print("")
    print(f"  artifact_dir(2, 4)  → {artifact_dir(2, 4)}")
    print(f"  b_bomb_dir(2, 4)    → {b_bomb_dir(2, 4)}")
    print(f"  insight_dir(2, 4)   → {insight_dir(2, 4)}")
    print(f"  review_dir(2, 4)    → {review_dir(2, 4)}")
    print(f"  mocs_dir(2)         → {mocs_dir(2)}")
    print(f"  plan_dir(2)         → {plan_dir(2)}")
    print(f"  episodic_dir(2, 4)  → {episodic_dir(2, 4)}")
    print(f"  artifact_dir(0, 1)  → {artifact_dir(0, 1)}   (pre-period)")


# ── PARITY ALIASES (exact match with Tools/paths.js) ───

periodLabel = period_label
artifactDir = artifact_dir
bBombDir = b_bomb_dir
outreachDir = outreach_dir
insightDir = insight_dir
reviewDir = review_dir
reviewCycleDir = review_cycle_dir
reviewWeeklyDir = review_weekly_dir
reviewReviewFile = review_review_file
reviewDataFile = review_data_file
mocsDir = mocs_dir
periodCardDir = period_card_dir
planDir = plan_dir
periodPlanDir = period_plan_dir
episodicDir = episodic_dir
nextStepsDir = next_steps_dir
currentPeriod = current_period
parseCyclePath = parse_cycle_path
legacyOf = legacy_of
treeLayout = tree_layout
treeRootOf = tree_root_of
periodPlanFile = period_plan_file
periodCardFile = period_card_file
weeklyRollupFile = weekly_rollup_file
derivePeriodEnd = derive_period_end
derivePeriodLabel = derive_period_label
addDays = add_days
readPeriod = read_period
resetCache = reset_cache
vaultRoot = vault_root
periodFilePath = period_file_path
absPath = abs_path
PRE_PERIOD = PRE_PERIOD_LABEL


if __name__ == "__main__":
    _main()
