# Research: Standalone ASD-STE100 CLI Documentation Checker

## Distribution / runtime

- Decision: Bun + TypeScript, distributed via `bun build --compile` → single native binary per platform.
- Rationale: FR-004 (no separate runtime install) + SC-005 (<1min to first result). Bun compile bundles runtime into the binary. `bun test` covers Principle I (TDD) with zero extra deps.
- Alternatives considered: Node + pkg/nexe (extra build tool, larger binaries, slower cold start); Deno compile (viable, but repo already has `probity.config.ts` targeting TS/Bun-style tooling); Python + PyInstaller (larger binary, slower startup, weaker TS ecosystem fit for this repo).

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
| 3 | `one-topic-per-sentence` | Express one instruction/idea per sentence | Sentences with 3+ coordinating conjunctions ("and"/"but"/"or") joining independent clauses |
| 4 | `hedging-modal` | Use approved words; avoid ambiguous modals | "might", "could", "may want to", "should probably", "perhaps" |
| 5 | `nominalization` | Use verbs, not noun forms of verbs | "-tion"/"-ment"/"-ance" nouns with a matching simpler verb ("utilization" → "use") |
| 6 | `vague-quantifier` | Be precise; avoid vague terms | "some", "many", "various", "a number of", "several" without a concrete count |
| 7 | `filler-phrase` | Eliminate unnecessary words | Stock AI filler ("it is important to note that", "in order to", "as previously mentioned") |
| 8 | `unclear-referent` | Ensure every pronoun has one clear referent | Sentence-initial "this"/"it"/"that" with no preceding noun in the same sentence |
| 9 | `complex-word` | Use approved/simple vocabulary over complex synonyms | Latinate multi-syllable words with a simpler common equivalent ("utilize"→"use", "facilitate"→"help") |
| 10 | `inconsistent-terminology` | Use one term per concept, consistently | Same normalized concept (via a small synonym map) referred to by 2+ different terms across the document |

- Rationale: covers ASD-STE100's core pillars (one word-one meaning, active voice, short simple sentences, approved vocabulary, one instruction per sentence) while targeting the verbosity/hedging/vagueness patterns most associated with AI-generated prose per the spec's stated goal.
- Alternatives considered: full ASD-STE100 vocabulary-approved-word-list enforcement (rejected for v1 — requires bundling/maintaining a large approved-word dictionary, disproportionate to compact-distribution goal; noted as a future rule-set version candidate, not a v1 blocker).
- Validation: `fixtures/` will include one seeded-violation doc per rule + one clean doc; SC-001 (≥90% detection) measured against these fixtures in `test/rules/`.

## Determinism strategy

- Decision: Findings sorted by `(filePath, lineNumber, ruleId)` before render; no use of object key iteration order or `Set`/`Map` iteration for output-affecting logic; no timestamps in output.
- Rationale: FR-007/SC-004 require byte-identical repeat runs.

## Output modes

- Decision: Single internal `CheckResult[]` → two renderers (`format/text.ts`, `format/json.ts`), never two separate code paths that recompute findings.
- Rationale: Principle II/III — text and JSON "never disagree" because they read the same data.
