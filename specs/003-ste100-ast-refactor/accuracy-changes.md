# Documented accuracy changes (post-refactor vs. baseline)

Diffed against `baseline-output.json` (captured in Setup/T003, before any rule was
rewritten), per US2/T026.

## `fixtures/clean.md`

Byte-identical output. No change.

## `fixtures/violations.md`

One additional finding, everything else unchanged:

- **New**: line 19, `complex-word`, `"facilitate"` (in `"Utilize the script to facilitate the migration."`).

**Why intentional**: the pre-refactor `complex-word.ts` used a single
`sentence.text.match(...)` call, which JavaScript's non-global `RegExp.match` returns
only the *first* match for — so a sentence containing two complex words ("Utilize"
and "facilitate") only ever reported the first one. The refactored rule checks every
`ApprovedVocabularyEntry` against the sentence, so both fire. This is required by
spec FR-005 ("System MUST report every applicable violation found in a sentence, not
only the first violation detected") and by the spec's own Edge Cases section
("sentence contains multiple overlapping violations ... All applicable violations
MUST be reported"). It is a bug fix the refactor was explicitly scoped to make, not a
caller-facing interface break — `Finding` shape, rule ids, and CLI exit-code
semantics are all unchanged (contracts/rule-and-cli-contract.md).

No other rule's output differs from baseline on either fixture.
