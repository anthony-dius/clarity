---

description: "Task list for Accurate Sentence Detection & Verbatim Suppression"
---

# Tasks: Accurate Sentence Detection & Verbatim Suppression

**Input**: Design documents from `/specs/002-detect-accuracy-suppress/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/verbatim-marker.md, quickstart.md

**Tests**: Constitution Principle I (Test-First, NON-NEGOTIABLE) mandates a failing test before every engine behavior change. Test tasks below are REQUIRED and MUST be completed (and observed failing) before their paired implementation task.

**Organization**: Grouped by user story (spec.md) for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1/US2 per spec.md priorities

## Path Conventions

Single project, extending spec 001's existing `src/engine/` — no new
top-level directories. See plan.md Project Structure.

---

## Setup / Foundational

No new setup or foundational infrastructure needed — this feature extends
spec 001's existing `src/engine/` (reader, sort, run, types) unchanged, and
US1/US2 share no new code between them (US1 touches `sentences.ts`; US2
adds a standalone `verbatim.ts` wired into `check.ts`). Both phases below
can proceed independently once the codebase is at spec 001's completed
state.

---

## Phase 1: User Story 1 - Accurate findings on normally-wrapped prose (Priority: P1) 🎯 MVP

**Goal**: `splitSentences` joins hard-wrapped paragraph lines into one
sentence, bounded by blank lines/headings/list items/code fences/table
rows, with correct line-number reporting — so all 10 existing rules stop
producing wrap-artifact false positives/miscounts.

**Independent Test**: Run the checker against a fixture with a sentence
spanning two wrapped lines where the second line starts with "this"; and a
sentence spanning three wrapped lines exceeding the long-sentence limit.
Confirm no false unclear-referent finding, and exactly one long-sentence
finding with the correct word count.

### Tests for User Story 1 (write first; MUST fail before implementation)

- [X] T001 [P] [US1] Test: `splitSentences` joins two wrapped lines into one sentence, reporting the first line, in `test/engine/sentences.test.ts`
- [X] T002 [P] [US1] Test: `splitSentences` does not join across a blank line, in `test/engine/sentences.test.ts`
- [X] T003 [P] [US1] Test: `splitSentences` does not join across a heading line, in `test/engine/sentences.test.ts`
- [X] T004 [P] [US1] Test: `splitSentences` does not join across a list-item boundary, in `test/engine/sentences.test.ts`
- [X] T005 [P] [US1] Test: `splitSentences` excludes fenced code block content from sentence output, in `test/engine/sentences.test.ts`
- [X] T006 [P] [US1] Test: `splitSentences` does not join across a table-row boundary, in `test/engine/sentences.test.ts`
- [X] T007 [P] [US1] Test: a paragraph wrapped via trailing double-space or backslash hard-break joins the same as a plain wrap (edge case, spec.md Edge Cases), in `test/engine/sentences.test.ts`
- [X] T008 [P] [US1] Regression test: `unclearReferentRule` does not false-positive on a wrapped continuation line starting with "this", in `test/rules/unclear-referent.test.ts`
- [X] T009 [P] [US1] Regression test: `longSentenceRule` reports one finding with the correct combined word count for a sentence spanning 3 wrapped lines, in `test/rules/long-sentence.test.ts`
- [X] T010 [P] [US1] Determinism test: checking the same wrapped-paragraph fixture twice produces byte-identical output, in `test/cli/determinism.test.ts`

### Implementation for User Story 1

- [X] T011 [P] [US1] Fixture: `fixtures/wrapped-paragraph.md` demonstrating the bug pattern (wrapped sentence starting with "this", a 3-line-spanning long sentence, a blank-line paragraph break, a list, a heading, a code fence, a table)
- [X] T012 [US1] Implement line classifier (blank / heading / list-item / table-row / code-fence-delimiter / prose) in `src/engine/sentences.ts` (depends on T001-T007)
- [X] T013 [US1] Implement paragraph-joining + line-remapping in `splitSentences` using the classifier, in `src/engine/sentences.ts` (depends on T012)
- [X] T014 [US1] Run the full existing suite (`bun test`) to confirm all 10 rules pass unchanged against the corrected `sentences.ts` — no rule code should need to change (depends on T013)

**Checkpoint**: User Story 1 fully functional — `clarity` no longer produces wrap-artifact findings on any hard-wrapped markdown.

---

## Phase 2: User Story 2 - Exempt verbatim content from every rule (Priority: P2)

**Goal**: A document author can wrap a block in `<!-- clarity:verbatim:start -->` / `<!-- clarity:verbatim:end -->` and have every rule skip it, with clear errors for unclosed/stray/nested markers, while the rest of the file is checked normally.

**Independent Test**: Run the checker against a fixture with one verbatim-marked paragraph (would otherwise trigger multiple findings) and one unmarked paragraph with a known violation. Confirm zero findings inside the marked block and the known violation still reported outside it.

### Tests for User Story 2 (write first; MUST fail before implementation)

- [X] T015 [P] [US2] Test: detects a matched verbatim marker pair and returns its region (start/end line), in `test/engine/verbatim.test.ts`
- [X] T016 [P] [US2] Test: detects an unclosed start marker as an error and asserts the error identifies the start marker's line (FR-008), in `test/engine/verbatim.test.ts`
- [X] T017 [P] [US2] Test: detects a stray end marker (no preceding start) as an error and asserts the error identifies the end marker's line (FR-008), in `test/engine/verbatim.test.ts`
- [X] T018 [P] [US2] Test: detects a nested start marker (second start before matching end) as an error and asserts the error identifies the second start marker's line, in `test/engine/verbatim.test.ts`
- [X] T019 [P] [US2] Test: `checkFile` masks a verbatim region so no rule reports findings inside it, while content outside the region is still checked normally, in `test/engine/check.test.ts`
- [X] T020 [P] [US2] Test: `checkFile` reports a single `ruleId: "verbatim-marker-error"` Finding — asserting both `file` and `line` match the offending marker — and skips rule scanning when a marker error is present, in `test/engine/check.test.ts`
- [X] T021 [P] [US2] Test: a file consisting entirely of one verbatim block reports a clean pass (zero findings), in `test/engine/check.test.ts`

### Implementation for User Story 2

- [X] T022 [P] [US2] Fixture: `fixtures/verbatim-block.md` (one marked block with multi-rule violations, one unmarked paragraph with a known violation)
- [X] T023 [US2] Implement verbatim region detection + start/end/nesting validation in `src/engine/verbatim.ts` (depends on T015-T018)
- [X] T024 [US2] Wire region masking (blank out matched regions before `splitSentences` runs) and marker-error Finding emission into `checkFile`, in `src/engine/check.ts` (depends on T019-T021, T023)

**Checkpoint**: User Story 2 fully functional — verbatim marking works end-to-end, independently of US1 (both may be implemented in either order; US2 does not depend on the paragraph-join fix).

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T025 [P] Run `quickstart.md`'s three scenarios manually against the compiled binary (wrapped-paragraph fix, verbatim masking, marker-error reporting) — quickstart.md's own scenario 1 example had a bug (period before the wrap point, so it wasn't actually testing the false-positive case); fixed
- [X] T026 [P] Regression: re-run the compiled binary against `specs/001-ste100-cli-checker/*.md` and `specs/002-detect-accuracy-suppress/*.md`; confirm no new false positives beyond spec 001's already-accepted exceptions (SC-005) — found and fixed two real classifier bugs surfaced by this check (field-label lines joining across entries; leading whitespace on indented continuations); all previously-clean spec 001 files remain clean, new findings elsewhere are genuine true positives
- [X] T027 Update `notes.md` items 1 and 6 to "done", noting the final marker syntax and masking approach actually shipped (notes.md had disappeared from disk outside git history — recreated)

---

## Dependencies & Execution Order

### Phase Dependencies

- No Setup/Foundational phase — both stories build directly on spec 001's completed state
- US1 (Phase 1) and US2 (Phase 2): fully independent of each other (per spec.md: "does not block or get blocked by" P1) — may be implemented in either order or in parallel
- Polish (Phase 3): depends on both desired stories being complete

### Within Each User Story

- Tests written and observed failing before their paired implementation task (Principle I)
- Within US1: T012 (classifier) before T013 (paragraph-join uses it); T014 (full-suite regression check) last
- Within US2: T023 (verbatim.ts) before T024 (wiring into check.ts)

### Parallel Opportunities

- T001–T010 (all US1 tests) run in parallel — distinct assertions, mostly the same file but independent test blocks
- T015–T021 (all US2 tests) run in parallel
- T011 (US1 fixture) and T022 (US2 fixture) can run in parallel with each other and with the opposite story's tests
- US1 and US2 as a whole can be worked in parallel (different files: `sentences.ts` vs. `verbatim.ts`/`check.ts`), though `check.ts` (US2) and `sentences.ts` (US1) do intersect at the call site in `checkFile` — coordinate if both land in the same session

---

## Parallel Example: User Story 1

```bash
# Tests:
Task: "splitSentences joins two wrapped lines into one sentence in test/engine/sentences.test.ts"
Task: "splitSentences does not join across a blank line in test/engine/sentences.test.ts"
# ... (T003-T010 similarly)

# Fixture (parallel with tests):
Task: "Create fixtures/wrapped-paragraph.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (US1): fix `splitSentences`, confirm the full existing suite still passes
2. **STOP and VALIDATE**: run `quickstart.md`'s first scenario, confirm SC-001/SC-002/SC-004
3. This alone fixes the correctness bug affecting every existing rule — ships independently of US2

### Incremental Delivery

1. US1 (accuracy fix, P1) → US2 (verbatim marking, P2) → Polish — or US2 first if that's more urgent for a specific document; the spec explicitly decouples them

### Notes

- Commit after each task or logical group.
- Total: 27 tasks — 0 setup/foundational, 14 for US1 (10 tests + 4 impl), 10 for US2 (7 tests + 3 impl), 3 polish.
