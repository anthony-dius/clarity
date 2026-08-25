# Feature Specification: Standalone ASD-STE100 CLI Documentation Checker

**Feature Branch**: `001-ste100-cli-checker`
**Created**: 2026-08-25
**Status**: Draft
**Input**: User description: "the initial cli will allow checking doccumentation using the core principles embodied in ASD-STE100. the tool should be standalone and be able to provide accurate guidance without refernce to external libs or services, yet be a conpact distribution, if possible. it should be versioned from the start have conventional and logical invocation parameters and sensible defaults. deterministic output. guidance traceable back to STE100 principles. concentrate on top ten most effective rules for eliminating 90% of ai produced slop verbniage"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check a document and get actionable findings (Priority: P1)

A user runs the tool against a single documentation file (e.g., a spec, an
agent-instructions file, or a README destined for a system prompt) and receives
a list of findings, each pointing to the exact location of a problem, the
writing rule it violates, and a concrete instruction for fixing it.

**Why this priority**: This is the entire value proposition of Clarity. Without
this, there is no product — everything else is refinement around this core loop.

**Independent Test**: Run the CLI against a fixture document containing known
violations of the ten built-in rules and a fixture document with none. The tool
must report every known violation with a specific remediation instruction and
must report a clean pass on the violation-free document.

**Acceptance Scenarios**:

1. **Given** a document containing a passive-voice sentence, **When** the user
   runs the check, **Then** the tool reports a finding at that sentence's
   location naming the violated rule and instructing the user to rewrite it in
   active voice, with an example of the rewrite pattern.
2. **Given** a document with no rule violations, **When** the user runs the
   check, **Then** the tool reports a clean pass (zero findings) and exits
   successfully.
3. **Given** a document with multiple violations of different rules, **When**
   the user runs the check, **Then** the tool reports every violation found,
   each attributed to its own rule.

---

### User Story 2 - Consume results programmatically (Priority: P2)

A user or an agent pipeline runs the tool in a mode that emits machine-readable
output, so results can be parsed and acted on automatically (e.g., in CI, or as
input to another agent step) instead of being read by a human.

**Why this priority**: Clarity's stated purpose includes guiding agents, not
just humans. Structured output is required for that use case but is secondary
to the core detection loop working at all.

**Independent Test**: Run the CLI with the machine-readable output flag against
a fixture document with known violations and verify the output parses as valid
structured data containing the same findings (location, rule, message,
remediation) as the human-readable mode.

**Acceptance Scenarios**:

1. **Given** a document with known violations, **When** the user requests
   machine-readable output, **Then** the tool emits structured data containing
   one entry per finding with location, rule identifier, description, and
   remediation instruction.
2. **Given** the same document and the same tool version, **When** the check is
   run twice, **Then** both runs produce identical structured output.

---

### User Story 3 - Run with zero configuration (Priority: P3)

A first-time user installs the tool and, without reading any documentation or
setting any options, runs it against a file and gets useful, correctly
formatted results. They can also ask the tool for its version and for a list of
available options.

**Why this priority**: Lowers the barrier to adoption and reflects the
"sensible defaults" requirement, but the tool already delivers its core value
without this polish.

**Independent Test**: On a clean environment, install the tool and run it with
only a file path argument (no other flags); verify useful output is produced.
Separately invoke the version flag and the help flag and verify both return
immediately with correct, static information.

**Acceptance Scenarios**:

1. **Given** a freshly installed copy of the tool, **When** the user runs it
   against a file with no other arguments, **Then** it produces human-readable
   findings using default settings without error.
2. **Given** the installed tool, **When** the user requests the version,
   **Then** the tool prints its own version and the version of its built-in
   rule set.
3. **Given** the installed tool, **When** the user requests help, **Then** the
   tool lists its commands, flags, and the ten built-in rules with a one-line
   description of each.

### Edge Cases

- What happens when the input file is empty? The tool MUST report a clean pass
  rather than an error.
- What happens when the input path does not exist or is not readable? The tool
  MUST report a clear, actionable error and MUST NOT crash with an unhandled
  exception.
- What happens when the input file is binary or not decodable as text? The tool
  MUST detect this and report a clear error identifying the file, rather than
  producing garbled or misleading findings.
- What happens when multiple files are passed and only some contain
  violations? The tool MUST report per-file results plus an overall summary,
  clearly distinguishing which files passed and which did not.
- What happens when a single sentence or section violates more than one of the
  ten rules at once? The tool MUST report each violated rule as a separate
  finding rather than merging or hiding overlapping violations.
- How does the tool behave with no arguments at all? It MUST print help/usage
  information rather than checking nothing silently or erroring unhelpfully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tool MUST accept one or more file paths as command-line
  arguments and check the contents of each against a fixed set of exactly ten
  built-in writing rules derived from ASD-STE100 principles.
- **FR-002**: Each of the ten built-in rules MUST be traceable to a specific,
  named ASD-STE100 writing principle, and every finding produced by that rule
  MUST cite the principle it is based on.
