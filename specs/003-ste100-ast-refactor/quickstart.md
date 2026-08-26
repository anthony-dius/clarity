# Quickstart: Verifying the AST/Rule-Based Refactor

## Run the existing test suite

```bash
bun test
```

All rule tests in `test/rules/*.test.ts` must pass (SC-001), except tests explicitly
updated to reflect a documented, intentional accuracy correction (FR-010).

## Determinism check (SC-004)

```bash
for i in 1 2 3 4 5; do bun run src/cli/index.ts fixtures/violations.md --json > /tmp/run_$i.json; done
shasum /tmp/run_*.json
```

Expect an identical hash for every run (piping through `sort -u` on lines, rather than
hashing/diffing whole outputs, is not a valid determinism check — it sorts individual
lines instead of comparing full runs). `test/cli/determinism.test.ts` already codifies
this as an automated byte-identical-stdout check.

## Interface-preservation smoke check (FR-007)

```bash
bun run src/cli/index.ts <sample-doc.md>
bun run src/cli/index.ts <sample-doc.md> --json
```

Compare output shape/fields against pre-refactor output for a document with no
intentional accuracy fix — should be identical.

## New-detection spot check (US1)

Lint a document containing a passive construction the old fixed regex missed, e.g.:

```text
The report was quickly written by the team.
The bug gets fixed by the on-call engineer.
```

Both sentences should now be flagged `passive-voice` (the first has an adverb between
auxiliary and participle; the second is a "get"-passive) — neither is reliably caught
by the prior `\b(is|are|was|were|been|be|being)\s+(\w+ed|\w+en)\b` pattern in all
phrasing.

## Build packaging check

```bash
bun build --compile ./src/cli/index.ts --outfile ./dist/clarity
./dist/clarity <sample-doc.md>
```

Confirms the compiled single-file binary still works with `compromise`/`retext`
bundled in (see research.md §5).
