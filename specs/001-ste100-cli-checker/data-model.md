# Data Model: Standalone ASD-STE100 CLI Documentation Checker

## Rule

Fixed, built-in (10 total, v1). Immutable at runtime — no user-authored rules.

| Field | Type | Notes |
|---|---|---|
| id | string | kebab-case, stable across versions (e.g. `passive-voice`) |
| name | string | short human name |
| principle | string | named ASD-STE100 principle it derives from |
| description | string | what it detects |
| remediationTemplate | string | template used to render a Finding's remediation instruction; may include `{match}`/`{suggestion}` placeholders |

- Relationship: 1 Rule → 0..N Findings per file.
- Constraint (FR-013): exactly 10 rules in v1; count/content change requires rule-set version bump.

## Finding

One reported violation of one Rule at one location in one file.

| Field | Type | Notes |
|---|---|---|
| file | string | path as given/resolved on CLI |
| line | number | 1-based line number |
| column | number \| null | 1-based column when known, else null |
| ruleId | string | FK → Rule.id |
| principle | string | copied from Rule.principle (denormalized for FR-002 traceability in output) |
| message | string | plain-language description of this specific instance |
| remediation | string | concrete, actionable instruction (Principle III) |
| excerpt | string | offending text snippet |

- Ordering: Findings within a CheckResult sorted by `(line, column, ruleId)` — determinism (FR-007).
- Constraint: one Finding per (rule, location) — overlapping rule violations at the same sentence produce separate Findings (edge case in spec), never merged.

## CheckResult

Outcome of checking one file.

| Field | Type | Notes |
|---|---|---|
| file | string | |
| status | `"pass"` \| `"fail"` | fail iff findings.length > 0 |
| findings | Finding[] | empty array on pass (FR-012: still emitted, never omitted) |

## RunSummary

Aggregate across all files in one invocation.

| Field | Type | Notes |
|---|---|---|
| toolVersion | string | |
| ruleSetVersion | string | ties every Finding back to a fixed rule definition (FR-005) |
| results | CheckResult[] | one per input file, in input order |
| filesChecked | number | |
| filesPassed | number | |
| filesFailed | number | |
| totalFindings | number | |
| exitCode | 0 \| 1 | 1 iff totalFindings > 0 (FR-010) |

- This is the single object both `format/text.ts` and `format/json.ts` render from (Principle II/III: no divergence).

## State / lifecycle

No persistence, no mutation across runs — each invocation is a pure function: `(files, flags) → RunSummary`. No state transitions beyond per-file pass/fail.
