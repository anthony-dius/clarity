# Research: STE-100 Linter AST/Rule-Based Refactor

## 1. AST/POS layer: compromise only (retext-pos evaluated and rejected)

**Decision**: Use `compromise` for POS-aware vocabulary/part-of-speech checks, not
the `retext`/`retext-pos` family. (Superseded an earlier draft of this research that
picked `retext-pos` for real line/column positions — see "Correction" below.)

**Rationale**: `compromise` tags words in full sentence context (`#Noun`/`#Verb`/etc.)
and exposes lemma-aware matching (`{root}`), which the vocabulary check needs to
recognize a word's approved part of speech regardless of inflection.

**Correction (found during implementation spike, before any rule code was written)**:
The original research/plan draft chose `retext-english` + `retext-pos` specifically
for real per-word line/column positions. A spike test tagging the canonical
ASD-STE100 example — `"Contact the crew immediately."`, where "Contact" must be
tagged as a verb — showed `retext-pos` mistags sentence-initial imperative "Contact"
as `NN` (noun), while `compromise` correctly tags it `Verb` in the same sentence.
Shipping the less-accurate tagger would reintroduce, in a new form, exactly the class
of false-negative this refactor exists to remove (spec Acceptance Scenario 3, SC-003).
`retext`/`retext-english`/`retext-pos`/`retext-stringify` were therefore removed as
dependencies before any rule was rewritten; `compromise` alone now covers both the
AST/POS layer and the pattern-matching layer. Real per-word `column` (rather than
`null`) is dropped as a result — FR-006 requires column only "where determinable,"
and every other rule already reports `column: null`, so this keeps the vocabulary
check's diagnostics consistent with the rest of the linter rather than introducing a
one-off richer shape purely to preserve a decision the spike disproved.

**Alternatives considered**:
- Hand-rolled tokenizer/tagger — reinvents the exact class of edge-case bugs this
  refactor exists to remove; rejected.
- `retext-pos` for tagging — empirically less accurate than `compromise` on the
  canonical imperative-verb case central to this rule; rejected (see Correction above).

## 2. Pattern-matching layer: compromise

**Decision**: Use `compromise`'s tag-based `match()` mini-language (e.g.
`'#Auxiliary #Adverb? (#PastTense|#PastParticiple)'`) for passive-voice detection, and its
lemma-aware `{root}` / `{root/pos}` matching for the dictionary-style rules (complex word,
hedging/modal, vague quantifier, filler phrase, nominalization).

**Rationale**: The current regex lists (e.g. `utilize[sd]?|facilitate[sd]?|...`) hand-enumerate
inflections and silently miss forms nobody thought to add (e.g. "utilizing"). Compromise's
`{root}` form matches every inflection of a word by lemma in one pattern, and `#Tag` matching
replaces the single fixed passive-voice regex with a real grammatical pattern, covering
constructions (e.g. separated auxiliary/participle, "get"-passives) the current fixed
pattern cannot.

**Alternatives considered**:
- A custom nlcst visitor doing the same job as compromise's `match()` — strictly more
  code for equivalent behavior; rejected (compromise's pattern language is the arguably-simplest
  fit for "does this sentence contain grammatical shape X").
- Expanding the existing regex lists — does not fix the root cause (fragile, unverifiable
  fixed patterns); rejected per the feature's own motivation.

## 3. Where parsing lives: one shared engine helper, not a new Rule interface

**Decision**: Add one small, stateless helper, `src/engine/compromise-doc.ts`,
exposing `parseWithCompromise(text): Doc` (a thin wrapper over compromise's
`nlp(text)`). Each rule calls it; the `Rule.check(text, filePath): Finding[]`
interface (`src/types/index.ts`) is unchanged.

**Rationale**: This mirrors the existing pattern (`src/engine/sentences.ts`'s
`splitSentences` is already a shared, stateless helper multiple rules import).
Centralizing "how do we get a compromise doc" in the engine layer avoids ~10
duplicated `nlp()` calls while keeping every rule file single-responsibility and
independently testable (Constitution Principle V). It requires no change to
`checkFile`/`runCheck` or the public `Rule`/`Finding` types. (An earlier draft also
planned a second `retext-pipeline.ts` helper; dropped along with the `retext`
dependency — see §1 Correction.)

**Alternatives considered**:
- Each rule constructs its own `nlp()` call inline — duplicated, harder to keep
  consistent; rejected.
- Refactor `check.ts` to parse once up front and pass a shared doc into every rule —
  larger surface change than the spec requires (would change the `Rule` interface);
  rejected as disproportionate to the stated scope (FR-007 requires the interface to
  stay stable).

## 4. Line attribution: keep the existing sentence splitter

**Decision**: Every rule continues to iterate `splitSentences(text)` (from spec 002,
already paragraph-joining- and verbatim-mask-aware) and runs `parseWithCompromise` on
each sentence's text, keeping that sentence's existing `line` number and reporting
`column: null` — the same shape every rule already used before this refactor.

**Rationale**: Spec 002 already solved hard-wrapped-paragraph line attribution and
verbatim masking; redoing that inside compromise's own tokenizer would re-litigate a
solved problem for no behavior change. Per-sentence parsing also keeps every rule
uniform — no rule needs whole-document parsing once the vocabulary/POS check also
moved to per-sentence compromise tagging (§1 Correction).

**Alternatives considered**:
- Build one whole-document compromise doc and slice it per sentence — no accuracy or
  performance benefit found for this rule set, and it would require re-deriving each
  sentence's line number from character offsets instead of reusing `splitSentences`;
  rejected as unnecessary complexity.

## 5. Determinism & packaging

**Decision**: No further research needed on determinism — `compromise` is a pure
rule-based JS library with no network calls, randomness, or ML inference, so
Constitution Principle IV (Deterministic & Reproducible Checks) holds unchanged.

**Verified during Setup (T002)**: `bun build --compile` produces a working
single-file binary with `compromise` bundled — confirmed by compiling and running it
against `fixtures/violations.md` before any rule was rewritten.
