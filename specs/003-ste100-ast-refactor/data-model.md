# Data Model: STE-100 Linter AST/Rule-Based Refactor

No new persisted storage. This documents the in-memory shapes the refactor touches —
existing types are unchanged; one small addition supports the POS-aware vocabulary check.

## Existing types (unchanged — `src/types/index.ts`)

- **Rule**: `{ id, name, principle, description, check(text, filePath): Finding[] }`.
  Interface unchanged (FR-007); only the internals of each `check` implementation change.
- **Finding**: `{ file, line, column, ruleId, principle, message, remediation, excerpt }`.
  Shape unchanged. `column` remains `null` for every rule, including the vocabulary
  check — see research.md §1 Correction for why per-word column tracking (originally
  planned via `retext-pos`) was dropped after a spike showed it also required a less
  accurate tagger.
- **CheckResult** / **RunSummary**: unchanged.

## New: Approved Vocabulary Entry (feeds `complex-word.ts`)

Not a persisted store — a small in-module data structure listing each ASD-STE100
vocabulary decision the rule needs to enforce:

```ts
interface ApprovedVocabularyEntry {
  word: string;                    // lowercase lemma, e.g. "commence" or "contact"
  simpleAlternative?: string;      // e.g. "start" — present for disallowed complex words
  allowedPartsOfSpeech?: string[]; // compromise tags (e.g. "Verb") this word is approved under, if usage is POS-restricted
}
```

Replaces the current fixed regex alternation (`utilize[sd]?|facilitate[sd]?|...`) with
lemma entries matched via compromise's `{root}`/`{root/pos}`, so every inflection is
covered by one entry instead of a hand-enumerated suffix list. POS-restricted entries
(e.g. "contact" approved only as a verb per ASD-STE100) are checked via compromise's
in-context tagging (`(word && #Tag)`), not a standalone lemmatizer.

## AST types (from dependency, not authored here)

- **compromise match result**: term/phrase spans returned by `.match(pattern)`,
  consumed per-sentence; line number comes from the existing `Sentence.line` (from
  `splitSentences`), not from compromise itself (compromise doesn't track source line
  position — see research.md §1 Correction and §4).

## Key Entities (from spec, mapped to implementation)

| Spec entity | Implementation |
|---|---|
| Diagnostic Finding | `Finding` (unchanged shape) |
| Linting Rule | `Rule` (unchanged interface; one file per rule, unchanged set of 10 rule ids) |
| Approved Vocabulary Entry | New `ApprovedVocabularyEntry[]` inside `complex-word.ts` |
| Lint Run Result | `CheckResult` / `RunSummary` (unchanged) |
