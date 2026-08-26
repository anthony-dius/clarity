---

description: "Task list for STE-100 Linter AST/Rule-Based Refactor"

---

# Tasks: STE-100 Linter AST/Rule-Based Refactor

**Input**: Design documents from `/specs/003-ste100-ast-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rule-and-cli-contract.md, quickstart.md

**Tests**: Included and REQUIRED — Constitution Principle I (Test-First, NON-NEGOTIABLE) mandates a failing test before implementation for every rule behavior change, enforced by `probity.config.ts`.

**Organization**: Tasks are grouped by user story (spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repository root

## Path Conventions

Single project. Source in `src/engine/` and `src/rules/`; tests in `test/rules/` and `test/engine/`; shared fixtures in `fixtures/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the new runtime dependencies and confirm the build still works before any rule touches them.

- [X] T001 Add `compromise` to `dependencies` in `package.json`; run `bun install` (revised: `retext`/`retext-pos` were evaluated, found less accurate than `compromise` on the canonical ASD-STE100 imperative-verb case, and dropped — research.md §1 Correction)
- [X] T002 [P] Verify `bun build --compile ./src/cli/index.ts --outfile ./dist/clarity` still produces a working binary with `compromise` bundled, per quickstart.md "Build packaging check"; run `./dist/clarity fixtures/violations.md` and confirm it exits non-zero with findings
- [X] T003 [P] Capture a pre-refactor baseline: run `bun run src/cli/index.ts fixtures/violations.md --json` and `bun run src/cli/index.ts fixtures/clean.md --json`, save output to `specs/003-ste100-ast-refactor/baseline-output.json` for later diffing in US2

**Checkpoint**: Dependencies installed, build verified, baseline captured. ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One shared AST-construction helper every rule will use. Per research.md §3, it is stateless, mirrors the existing `splitSentences` pattern, and requires no change to the `Rule`/`Finding` interface.

**⚠️ CRITICAL**: No user story task may start until this phase is complete.

- [ ] T004 [P] Write failing tests for a compromise wrapper in `test/engine/compromise-doc.test.ts`: given a sentence, `parseWithCompromise(text)` returns a compromise `Doc` whose `.match(pattern)` works for a known tag pattern (e.g. `#Auxiliary`), and whose in-context tagging correctly tags "Contact" as `#Verb` in "Contact the crew immediately." (the case that ruled out `retext-pos`)
- [ ] T005 Implement `parseWithCompromise(text)` in `src/engine/compromise-doc.ts` wrapping `nlp(text)` from `compromise`, satisfying T004
- [X] ~~T006~~ removed — folded into T004/T005 (no second `retext-pipeline.ts` helper; see research.md §3)
- [X] ~~T007~~ removed — renumbered as T005

**Checkpoint**: `src/engine/compromise-doc.ts` exists, tested, and exported. User story work can begin.

---

## Phase 3: User Story 1 - Replace fragile pattern checks with deterministic grammar analysis (Priority: P1) 🎯 MVP

**Goal**: Every existing rule detects violations via AST/pattern-matching instead of fixed regexes, catching constructions the old patterns missed (spec Acceptance Scenarios 1–3).

**Independent Test**: Lint `fixtures/violations.md` plus new fixture sentences containing constructions the old regex missed (separated auxiliary/participle, "get"-passive, POS-restricted vocabulary) and confirm every one is now flagged with the correct rule id and location.

### Tests for User Story 1 ⚠️ (write first, confirm they FAIL against the current regex implementations)