- **FR-003**: The tool MUST run fully standalone: it MUST NOT make network
  calls and MUST NOT depend on any external service being reachable to produce
  a result.
- **FR-004**: The tool MUST be distributable as a single, compact,
  self-contained artifact that requires no separate runtime installation step
  beyond obtaining and placing that artifact on the user's system.
- **FR-005**: The tool MUST report its own version on request, and that version
  report MUST also identify the version of the built-in rule set in effect, so
  that a finding can always be tied back to a specific, fixed rule definition.
- **FR-006**: The command-line interface MUST use conventional argument and
  flag conventions (long flags, short aliases where sensible, a help flag) and
  MUST require no mandatory flags for the common case: checking a file with
  only its path as an argument MUST produce useful output.
- **FR-007**: For a given input file and a given tool/rule-set version, running
  the check MUST produce identical output across repeated runs (deterministic
  — no reliance on timestamps, random ordering, unordered data structures, or
  other run-to-run variation in the reported findings).
- **FR-008**: Every finding MUST include: the file and location (e.g., line or
  section) it applies to, the identifier of the violated rule and the ASD-STE100
  principle it maps to, a plain-language description of the problem, and a
  specific, actionable remediation instruction the user or an agent can act on
  directly.
- **FR-009**: The tool MUST support at least two output modes — human-readable
  text (the default) and machine-readable structured output (selected via a
  flag) — both derived from the same underlying finding data so they never
  disagree.
- **FR-010**: The tool MUST exit with a non-zero status code when any finding
  is reported for any checked file, and a zero status code when every checked
  file passes with no findings.
- **FR-011**: The tool MUST support checking multiple files in a single
  invocation and MUST report both per-file results and an overall summary
  (files checked, files passed, files failed, total findings).
- **FR-012**: The tool MUST explicitly report a clean pass for a file with zero
  findings rather than producing no output for that file.
- **FR-013**: The initial version targets a curated set of built-in rules
  (around ten); no user-authored custom rules are supported in v1. The exact
  rule count MAY be adjusted during implementation if research shows a
  different set better serves SC-001. Any change to the rule set after the v1
  release SHOULD be accompanied by a rule-set version change, but this is
  guidance rather than a hard release-blocking gate.
- **FR-014**: The tool MUST detect unreadable, missing, or non-text input files
  and report a clear, actionable error identifying the offending file, without
  crashing or producing a partial/misleading result for that file.
- **FR-015**: When invoked with no arguments, the tool MUST print usage/help
  information rather than checking nothing silently or failing with an
  unexplained error.

### Key Entities

- **Rule**: One of the ten fixed, built-in checks. Has an identifier, a short
  name, the ASD-STE100 principle it is derived from, a description of what it
  detects, and a remediation instruction template used to generate findings.
- **Finding**: One reported violation of a Rule within a checked file. Has the
  source file, a location within that file, the Rule it violates, a
  human-readable description, and a concrete remediation instruction.
- **Check Result**: The outcome of checking one file: the list of Findings (if
  any), a pass/fail status, and summary counts; when multiple files are
  checked, an overall summary aggregates each file's Check Result.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** (target, not a hard release gate): Given documents seeded with
  known AI-generated verbose/vague writing patterns, the built-in rules
  together aim to flag a high majority of the seeded patterns (informal
  target: ~90%). A shortfall against this target is acceptable if documented,
  rather than blocking release.
- **SC-002**: A user unfamiliar with ASD-STE100 can read any single finding and
  correctly identify what text to change and how, in under 30 seconds, without
  consulting any resource outside the tool's own output.
- **SC-003**: Checking a typical document (up to 10,000 words) completes in
  under 2 seconds on ordinary consumer hardware with no network connection
  available.
- **SC-004**: Running the tool twice against the same unmodified file always
  produces byte-for-byte identical output.
- **SC-005**: A new user can go from obtaining the tool to seeing their first
  successful check result in under 1 minute, with a single installation step
  and no configuration.
- **SC-006**: 100% of findings cite a specific, verifiable ASD-STE100 principle
  rather than a generic or unattributed warning.

## Assumptions

- Target documents are primarily English-language plain text or Markdown:
  specs, agent instructions, READMEs, and similar prose destined for human
  reading or for inclusion in an LLM system prompt/context.
- "Compact distribution" means the tool ships as a single self-contained
  package or binary with no required separate language runtime install step
  assumed on the target machine; the exact packaging mechanism is a planning
  decision, not a specification concern.
- The specific selection of rules (target: around ten) is the highest-impact
  subset of ASD-STE100 principles for catching verbose, hedging, passive, or
  vague AI-generated prose; the exact rule list and count are finalized during
  planning/research and weighed against SC-001 as a goal, not a fixed
  specification requirement.
- For the initial version, the tool and its built-in rule set share a single
  version number; tracking them as independently versionable artifacts is out
  of scope for v1.
- No external configuration file is required or supported in v1; all behavior
  is controlled via command-line flags and built-in defaults.
- Non-English documents are out of scope for v1.
