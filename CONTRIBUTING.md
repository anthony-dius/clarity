# Contributing

Dev environment setup (prerequisites, building from source, this repo's
non-standard tooling) lives in [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).
This file covers how to make and submit a change.

## Test-first, no exceptions

Every rule, check, and CLI behavior is developed test-first (Red-Green-
Refactor) — a failing test before the code that satisfies it. This is
enforced mechanically by the `probity` hook on `src/**`/`test/**`, and
codified as constitution Principle I (non-negotiable). A PR without a
preceding failing test for its behavior won't be merged, hook or no hook.

```bash
bun test              # full suite
bun x tsc --noEmit     # type-check
```

Both must pass before opening a PR.

## Adding or changing a rule

Each of the 10 built-in rules lives in its own file under `src/rules/`, with
matching tests in `test/rules/`. A rule PR needs:

- A true-positive test (the rule fires on a real violation).
- A true-negative test (the rule doesn't fire on clean text).
- A concrete, actionable `remediation` string — never a bare "X detected"
  label (constitution Principle III).
- No new runtime dependency (constitution Principle V / FR-003 of spec 001:
  standalone, zero external libs).

## Feature-sized work: use spec-kit

Anything larger than a single rule or a bugfix goes through the spec-kit
workflow (`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`) rather than an ad hoc PR — see
`docs/DEVELOPMENT.md` for setup and the day-to-day command sequence. This
keeps `specs/NNN-*/` as the source of truth for why a change exists, not
just what it changed.

## Pull requests

- Include tests for the change.
- Confirm no non-deterministic behavior was introduced in default-mode
  operation (constitution Principle IV) — same input, same output, always.
- Keep the diff scoped to the stated change; unrelated cleanup goes in its
  own PR.
- PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`fix:`, `feat:`, `feat!:`, `docs:`, `chore:`, …) — CI lints this, and
  releases are versioned automatically from these titles. See
  [`RELEASE.md`](./RELEASE.md).
