# Quickstart: `clarity`

## Install

Download the compiled binary for your platform, place on `PATH`, `chmod +x` (no runtime install needed — FR-004).

## Check a file

```bash
clarity README.md
```

Prints PASS/FAIL per file with findings (location, rule, principle, fix) and a summary line. Exit code 0 if clean, 1 if findings.

## Check multiple files

```bash
clarity spec.md agent-instructions.md README.md
```

## Machine-readable output (CI / agent pipelines)

```bash
clarity --json spec.md > results.json
```

## Version / help

```bash
clarity --version   # tool + rule-set version
clarity --help       # usage + list of the 10 built-in rules
clarity              # no args → help
```

## Verify a clean run is silent-failure-free

```bash
: > empty.md
clarity empty.md    # exits 0, reports clean pass (not an error)
```
