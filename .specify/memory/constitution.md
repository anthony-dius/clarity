<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (first concrete adoption of the template)
Added sections:
  - Core Principles I-V (Test-First, CLI-First Interface, Actionable Diagnostics,
    Deterministic & Reproducible Checks, Rule Modularity & Simplicity)
  - Quality & Output Standards
  - Development Workflow
  - Governance
Removed sections: none (template placeholders replaced with concrete content)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (verify Constitution Check gate references TDD/CLI/determinism principles)
  - .specify/templates/spec-template.md ⚠ pending (verify no conflicting mandatory sections)
  - .specify/templates/tasks-template.md ⚠ pending (verify task categories include rule/check task type and test-first ordering)
  - .specify/templates/commands/*.md ⚠ pending (verify no agent-specific-only references)
  - README.md — not present; no action
Follow-up TODOs: none
-->

# Clarity Constitution

Clarity is a command-line documentation quality checker — linting for documentation,
specs, agent instructions, and any content destined for system prompts, context, or
project memory. It inspects such documents and returns actionable, prompt-style
remediation instructions that an agent or end user can act on directly.

## Core Principles

### I. Test-First (NON-NEGOTIABLE)
Every rule, check, and CLI behavior MUST be developed test-first: a failing test is
written and approved before implementation code is written (Red-Green-Refactor).
No check ships without an automated test proving both its true-positive detection
and its true-negative (non-flagging) behavior. This is enforced mechanically via
`probity.config.ts` (`enforceTdd()`) across `src/**` and `test/**`; the constitution
codifies it as non-negotiable project policy, not merely tooling.

**Rationale**: Clarity's entire value is trustworthy detection. A linter that
silently regresses its own rules is worse than no linter — false confidence in
document quality flows downstream into agent prompts and specs.

### II. CLI-First Interface
Every capability MUST be exposed through the command-line interface as a first-class
citizen — no functionality may exist only as an internal library call. The CLI MUST
follow a text in/out protocol: input via stdin, file paths, or flags; results to
stdout; errors and diagnostics to stderr. Every command MUST support both a
human-readable output mode and a machine-readable (JSON) output mode, selectable via
a flag, so Clarity can run interactively or be piped into other agent tooling.

**Rationale**: Clarity is consumed both by humans fixing docs and by agents
consuming its output as instructions. Dual-format output is required for both
audiences without duplicating logic.

### III. Actionable Diagnostics
Every finding Clarity reports MUST include a specific, actionable remediation
instruction written in imperative, prompt-style language ("Add a concrete example
to section X", "Replace vague term 'should' with a testable requirement") — never a
bare label like "vague language detected" with no next step. Findings MUST identify
the exact location (file, line/section) they apply to. A check that cannot produce
a concrete remediation instruction MUST NOT ship as a check.

**Rationale**: Clarity's stated purpose is to return instructions an agent or user
can act on directly, not merely to flag problems. A finding without a fix path
fails the core product requirement.

### IV. Deterministic & Reproducible Checks
Given the same input document and configuration, a check MUST always produce the
same finding set. Checks MUST NOT depend on non-deterministic external calls (e.g.,
unpinned LLM sampling, network lookups with variable results) as the sole basis for
a finding used in default/CI-safe operation. Any optional AI-assisted or
probabilistic check MUST be clearly segregated (its own opt-in mode/flag) and
labeled as advisory rather than pass/fail.

**Rationale**: Clarity is meant to run as a quality gate (e.g., in CI, in an agent's
pre-flight checks). Non-deterministic results undermine trust in the gate and make
failures unreproducible.

### V. Rule Modularity & Simplicity
Each check/rule MUST be a small, self-contained, independently testable unit with a
single clear responsibility — no monolithic "check everything" functions. New rules
MUST be addable without modifying unrelated rules. Prefer the simplest
implementation that satisfies a rule's contract; do not add configuration options,
abstractions, or generality beyond what the current set of rules actually requires
(YAGNI).

**Rationale**: A documentation linter grows through accretion of many small rules
over time. Modularity keeps that growth tractable and keeps Principle I's
test-per-check requirement meaningful.

## Quality & Output Standards

- Every CLI command MUST exit with a non-zero status code when actionable findings
  of at least the configured severity threshold are present, and zero otherwise, so
  Clarity can be used as a CI gate.
- JSON output MUST be schema-stable across patch/minor versions; breaking changes to
  the JSON output schema require a MAJOR version bump of Clarity itself (independent
  of this constitution's versioning).
- Human-readable output MUST be readable as plain text with no required terminal
  color support (colors, if used, are additive only).

## Development Workflow

- All new checks and CLI behavior follow: write failing test → get it reviewed/
  approved → implement → refactor (Principle I).
- Pull requests/reviews MUST verify: the change includes tests, any new check
  produces an actionable remediation message (Principle III), and no
  non-deterministic default-mode behavior was introduced (Principle IV).
- Use `CLAUDE.md` and the current `plan.md` under `specs/` for day-to-day runtime
  development guidance (tech stack, structure, commands); this constitution governs
  non-negotiable principles, not implementation detail.

## Governance

This constitution supersedes all other project practices and conventions where they
conflict. Amendments require: (1) a documented rationale for the change, (2) an
explicit version bump following semantic versioning, and (3) propagation of any
resulting changes to dependent templates (`plan-template.md`, `spec-template.md`,
`tasks-template.md`, command docs) in the same change.

**Versioning policy**:
- MAJOR: backward-incompatible principle removal or redefinition.
- MINOR: a new principle or materially expanded section added.
- PATCH: wording clarifications, typo fixes, non-semantic refinements.

All feature plans, specs, and task lists MUST verify compliance with these
principles before implementation begins (see Constitution Check gates in
`plan-template.md`). Any deviation MUST be justified in the plan's Complexity
Tracking section or rejected in favor of a simpler, compliant approach.

**Version**: 1.0.0 | **Ratified**: 2026-08-25 | **Last Amended**: 2026-08-25
