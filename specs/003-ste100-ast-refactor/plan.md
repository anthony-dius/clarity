# Implementation Plan: STE-100 Linter AST/Rule-Based Refactor

**Branch**: `003-ste100-ast-refactor` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ste100-ast-refactor/spec.md`

## Summary

Replace each of the 10 existing rules' regex/string-pattern internals with
`compromise`-based AST/pattern-matching implementations — tag-based `match()` for
grammatical-shape rules (passive voice) and lemma/POS-aware matching for word-list and
vocabulary rules (complex word, hedging/modal, vague quantifier, filler phrase,
nominalization, etc.). One new stateless helper in `src/engine/` centralizes AST
construction; the `Rule`/`Finding` interfaces, CLI behavior, and rule id set are all
unchanged (FR-007).

**Revision note**: the original draft of this plan also introduced `retext`/
`retext-pos` as a second AST layer specifically for POS-tagging and per-word column
positions. An implementation spike (research.md §1 Correction) found `retext-pos`
mistags the canonical ASD-STE100 imperative-verb case ("Contact the crew" tagged as a
noun), while `compromise` tags it correctly. `retext` and its sub-packages were
removed before any rule was rewritten; `compromise` alone now covers both layers.

## Technical Context

**Language/Version**: TypeScript on Bun 1.3+ (same as specs 001/002)
**Primary Dependencies**: `compromise` only — the project's first runtime dependency;
justified below under Constitution Check
**Storage**: N/A (stateless, reads files, writes stdout/stderr — unchanged)
**Testing**: `bun test`, TDD enforced via `probity.config.ts` (unchanged)
**Target Platform**: same compiled-binary CLI (macOS/Linux/Windows) as specs 001/002 —
confirmed `bun build --compile` bundles `compromise` cleanly (research.md §5, verified
in Setup/T002)
**Project Type**: single project — extends existing `src/engine/` and `src/rules/`
**Performance Goals**: no regression to spec 001's SC-003 (10k-word doc <2s); AST
parsing is heavier per-call than regex, so parsing stays scoped per-sentence (via the
existing `splitSentences`) rather than building a whole-document parse per rule
**Constraints**: zero new caller-facing behavior changes (FR-007); deterministic,
byte-identical repeat output (FR-008, SC-004); no network calls; existing verbatim
masking (spec 002) and paragraph-aware sentence splitting (spec 002) are reused as-is,
not reimplemented in compromise
**Scale/Scope**: same 10 rule ids, same rule set — this refactor changes *how* each
rule detects violations, not what it detects (see spec Assumptions); no new rule
categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Test-First | Each rule's new AST-based behavior gets true-positive + true-negative tests before implementation; existing `test/rules/*.test.ts` continues to gate via `probity.config.ts` | PASS |
| II. CLI-First Interface | No CLI surface change; text/JSON output, flags, exit codes unchanged (FR-007, contracts/rule-and-cli-contract.md) | PASS |
| III. Actionable Diagnostics | `Finding.remediation` requirement unchanged; vocabulary check gains real `column` (additive accuracy, not a regression) | PASS |
| IV. Deterministic & Reproducible | `compromise`/`retext` are rule-based, no network/randomness/ML (research.md §5); FR-008 requires byte-identical repeat output | PASS |
| V. Rule Modularity & Simplicity | Same one-file-per-rule structure; new engine helpers are stateless and shared the same way `splitSentences` already is — no rule-to-rule coupling introduced | PASS |

**Dependency addition note** (not a constitution violation — no principle bans runtime
dependencies, but prior plans deliberately chose zero deps): adding `compromise` is
the explicit, spec-required mechanism for reaching the accuracy and testability goals
in User Story 1/3 (SC-001–SC-004). It is pure-JS, dependency-light, actively
maintained, and directly replaces hand-written logic that is the acknowledged root
cause of the bugs this feature exists to fix — see research.md §1–2 for the
alternatives considered (including `retext-pos`, evaluated and rejected on accuracy
grounds) and why hand-rolling was rejected.

No violations requiring the Complexity Tracking table.

## Project Structure

### Documentation (this feature)

```text
specs/003-ste100-ast-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── rule-and-cli-contract.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── cli/                        # unchanged
├── engine/
│   ├── sentences.ts            # unchanged (spec 002) — line-mapped sentence splitting
│   ├── verbatim.ts             # unchanged (spec 002)
│   ├── reader.ts                # unchanged
│   ├── check.ts / run.ts / sort.ts  # unchanged
│   └── compromise-doc.ts       # NEW — thin wrapper exposing parseWithCompromise(text)
├── rules/
│   ├── passive-voice.ts        # rewritten: compromise match() for passive shapes (incl. get-passive)
│   ├── long-sentence.ts        # word-count logic kept as-is (verified correct); documented why
│   ├── complex-word.ts         # rewritten: compromise + ApprovedVocabularyEntry[] (POS-aware, in-context tagging)
│   ├── hedging-modal.ts        # rewritten: compromise pattern matching (behavior-preserving)
│   ├── vague-quantifier.ts     # rewritten: compromise pattern matching (behavior-preserving)
│   ├── nominalization.ts       # rewritten: compromise pattern matching (behavior-preserving)
│   ├── filler-phrase.ts        # rewritten: compromise pattern matching (behavior-preserving)
│   ├── unclear-referent.ts     # kept as regex; no AST-closable gap found — documented why
│   ├── one-topic-per-sentence.ts   # kept as regex; no AST-closable gap found — documented why
│   ├── inconsistent-terminology.ts # kept as regex; compromise reproduces same hyphenation edge case — documented why
│   ├── register-all.ts         # unchanged — same 10 rule ids, same order
│   └── index.ts                # unchanged
└── types/index.ts               # unchanged (Rule, Finding, CheckResult, RunSummary)

test/
└── rules/*.test.ts              # extended with new true-positive cases the old regex missed; existing cases must still pass
```

**Structure Decision**: Single project, extending the existing `src/engine/` (one new
stateless helper module) and rewriting the internals of `src/rules/*.ts` in place — no
new top-level directories, no change to `src/types/index.ts`, `src/cli/`, or the
rule registry's public shape.

## Complexity Tracking

*Not applicable — no Constitution Check violations (see Dependency addition note above,
which is a documented architectural choice, not a gate failure).*
