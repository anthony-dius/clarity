# Research: Standalone ASD-STE100 CLI Documentation Checker

## Distribution / runtime

- Decision: Bun + TypeScript, distributed via `bun build --compile` → single native binary per platform.
- Rationale: FR-004 (no separate runtime install) + SC-005 (<1min to first result). Bun compile bundles runtime into the binary. `bun test` covers Principle I (TDD) with zero extra deps.
- Alternatives considered: Node + pkg/nexe (extra build tool, larger binaries, slower cold start).
  Deno compile (viable, but the repo already targets TS/Bun-style tooling).
  Python + PyInstaller (larger binary, slower startup, weaker TS ecosystem fit).

## Argument parsing

- Decision: Hand-rolled minimal parser in `src/cli/`, no dependency.
- Rationale: Ten fixed flags max (file paths, `--json`, `--help`/`-h`, `--version`/`-v`). A dependency adds binary size and an update-drift risk for no real benefit at this scope (Principle V: YAGNI).
- Alternatives considered: `commander`/`yargs` — more conventional but heavier; rejected as unnecessary generality for a fixed, small flag set.

## Rule selection (top 10 ASD-STE100 principles for AI-slop verbosity)

Selected for highest hit-rate against AI-generated hedging/vague/passive prose (SC-001), each independently testable (Principle V):

| # | Rule id | ASD-STE100 principle | Detects |
|---|---|---|---|
| 1 | `passive-voice` | Use active voice | "is/are/was/were/been + past participle" constructions |
| 2 | `long-sentence` | Keep sentences short (≤20 words) | Sentences over word-count threshold |
| 3 | `one-topic-per-sentence` | Express one instruction/idea per sentence | 3+ conjunctions ("and"/"but"/"or") joining clauses |
| 4 | `hedging-modal` | Use approved words; avoid ambiguous modals | "might", "could", "should probably", "perhaps" |
| 5 | `nominalization` | Use verbs, not noun forms | Noun forms with a simpler verb ("utilization"→"use") |
| 6 | `vague-quantifier` | Be precise; avoid vague terms | "some"/"many"/"various"/"several", no concrete count |
| 7 | `filler-phrase` | Eliminate unnecessary words | Stock filler ("it is important to note that") |
| 8 | `unclear-referent` | Ensure every pronoun has one clear referent | Sentence-initial "this"/"it"/"that", no antecedent |
| 9 | `complex-word` | Use approved/simple vocabulary | Complex words with a simpler match ("utilize"→"use") |
| 10 | `inconsistent-terminology` | Use one term per concept | One concept, 2+ terms in the same document |

- Rationale: covers ASD-STE100's core pillars — one word per meaning, active voice, short sentences, one instruction per sentence.
  These rules target the verbosity, hedging, and vagueness the spec names as its goal.
- Alternatives considered: full ASD-STE100 approved-word-list enforcement.
  Rejected for v1 — bundling and maintaining a large word dictionary works against the compact-distribution goal.
  Noted as a future rule-set version candidate, not a v1 blocker.
- Validation: `fixtures/` includes one seeded-violation doc per rule plus one clean doc.
  Tests in `test/rules/` measure SC-001's ≥90% detection target against these fixtures.

## Determinism strategy

- Decision: Findings sort by `(filePath, lineNumber, ruleId)` before render.
  No output-affecting logic relies on object-key or `Set`/`Map` iteration order, and output carries no timestamps.
- Rationale: FR-007/SC-004 require byte-identical repeat runs.

## Output modes

- Decision: Single internal `CheckResult[]` → two renderers (`format/text.ts`, `format/json.ts`), never two separate code paths that recompute findings.
- Rationale: Principle II/III — text and JSON "never disagree" because they read the same data.
