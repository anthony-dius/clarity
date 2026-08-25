# CLI Contract: `clarity`

## Invocation

```text
clarity [options] <file...>
```

- `<file...>`: 1+ paths, required for a check run. Zero args → print help, exit 0.

## Options

| Flag | Alias | Effect |
|---|---|---|
| `--json` | | Emit machine-readable JSON `RunSummary` to stdout instead of text |
| `--help` | `-h` | Print usage + list of 10 built-in rules (id + one-line description), exit 0 |
| `--version` | `-v` | Print tool version + rule-set version, exit 0 |

No other flags in v1 (FR-013: no custom-rule config).

## Exit codes

| Code | Meaning |
|---|---|
| 0 | All checked files passed (zero findings), or `--help`/`--version` invoked, or zero args (help path) |
| 1 | 1+ finding across checked files |
| 2 | Usage/runtime error — unreadable/missing/non-text file, unknown flag |

## stdout / stderr

- stdout: check results (text or JSON per `--json`), help text, version text.
- stderr: errors (missing file, unreadable file, non-text file, unknown flag).
  Errors never mix into stdout, so `--json` output always parses cleanly.

## Text output shape (human-readable, default)

```text
<file>: <status: PASS|FAIL> (<n> finding(s))
  <line>:<col>  [<ruleId>]  <message>
    principle: <principle>
    fix: <remediation>

Summary: <filesChecked> checked, <filesPassed> passed, <filesFailed> failed, <totalFindings> findings
```

- One block per input file, in input order; PASS files still print their header line (FR-012).

## JSON output shape (`--json`)

Serializes `RunSummary` (see data-model.md) directly:

```json
{
  "toolVersion": "string",
  "ruleSetVersion": "string",
  "filesChecked": 0,
  "filesPassed": 0,
  "filesFailed": 0,
  "totalFindings": 0,
  "results": [
    {
      "file": "string",
      "status": "pass",
      "findings": [
        {
          "file": "string",
          "line": 1,
          "column": null,
          "ruleId": "string",
          "principle": "string",
          "message": "string",
          "remediation": "string",
          "excerpt": "string"
        }
      ]
    }
  ]
}
```

- Same field set as the text renderer reads from.
  No field is present in one mode and absent in the other (Principle II).
- Stable schema across patch/minor tool versions (constitution: Quality & Output Standards) — breaking change requires MAJOR bump.

## Determinism contract

Same file content + same tool/rule-set version → byte-identical stdout across repeated invocations (FR-007, SC-004). No timestamps, no non-deterministic ordering in either output mode.
