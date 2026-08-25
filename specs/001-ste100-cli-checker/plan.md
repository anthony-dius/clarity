# Implementation Plan: Standalone ASD-STE100 CLI Documentation Checker

**Branch**: `001-ste100-cli-checker` | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ste100-cli-checker/spec.md`

## Summary

CLI `clarity` checks 1+ files against 10 fixed ASD-STE100-derived rules. Text
+ JSON output, same data. Deterministic. Exit non-zero on findings. Ships as
single compiled binary (Bun compile) — no runtime install needed.

## Technical Context

**Language/Version**: TypeScript on Bun 1.3+
**Primary Dependencies**: none runtime (stdlib + Bun built-ins only); `commander` NOT used — hand-rolled arg parse to keep binary lean and behavior fully deterministic/testable
**Storage**: N/A (stateless, reads files, writes stdout/stderr)
**Testing**: `bun test` (built-in, no extra dep) — TDD enforced via `probity.config.ts`
**Target Platform**: macOS/Linux/Windows CLI (wherever Bun-compiled binary runs)
**Project Type**: single project — CLI tool
**Performance Goals**: 10k-word doc checked <2s (SC-003); rule engine is single-pass regex/line-scan, no backtracking blowups
**Constraints**: zero network calls; zero required runtime install (single compiled artifact, FR-004); byte-identical repeat output (FR-007, SC-004)
**Scale/Scope**: 10 fixed rules (v1), N input files per invocation, docs up to ~10k words typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Test-First | Every rule ships with true-positive + true-negative test written first; `probity.config.ts` enforces on `src/**`+`test/**` | PASS (plan: tests before impl per rule) |
| II. CLI-First Interface | Sole interface is CLI; stdin/file/flags in, stdout results, stderr errors; text + JSON both required | PASS (FR-006, FR-009) |
| III. Actionable Diagnostics | Every Finding carries file+location, rule id, ASD-STE100 principle, description, remediation instruction | PASS (FR-008, data-model Finding) |
| IV. Deterministic & Reproducible | No network, no randomness, no unordered structures in output path; findings sorted by (file, line, rule id) | PASS (FR-003, FR-007) |
| V. Rule Modularity & Simplicity | Each rule = one file/function, single responsibility, no shared mutable config beyond fixed rule-set version | PASS (data-model Rule; no custom-rule config, per FR-013) |

No violations. Complexity Tracking section not needed.

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
src/
├── cli/            # arg parsing, help/version, exit codes, output dispatch
├── rules/          # 10 rule modules, one file per rule + registry
├── engine/         # file read/decode, line/section scan, Finding assembly, sort
├── format/         # text + JSON renderers (share Finding data)
└── types/          # Rule, Finding, CheckResult shapes

test/
├── rules/          # per-rule true-positive + true-negative fixtures/tests
├── engine/         # determinism, multi-file, edge cases (empty/binary/missing)
├── format/         # text/JSON parity tests
└── cli/            # help, version, exit code, no-args tests

fixtures/           # sample docs: clean + seeded-violation, per SC-001
```

**Structure Decision**: Single project (CLI tool, no frontend/backend split).
`src/rules/` isolates each of the 10 fixed rules per Principle V; `src/engine/`
and `src/format/` share one Finding data model per Principle II/III so text and
JSON output cannot disagree.

## Complexity Tracking

No violations — section not applicable.
