# Contract: Rule interface & CLI output (must not change)

This refactor is internal-engine-only. The contracts below are what FR-007 requires to
stay stable — they are the acceptance boundary for "no caller-facing break," not new
contracts being introduced.

## Rule interface (`src/types/index.ts`)

```ts
interface Rule {
  id: string;
  name: string;
  principle: string;
  description: string;
  check(text: string, filePath: string): Finding[];
}
```

- Same 10 rule ids remain registered in `src/rules/register-all.ts`, in the same order.
- `check` signature, argument meaning, and return type are unchanged.

## Finding shape

```ts
interface Finding {
  file: string;
  line: number;
  column: number | null;
  ruleId: string;
  principle: string;
  message: string;
  remediation: string;
  excerpt: string;
}
```

- All fields remain present with the same meaning.
- `column` may now be a real number instead of always `null` for the vocabulary check
  — additive accuracy, not a breaking shape change (`number | null` already allowed it).

## CLI / process contract

- Invocation, flags, stdout/stderr split, and text/JSON output modes are unchanged.
- Exit code semantics unchanged: non-zero when findings exist, `0` when clean
  (`RunSummary.exitCode`).
- `RunSummary` and `CheckResult` shapes unchanged.

## Verification

- Existing `test/rules/*.test.ts` suite must continue to pass (SC-001), except for
  cases explicitly documented as intentional accuracy corrections.
- A CLI smoke run (`clarity <fixture-file>`) before and after the refactor must produce
  identical output for fixtures with no intentional accuracy fix applied.
