# Data Model: Accurate Sentence Detection & Verbatim Suppression

No changes to the public `Finding` / `CheckResult` / `RunSummary` shapes
from spec 001 (`specs/001-ste100-cli-checker/data-model.md`). This feature
changes what a rule *sees*, not the shape of what it *reports*.

## Sentence (revised internal shape)

Same public interface as spec 001's `Sentence` (`{ text: string; line:
number }`), but `text` for a wrapped paragraph is now assembled from
multiple source lines (joined with a single space) instead of one raw
line, and `line` is the **first source line** that contributed to it.

| Field | Type | Notes |
|---|---|---|
| text | string | one logical sentence; may originate from 1+ source lines |
| line | number | 1-based, the line the sentence's first character came from |

- Constraint: a blank line, heading line, list-item line, table-row line,
  or code-fence boundary always ends the current paragraph unit — text
  never crosses one of these into the next unit (FR-002).
- Constraint: content inside a fenced code block is excluded from sentence
  output entirely (not checked, not joined) — unchanged from today's
  practical behavior, made explicit by this feature.

## Verbatim Region (new)

Detected once per file, before rule scanning.

| Field | Type | Notes |
|---|---|---|
| startLine | number | line of the start marker |
| endLine | number | line of the matching end marker |

- Constraint: regions are non-overlapping and non-nested (FR-009) — a
  second start marker before the current region's end marker is an error,
  not a second region.
- Constraint: every line from `startLine` to `endLine` inclusive is masked
  (blanked) before any rule sees the file's text (research.md — masking
  strategy).

## Marker Error (new — reuses the Finding shape)

Not a new type. Represented as a `Finding` with:

| Field | Value |
|---|---|
| ruleId | `"verbatim-marker-error"` |
| principle | `"N/A"` |
| line | the offending marker's line (unclosed start, stray end, or the second start of a nested pair) |
| message / remediation | describes which marker error and how to fix it (e.g. "add a matching `<!-- clarity:verbatim:end -->`") |

- Same pattern as spec 001's `ruleId: "file-error"` in `checkFile` — one
  Finding, `status: "fail"`, rule scanning skipped for that file (research.md).