- [X] T008 [P] [US1] Add failing true-positive cases to `test/rules/passive-voice.test.ts`: an adverb-separated passive ("was quickly written") and a "get"-passive ("gets fixed"), per quickstart.md "New-detection spot check"
- [X] T009 [P] [US1] Add a regression case to `test/rules/long-sentence.test.ts` confirming a hyphenated-compound sentence at the word-count boundary still counts correctly and still passes at the boundary (word-counting mechanism intentionally kept as-is — see T015 note)
- [X] T010 [P] [US1] Add failing true-positive/true-negative cases to `test/rules/complex-word.test.ts` for "contact" used as a verb (passes, per ASD-STE100) vs. used as a noun (flags), per Acceptance Scenario 3
- [X] T011 [P] [US1] (revised) Rewrote `hedging-modal.ts`, `vague-quantifier.ts`, `nominalization.ts`, `filler-phrase.ts` internals to compromise pattern matching without a paired new-behavior test: a spike found none of these four word lists actually has an inflected form the old fixed regex missed (unlike `complex-word.ts`'s verbs), so the TDD gate correctly required behavior-preserving regression coverage (existing tests) rather than a fabricated true-positive
- [X] T012 [P] [US1] (revised) `unclear-referent.test.ts`/`one-topic-per-sentence.test.ts`: no AST-closable gap found (see T021/T022 note) — added one regression case (`unclear-referent.test.ts`: "Its" possessive) confirming the existing regex has no false positive an AST pass would fix
- [X] T013 [P] [US1] (revised) No test added: a spike proved compromise's own tokenizer splits a hyphenated compound the same way the existing regex's `\b` does (`"auto-configure"` → `"auto-"` + `"configure"` in both), so the assumed word-boundary gap doesn't exist — see T023 note

### Implementation for User Story 1

- [X] T014 [US1] Rewrote `src/rules/passive-voice.ts` to use `parseWithCompromise` per sentence (from `splitSentences`) and a pattern covering standard adverb-separated passives (`#Auxiliary+ #Adverb? (#PastTense|#PastParticiple)`) plus get-passives (`(get|gets|got|getting) #PastTense`); satisfies T008
- [X] T015 [US1] `src/rules/long-sentence.ts`: kept the existing whitespace-based word count (it already treats a hyphenated compound as one word; naive compromise term-splitting would have double-counted it — verified empirically) and added a code comment recording this as an intentionally-unchanged rule per FR-004's escape clause. Satisfies T009 as a regression guard, not a new-behavior test
- [X] T016 [US1] Defined `ApprovedVocabularyEntry[]` (per data-model.md, including a `contact`/`Verb`-only entry) in `src/rules/complex-word.ts` and rewrote its check to run `parseWithCompromise` per sentence, matching each entry by lemma (`{word}`) and, when `allowedPartsOfSpeech` is set, checking the in-context tag (`(contact && !#Verb)`) to flag disallowed usage; satisfies T010
- [X] T017 [P] [US1] Rewrote `src/rules/hedging-modal.ts` to match its existing word list via compromise (`(might|could|perhaps|maybe|should probably)`) — no behavior change, internals only
- [X] T018 [P] [US1] Rewrote `src/rules/vague-quantifier.ts` to match its existing word list via compromise (`(some|many|various|several)`) — no behavior change, internals only
- [X] T019 [P] [US1] Rewrote `src/rules/nominalization.ts` to match its existing word list via compromise — no behavior change, internals only
- [X] T020 [P] [US1] Rewrote `src/rules/filler-phrase.ts` to match its existing phrase list via compromise — no behavior change, internals only
- [X] T021 [P] [US1] (revised) Reviewed `src/rules/unclear-referent.ts`: TDD gate declined a speculative AST rewrite with no failing test (existing regex has no known gap); left unchanged with a code comment recording why, per FR-004's escape clause
- [X] T022 [P] [US1] Reviewed `src/rules/one-topic-per-sentence.ts`: same outcome as T021 — counting invariant words and/but/or has no AST-closable edge case; left unchanged with a code comment recording why
- [X] T023 [US1] (revised) Reviewed `src/rules/inconsistent-terminology.ts`: a spike showed compromise's tokenizer reproduces the same hyphenated-compound substring match as the existing regex, so there is no accuracy win available; left unchanged with a code comment recording why

**Checkpoint**: All 10 rules reviewed under the AST/rule-based refactor — 6 rewritten onto `compromise` (passive-voice, long-sentence's boundary logic confirmed safe, complex-word, hedging-modal, vague-quantifier, nominalization, filler-phrase), 3 confirmed to have no closable accuracy gap and left on regex with documented rationale (unclear-referent, one-topic-per-sentence, inconsistent-terminology). `bun test test/rules` passes: 47/47. ✅

---

## Phase 4: User Story 2 - Preserve existing linter behavior for downstream callers (Priority: P2)

**Goal**: CLI invocation, output shape, and exit codes are provably unchanged for every case that isn't an intentional accuracy fix (spec Acceptance Scenarios 1–3, contracts/rule-and-cli-contract.md).

**Independent Test**: Run the full pre-existing test suite and the T003 baseline CLI outputs against the refactored engine; confirm identical pass/fail status and diagnostic shape except for documented accuracy corrections.

### Tests for User Story 2

- [X] T024 [P] [US2] (satisfied by existing `test/rules/all-rules.test.ts`, already asserting the exact 10-id array — not duplicated in `interface-contract.test.ts` to avoid racing `test/rules/registry.test.ts`'s shared-registry mutation across files; see comment in that file)
- [X] T025 [P] [US2] Added `test/engine/interface-contract.test.ts` asserting every `Finding` from `checkFile("fixtures/violations.md")` has all of `file, line, column, ruleId, principle, message, remediation, excerpt` present with correct types (contracts/rule-and-cli-contract.md "Finding shape")

### Implementation/Verification for User Story 2

- [X] T026 [US2] Diffed CLI output against `baseline-output.json`: `clean.md` byte-identical; `violations.md` has one additional finding ("facilitate" now also flagged alongside "Utilize" in the same sentence) — documented as an intentional FR-005 fix in `specs/003-ste100-ast-refactor/accuracy-changes.md` (the old regex's non-global `.match()` only ever returned the first match per sentence)
- [X] T027 [US2] Confirmed via existing `test/cli/check.test.ts`: exit 0 for `fixtures/clean.md`, exit 1 for a failing file

**Checkpoint**: No caller-facing behavior changed except the one documented, intentional accuracy correction in `accuracy-changes.md`. ✅

---

## Phase 5: User Story 3 - Confident, low-risk verification of every rule (Priority: P3)

**Goal**: Every rule is independently, deterministically verifiable — the "100% testable, predictable" bar from the feature's motivation (spec Acceptance Scenarios 1–2, SC-002, SC-004).

**Independent Test**: Re-lint the same document 10 times and diff outputs; run each rule's documented example set in isolation and confirm the verdict always matches.

### Tests for User Story 3

- [X] T028 [P] [US3] (satisfied by existing `test/cli/determinism.test.ts`, already asserting byte-identical repeat CLI output on `fixtures/violations.md` and `fixtures/wrapped-paragraph.md`); manually re-verified with 5 repeat runs + `shasum` during Polish (verification.md)
- [X] T029 [P] [US3] Confirmed every rule's `test/rules/*.test.ts` already has both a flagging and a non-flagging case (pre-existing for most; added in T008–T013 where missing)

### Implementation for User Story 3

- [X] T030 [US3] Added a doc comment above (or appended to the existing comment on) every rule's exported `Rule` object in `src/rules/*.ts` pointing to its test file

**Checkpoint**: All 10 rules have a documented, deterministic example set; repeat-run determinism is proven by an automated test. ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories.

- [X] T031 [P] `bun test`: 92 pass, 0 fail, 30 files — satisfies SC-001 (verified stable across 3 repeat runs)
- [X] T032 Ran the full `quickstart.md` validation end-to-end; results recorded in `specs/003-ste100-ast-refactor/verification.md` (also fixed a broken determinism check in quickstart.md itself — `sort -u` on lines is not a valid whole-output comparison — replaced with whole-file hashing)
- [X] T033 [P] Reviewed `README.md`: it does not describe the linter's internals (regex vs. AST), so there is nothing inaccurate to correct — left unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — no dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2); its diffing tasks (T026) are most meaningful once US1's implementation exists, so run after Phase 3 in practice even though it has no hard code dependency on it
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2); like US2, most meaningful after Phase 3
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests (T008–T013, T024–T025, T028–T029) MUST be written and failing before their corresponding implementation tasks
- Shared engine helpers (Phase 2) before any rule rewrite (Phase 3)
- `complex-word.ts`'s `ApprovedVocabularyEntry` data structure (T016) before any task that would rely on its shape

### Parallel Opportunities

- T002 and T003 can run in parallel (Setup)
- T004 (test) then T005 (implementation) run sequentially — Foundational phase is a single helper, not two parallel tracks
- T008–T013 can all run in parallel (different test files)
- T017–T022 can all run in parallel (different rule files, independent word-list rewrites); T014, T015, T016, T023 touch rules with more novel logic and are listed separately but are also independent of each other and of T017–T022
- T024 and T025 can run in parallel (US2 tests)
- T028 and T029 can run in parallel (US3 tests)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 test-writing tasks together:
Task: "Add failing true-positive cases to test/rules/passive-voice.test.ts"
Task: "Add failing cases to test/rules/long-sentence.test.ts"
Task: "Add failing cases to test/rules/complex-word.test.ts"
Task: "Add failing cases to hedging-modal/vague-quantifier/nominalization/filler-phrase tests"
Task: "Add failing cases to unclear-referent/one-topic-per-sentence tests"
Task: "Add failing case to inconsistent-terminology test"

# Once tests exist and fail, launch independent rule rewrites together:
Task: "Rewrite src/rules/hedging-modal.ts"
Task: "Rewrite src/rules/vague-quantifier.ts"
Task: "Rewrite src/rules/nominalization.ts"
Task: "Rewrite src/rules/filler-phrase.ts"
Task: "Rewrite src/rules/unclear-referent.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks everything)
3. Complete Phase 3: User Story 1 — all 10 rules on AST/pattern-matching internals
4. **STOP and VALIDATE**: `bun test test/rules` green, quickstart.md "New-detection spot check" passes
5. This alone delivers the feature's core motivation (accurate, testable detection)

### Incremental Delivery

1. Setup + Foundational → shared parsing helpers ready
2. User Story 1 → all rules rewritten and independently tested (MVP)
3. User Story 2 → prove no caller-facing regression, document any intentional accuracy diffs
4. User Story 3 → prove determinism and per-rule example completeness
5. Polish → full quickstart run, docs update

---

## Notes

- [P] tasks touch different files with no unmet dependency
- Constitution Principle I (Test-First) is NON-NEGOTIABLE: every task in an "Implementation" section must have its corresponding test task completed and failing first
- Commit after each task or logical group
- Stop at each phase checkpoint to validate before continuing
- Any accuracy difference found in T026 must be recorded in `accuracy-changes.md`, never silently absorbed — this is what "except explicitly documented accuracy corrections" (FR-010, SC-001) requires
