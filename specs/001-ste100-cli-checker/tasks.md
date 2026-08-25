---

description: "Task list for Standalone ASD-STE100 CLI Documentation Checker"
---

# Tasks: Standalone ASD-STE100 CLI Documentation Checker

**Input**: Design documents from `/specs/001-ste100-cli-checker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli.md, quickstart.md

**Tests**: Constitution Principle I (Test-First, NON-NEGOTIABLE) mandates a failing test before every rule/check/CLI behavior.
Test tasks below are not optional: complete each one, and observe it fail, before its paired implementation task.

**Organization**: Grouped by user story (spec.md) for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1/US2/US3 per spec.md priorities

## Path Conventions

Single project. `src/` (cli, rules, engine, format, types), `test/` (rules, engine, format, cli), `fixtures/` at repo root — per plan.md Project Structure.

---

## Phase 1: Setup

**Purpose**: Project initialization

- [X] T001 Initialize Bun/TypeScript project: `package.json` (bin entry `clarity`), `tsconfig.json`, `bunfig.toml` at repo root
- [X] T002 [P] Create `fixtures/clean.md` — baseline fixture with zero rule violations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and engine primitives every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Define `Rule`, `Finding`, `CheckResult`, `RunSummary` types in `src/types/index.ts` (per data-model.md)
- [X] T004 [P] Implement file loader with missing/unreadable/binary-or-non-text detection in `src/engine/reader.ts` (renamed from planned `file-reader.ts`)
- [X] T005 [P] Implement deterministic finding sort (by file, line, column, ruleId) in `src/engine/sort.ts`
- [X] T006 Implement rule registry (register/list rules) in `src/rules/index.ts` (depends on T003)

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Check a document and get actionable findings (Priority: P1) 🎯 MVP

**Goal**: Run the CLI against file path(s); get per-finding location, rule, principle, and remediation.
Get a per-file result plus an overall summary, and the correct exit code.

**Independent Test**: Run CLI against a fixture with known violations and a fixture with none.
Every known violation carries a remediation instruction, and the clean fixture reports a clean pass.

### Tests for User Story 1 (write first; MUST fail before implementation)

- [X] T007 [P] [US1] True-positive + true-negative test for `passive-voice` in `test/rules/passive-voice.test.ts`
- [X] T008 [P] [US1] True-positive + true-negative test for `long-sentence` in `test/rules/long-sentence.test.ts`
- [X] T009 [P] [US1] True-positive + true-negative test for `one-topic-per-sentence` in `test/rules/one-topic-per-sentence.test.ts`
- [X] T010 [P] [US1] True-positive + true-negative test for `hedging-modal` in `test/rules/hedging-modal.test.ts`
- [X] T011 [P] [US1] True-positive + true-negative test for `nominalization` in `test/rules/nominalization.test.ts`
- [X] T012 [P] [US1] True-positive + true-negative test for `vague-quantifier` in `test/rules/vague-quantifier.test.ts`
- [X] T013 [P] [US1] True-positive + true-negative test for `filler-phrase` in `test/rules/filler-phrase.test.ts`
- [X] T014 [P] [US1] True-positive + true-negative test for `unclear-referent` in `test/rules/unclear-referent.test.ts`
- [X] T015 [P] [US1] True-positive + true-negative test for `complex-word` in `test/rules/complex-word.test.ts`
- [X] T016 [P] [US1] True-positive + true-negative test for `inconsistent-terminology` in `test/rules/inconsistent-terminology.test.ts`
- [X] T017 [P] [US1] Engine test: overlapping violations in one sentence reported as separate findings, sorted deterministically, in `test/engine/check.test.ts`
- [X] T018 [P] [US1] Engine test: empty file → clean pass (not an error) in `test/engine/empty-file.test.ts`
- [X] T019 [P] [US1] Engine test: missing/unreadable file → clear error, no crash, in `test/engine/check.test.ts` (merged into check.test.ts rather than a separate file)
- [X] T020 [P] [US1] Engine test: binary/non-decodable file → clear error identifying the file, in `test/engine/reader.test.ts` (covered at the reader layer)
- [X] T021 [P] [US1] CLI test: multi-file → per-file result + summary, exit 0/1, in `test/cli/check.test.ts`

### Implementation for User Story 1

- [X] T022 [P] [US1] Fixture: seeded-violation doc covering all rules in the built-in set in `fixtures/violations.md`
- [X] T023 [P] [US1] Implement `passive-voice` rule in `src/rules/passive-voice.ts` (depends on T007, T003)
- [X] T024 [P] [US1] Implement `long-sentence` rule in `src/rules/long-sentence.ts` (depends on T008, T003)
- [X] T025 [P] [US1] Implement `one-topic-per-sentence` rule in `src/rules/one-topic-per-sentence.ts` (depends on T009, T003)
- [X] T026 [P] [US1] Implement `hedging-modal` rule in `src/rules/hedging-modal.ts` (depends on T010, T003)
- [X] T027 [P] [US1] Implement `nominalization` rule in `src/rules/nominalization.ts` (depends on T011, T003)
- [X] T028 [P] [US1] Implement `vague-quantifier` rule in `src/rules/vague-quantifier.ts` (depends on T012, T003)
- [X] T029 [P] [US1] Implement `filler-phrase` rule in `src/rules/filler-phrase.ts` (depends on T013, T003)
- [X] T030 [P] [US1] Implement `unclear-referent` rule in `src/rules/unclear-referent.ts` (depends on T014, T003)
- [X] T031 [P] [US1] Implement `complex-word` rule in `src/rules/complex-word.ts` (depends on T015, T003)
- [X] T032 [P] [US1] Implement `inconsistent-terminology` rule in `src/rules/inconsistent-terminology.ts` (depends on T016, T003)
- [X] T033 [US1] Register the built-in rule set in `src/rules/register-all.ts` (renamed from planned `src/rules/index.ts`, which stays the registry itself)
- [X] T034 [US1] Implement per-file check orchestration (run rules, assemble Findings, sort) in `src/engine/check.ts` (depends on T004, T005, T033)
- [X] T035 [US1] Implement multi-file run + `RunSummary` aggregation in `src/engine/run.ts` (depends on T034)
- [X] T036 [US1] Implement text output renderer in `src/format/text.ts` (depends on T003, per contracts/cli.md text shape)
- [X] T037 [US1] Implement CLI entry (file-path args only, no flags yet) in `src/cli/index.ts`: run, render text, set exit code (depends on T035, T036)
- [X] T038 [US1] Wire `bin` entry point and `bun build --compile` script in `package.json` (depends on T037)

**Checkpoint**: User Story 1 fully functional and independently testable (`clarity <file>...`).

---

## Phase 4: User Story 2 - Consume results programmatically (Priority: P2)

**Goal**: `--json` flag emits structured output with the same finding data as text mode.

**Independent Test**: Run with `--json` against a fixture with known violations.
Output parses as valid data with the same findings as text mode, and repeated runs produce identical output.

### Tests for User Story 2 (write first; MUST fail before implementation)

- [X] T039 [P] [US2] Test `--json` emits parseable `RunSummary`, one entry per finding, in `test/cli/json-output.test.ts`
- [X] T040 [P] [US2] Parity test: text and JSON renderers read the same `RunSummary`, in `test/format/parity.test.ts`

### Implementation for User Story 2

- [X] T041 [US2] Implement JSON renderer in `src/format/json.ts` (depends on T003, per contracts/cli.md JSON shape)
- [X] T042 [US2] Add `--json` flag handling to `src/cli/index.ts` (depends on T037, T041)

**Checkpoint**: US1 + US2 both work; text and JSON never disagree.

---

## Phase 5: User Story 3 - Run with zero configuration (Priority: P3)

**Goal**: No-args prints help; `--help`/`-h` lists flags and the built-in rule set; `--version`/`-v` prints tool + rule-set version.

**Independent Test**: Fresh install, run with only a file path → useful output with defaults.
Separately run `--version` and `--help`, and confirm correct static output.

### Tests for User Story 3 (write first; MUST fail before implementation)

- [X] T043 [P] [US3] Test invocation with zero arguments prints help and exits 0 in `test/cli/help.test.ts`
- [X] T044 [P] [US3] Test `--help`/`-h` lists usage, flags, and every registered rule with a one-line description in `test/cli/help.test.ts`
- [X] T045 [P] [US3] Test `--version`/`-v` prints tool version and rule-set version in `test/cli/version.test.ts`

### Implementation for User Story 3

- [X] T046 [US3] Implement flag handling (files, `--json`, `--help`/`-h`, `--version`/`-v`, unknown-flag → exit 2) inline in `src/cli/index.ts` (no separate `args.ts` — the small flag set doesn't earn a dedicated module, per Principle V/YAGNI)
- [X] T047 [US3] Implement help text generator (usage + built-in rules list, read from the registry) in `src/cli/help.ts` (depends on T033 rule registry)
- [X] T048 [US3] Implement version output (tool version + rule-set version) in `src/cli/version.ts`
- [X] T049 [US3] Wire `src/cli/help.ts`, `src/cli/version.ts`, and flag handling into `src/cli/index.ts` entry (depends on T042, T046, T047, T048)

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T050 [P] Determinism regression test: run CLI twice on `fixtures/violations.md`, assert byte-identical stdout, in `test/cli/determinism.test.ts`
- [X] T051 [P] Performance test: 10,000-word fixture checked in under 2 seconds, in `test/engine/performance.test.ts` (uses `fixtures/large.md`)
- [X] T052 Run `quickstart.md` steps by hand against the compiled binary (covers SC-002, SC-005): single file, multi-file, `--json`, version, help, no-args, empty file
- [X] T053 [P] Informal detection-rate check against SC-001's ~90% target using `fixtures/violations.md`; log the observed rate — a shortfall is a documented follow-up, not a failing test, in `test/rules/detection-rate.test.ts` (result: 10/10 rules fired, 100%)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Setup — BLOCKS all user stories
- US1 (Phase 3): depends on Foundational only
- US2 (Phase 4): depends on Foundational + US1's `src/cli/index.ts` and `RunSummary` (extends, doesn't replace)
- US3 (Phase 5): depends on Foundational + US1's rule registry (T033) and CLI entry (T042)
- Polish (Phase 6): depends on all desired stories being complete

### Within Each User Story

- Tests written and observed failing before their paired implementation task (Principle I)
- Rule modules independent of each other (Principle V) — all `[P]`
- Registry/orchestration tasks depend on all rule modules in that story

### Parallel Opportunities

- T007–T021 (all US1 tests) run in parallel — distinct files
- T023–T032 (all 10 rule implementations) run in parallel — distinct files, no shared state
- T039–T040 (US2 tests), T043–T045 (US3 tests) each run in parallel within their story

---

## Parallel Example: User Story 1

```bash
# Tests (after Foundational phase complete):
Task: "True-positive + true-negative test for passive-voice in test/rules/passive-voice.test.ts"
Task: "True-positive + true-negative test for long-sentence in test/rules/long-sentence.test.ts"
# ... (T009-T021 similarly)

# Rule implementations (after their paired tests fail):
Task: "Implement passive-voice rule in src/rules/passive-voice.ts"
Task: "Implement long-sentence rule in src/rules/long-sentence.ts"
# ... (T025-T032 similarly)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup (Phase 1) → Foundational (Phase 2)
2. Phase 3 (US1): built-in rule set + text output + exit codes
3. **STOP and VALIDATE**: run against `fixtures/violations.md` and `fixtures/clean.md`, confirm SC-003/SC-004; check SC-001's ~90% target informally
4. `clarity <file>` is a usable MVP at this point

### Incremental Delivery

1. Foundation → US1 (MVP: text-mode checker) → US2 (JSON mode for CI/agents) → US3 (help/version polish) → Polish phase

### Notes

- Commit after each task or logical group.
- Rule tasks (T023-T032) are the highest-value parallelization opportunity — 10 independent files.
  FR-013 treats ten as a current target, not a hard-fixed number.
- SC-001 (~90% detection) and FR-013 (rule count) are targets, not release-blocking gates (constitution v1.1.0) — T053 tracks SC-001 informally rather than as a pass/fail check.
- Total: 53 tasks — 6 setup/foundational, 30 for US1 (MVP), 4 for US2, 7 for US3, 4 polish.
