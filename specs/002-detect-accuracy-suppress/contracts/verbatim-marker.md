# Contract: Verbatim Marker Syntax

The interface this feature exposes to *document authors* (not a CLI flag —
spec 001's `contracts/cli.md` is unchanged; this is a document-level
contract).

## Syntax

```markdown
<!-- clarity:verbatim:start -->
Any content here is never checked, no matter what it contains.
It is masked out before any of the 10 built-in rules run.
<!-- clarity:verbatim:end -->
```

- Each marker MUST be alone on its own line.
- Content between a matched pair — including the marker lines themselves —
  produces zero findings.
- Content outside any marked region is checked exactly as it is today.

## Error conditions

| Condition | Result |
|---|---|
| Start marker with no matching end marker before EOF | One Finding, `ruleId: "verbatim-marker-error"`, at the start marker's line. Rule scanning skipped for that file. |
| End marker with no preceding start marker | Same, at the end marker's line. |
| A second start marker before the current region's end marker | Same, at the second start marker's line (nesting is not supported — FR-009). |

Marker errors use the file's normal `status: "fail"` / non-zero exit path
— same mechanism as an unreadable or binary file (spec 001, FR-014). They
appear identically in text and JSON output (Principle II — one data model,
two renderers).

## Compatibility

- Additive only: existing documents with no markers are completely
  unaffected.
- The `ruleId: "verbatim-marker-error"` value is new but fits inside the
  existing `Finding` shape from spec 001 — no JSON schema version bump
  required (schema-stable per spec 001's Quality & Output Standards).
