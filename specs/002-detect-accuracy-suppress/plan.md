# Implementation Plan: Accurate Sentence Detection & Verbatim Suppression

**Branch**: `002-detect-accuracy-suppress` | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-detect-accuracy-suppress/spec.md`

## Summary

Fix `splitSentences` to join hard-wrapped paragraph lines into one sentence
stream (bounded by blank lines, headings, list items, code fences, table
rows), keeping accurate line numbers. Add an HTML-comment verbatim marker
pair that masks a block from all rules before they scan. Both land in the
shared engine layer — no per-rule changes, no new dependencies.

## Technical Context

**Language/Version**: TypeScript on Bun 1.3+ (same as spec 001)
**Primary Dependencies**: none — paragraph/verbatim detection is a
line-scan, same dependency-free approach as the rest of the engine (FR-003
of spec 001)
**Storage**: N/A (stateless)
**Testing**: `bun test`, TDD via `probity.config.ts`
**Target Platform**: same compiled-binary CLI as spec 001
**Project Type**: single project — extends the existing `src/engine/`
**Performance Goals**: no regression to spec 001's SC-003 (10k words <2s) —
paragraph-joining and verbatim-masking are both single linear passes
**Constraints**: zero new dependencies; zero behavior change to the 10
built-in rules' matching logic itself, only to what text/lines they see
**Scale/Scope**: one engine-level fix (sentence splitting) + one new
engine-level capability (verbatim masking), both centralized so all 10
existing rules inherit them automatically

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Test-First | New engine behavior (paragraph joiner, verbatim masker) ships with true-positive + true-negative tests, written first | PASS |
| II. CLI-First Interface | No CLI surface change — verbatim marker lives in documents, not flags; text/JSON output unaffected | PASS |
| III. Actionable Diagnostics | Marker errors (unclosed/stray/nested) produce a location + remediation finding, same shape as existing file-error findings | PASS (FR-008, FR-009) |
| IV. Deterministic & Reproducible | Line-scan algorithms only; no iteration-order or timing dependence | PASS (FR-005) |
| V. Rule Modularity & Simplicity | Fix and new capability both live in `src/engine/`, not in any rule — rules stay untouched (FR-004) | PASS |

No violations. Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/engine/
├── sentences.ts       # rewritten: paragraph-join before sentence-split, line remap
├── verbatim.ts         # new: detect marker pairs, validate, mask matched regions
├── check.ts             # updated: mask verbatim regions before calling rules
└── reader.ts, sort.ts, run.ts   # unchanged

test/engine/
├── sentences.test.ts    # extended: wrapped-paragraph, blank-line, list, heading,
│                          code-fence, table-row boundary cases
├── verbatim.test.ts     # new: marker pair, unclosed, stray, nested, whole-file cases
└── check.test.ts        # extended: verbatim region excluded from findings

fixtures/
└── wrapped-paragraph.md, verbatim-block.md   # new fixtures for the above
```

**Structure Decision**: Single project, extending spec 001's existing
`src/engine/` — no new top-level directories. `sentences.ts` and the new
`verbatim.ts` are both engine-layer, consumed by `check.ts` before rules
run, so all 10 rules in `src/rules/` need zero changes (Principle V).

## Complexity Tracking

No violations — section not applicable.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
