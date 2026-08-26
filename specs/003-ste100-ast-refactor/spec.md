# Feature Specification: STE-100 Linter AST/Rule-Based Refactor

**Feature Branch**: `003-ste100-ast-refactor`
**Created**: 2026-08-26
**Status**: Draft
**Input**: User description: "Add feature: Refactor handcranked STE-100 linter to AST/Rule-based engines (Compromise + Retext). Our current custom/handcranked ASD-STE100 linter implementation is difficult to test, hard to verify for correctness, and prone to edge-case bugs. We need to refactor the linting pipeline to use deterministic, rule-based Node.js libraries (`compromise` and `retext`) to ensure 100% testable, predictable verification of AI agent handoffs. As an AI Agent System Administrator, I want agent outputs to be compiled and linted against strict ASD-STE100 rules via deterministic AST and syntax parsers, so that ambiguous instructions, passive voice, and unapproved vocabulary are caught and rejected prior to downstream agent execution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Replace fragile pattern checks with deterministic grammar analysis (Priority: P1)

As an AI Agent System Administrator, I want the linter's grammar-related checks (passive voice, sentence length, vocabulary) to be based on actual sentence structure rather than surface-level text patterns, so that the linter catches real violations and does not miss or misreport them due to wording variations the current checks weren't written to anticipate.

**Why this priority**: This is the core motivation for the refactor. The current pattern-based checks are known to produce false negatives and false positives on inputs the original patterns didn't anticipate, which undermines trust in the linter's verdict on AI agent handoffs. Without this, no other improvement matters.

**Independent Test**: Can be fully tested by running the linter against a corpus of documents containing known passive-voice constructions, oversized sentences, and unapproved vocabulary phrased in ways the old patterns miss, and confirming every violation is now detected with a correct diagnostic.

**Acceptance Scenarios**:

1. **Given** a document containing a passive-voice sentence using a structure not covered by the old fixed pattern (e.g. an auxiliary and past participle separated by an adverb, or a passive construction using "get"), **When** the document is linted, **Then** the linter flags the sentence as passive voice with the correct rule identifier and location.
2. **Given** a document containing a sentence with a word count at, just under, and just over the configured limit for its sentence type, **When** the document is linted, **Then** sentences at or under the limit pass and sentences over the limit are flagged with the correct word count and limit in the message.
3. **Given** a document using a word that is grammatically valid in its approved form but appears in a disallowed part of speech (e.g. an approved noun used as a verb), **When** the document is linted, **Then** the linter flags the disallowed usage while allowing the approved usage elsewhere in the same document.

---

### User Story 2 - Preserve existing linter behavior for downstream callers (Priority: P2)

As a developer integrating with the linter (CLI user or calling agent/service), I want the linter's inputs, outputs, and exit codes to work exactly as they do today, so that upgrading the linting engine does not break any existing automation, CI pipeline, or agent workflow that depends on it.

**Why this priority**: The linter is already in use; a behavior-preserving interface is what makes it safe to ship the internal engine replacement without a coordinated migration of every caller.

**Independent Test**: Can be fully tested by running the existing linter test suite and CLI usage examples unchanged against the refactored engine and confirming identical pass/fail status, exit codes, and diagnostic shape (file, line, column, rule identifier, message, severity) for every case that isn't an intentional accuracy fix.

**Acceptance Scenarios**:

1. **Given** a document that currently passes all checks, **When** it is linted with the refactored engine, **Then** it still passes with exit code 0.
2. **Given** a document that currently fails one or more checks, **When** it is linted with the refactored engine, **Then** it still fails with the same rule identifiers reported (unless the failure was itself a known false positive being corrected, in which case the change is documented).
3. **Given** an existing CLI invocation and output format, **When** run against the refactored engine, **Then** the structure of the output (fields present, severity values, exit codes) is unchanged.

---

### User Story 3 - Confident, low-risk verification of every rule (Priority: P3)

As an AI Agent System Administrator, I want each linting rule to be independently and deterministically verifiable, so that I can trust the linter's judgment on ambiguous or borderline AI-generated instructions without manually re-reading every flagged document.

**Why this priority**: This delivers the "100% testable, predictable" outcome named in the motivation — it's the quality bar the refactor exists to reach, but the system already provides value once P1 and P2 are met, so this is refinement rather than a blocker.

**Independent Test**: Can be fully tested by exercising each rule in isolation against a fixed set of documented positive and negative examples and confirming the same verdict is produced on every run (no flakiness), with no example depending on the behavior of another rule.

**Acceptance Scenarios**:

1. **Given** the same input document linted multiple times, **When** compared across runs, **Then** every run produces byte-identical diagnostic output.
2. **Given** a rule's documented set of example violations and non-violations, **When** each example is linted in isolation, **Then** the rule's verdict matches the documented expectation for every example.

### Edge Cases

- What happens when a sentence contains multiple overlapping violations (e.g. passive voice AND over the word limit AND unapproved vocabulary)? All applicable violations MUST be reported, not just the first one found.
- How does the system handle text the grammar/vocabulary parser cannot confidently analyze (e.g. malformed sentences, code blocks or fenced snippets embedded in the document, non-English text)? The system MUST skip or clearly mark ambiguous spans rather than silently misreporting or crashing.
- How does the system handle multi-word technical terms, product names, or proprietary nouns that are not in the approved vocabulary but are legitimately allowed in context (e.g. as previously handled by existing exemption lists)? Existing exemption behavior MUST be preserved or explicitly re-documented if changed.
- What happens when a sentence is exactly at a configured word-count boundary? The boundary value itself MUST pass (limit is inclusive, matching current behavior).
- How does the system behave on an empty document or a document with no sentences? The system MUST report zero findings and a pass result rather than erroring.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect passive-voice sentence constructions using full sentence-structure analysis rather than fixed text patterns, covering constructions the current implementation does not detect (e.g. separated auxiliary/participle, "get"-passives).
- **FR-002**: System MUST validate document vocabulary against the approved ASD-STE100 word list using part-of-speech-aware lookup, so the same word is judged correctly whether it is used in an approved or disallowed grammatical role.
- **FR-003**: System MUST enforce maximum sentence-length limits per sentence type (instructional sentences and descriptive sentences may have different limits, matching current configured values), counting words consistently and inclusively at the boundary.
- **FR-004**: System MUST replace the existing pattern/string-based implementations of every current linting rule (passive voice, long sentence, complex word, hedging/modal language, vague quantifier, nominalization, filler phrase, one-topic-per-sentence, unclear referent, inconsistent terminology) with structure-aware, deterministic implementations, or explicitly document any rule intentionally left unchanged and why.
- **FR-005**: System MUST report every applicable violation found in a sentence, not only the first violation detected.
- **FR-006**: System MUST produce diagnostics that include, at minimum, the file, rule identifier, human-readable message, severity, and location (line, and column where determinable) — matching the shape callers already depend on.
- **FR-007**: System MUST preserve the linter's existing caller-facing interface (command invocation, output format/fields, and exit code semantics for pass/fail) so integrations built against the current linter continue to work without modification.
- **FR-008**: System MUST produce identical diagnostic output when the same input is linted repeatedly (no non-determinism from parsing order, randomness, or environment).
- **FR-009**: System MUST gracefully handle text it cannot confidently analyze (malformed sentences, embedded code/fenced blocks, non-English text) by skipping or flagging it as unanalyzed rather than crashing or producing an incorrect verdict.
- **FR-010**: System MUST continue to pass all currently-passing tests in the existing linter test suite, except where a test encodes a known-incorrect behavior being intentionally corrected as part of this refactor (each such case documented).

### Key Entities

- **Diagnostic Finding**: A single reported issue, with the file it was found in, its rule identifier, a human-readable message, severity, and its location (line/column) in the source document.
- **Linting Rule**: A named, independently testable check (e.g. passive voice, long sentence, unapproved vocabulary) with a defined set of example inputs it should and should not flag.
- **Approved Vocabulary Entry**: A word or term permitted under ASD-STE100, together with the part(s) of speech in which its use is approved.
- **Lint Run Result**: The overall outcome for a document or set of documents — pass/fail status, the full list of findings, and summary counts — returned to the caller.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the existing linter's documented test cases continue to produce the same pass/fail verdict after the refactor, except for explicitly documented accuracy corrections.
- **SC-002**: Every linting rule has a documented set of positive and negative examples that pass consistently on every run (zero flaky results across repeated runs of the same input).
- **SC-003**: On a benchmark set of previously mis-linted documents (known false positives/negatives under the old implementation), at least 90% are now judged correctly.
- **SC-004**: Re-linting the same document 10 times in a row produces byte-identical diagnostic output every time.
- **SC-005**: No existing caller of the linter (CLI invocation or programmatic use) requires any code change to keep working after the refactor.

## Assumptions

- The approved ASD-STE100 vocabulary list, sentence-length limits (20 words for instructions, 25 for descriptions), and the set of currently-implemented rules are inherited as-is from the existing linter; this refactor changes *how* they are enforced, not the underlying rule content, unless a specific inaccuracy is being intentionally fixed.
- "Deterministic" means: same input text always yields the same findings, with no dependency on network access, randomness, or system time.
- The refactor is an internal engine replacement; it does not add new rule categories beyond what the current linter already checks for.
- Existing exemption lists (e.g. for proprietary nouns, product names) are preserved unless a specific change is called out and documented.
- Non-English or heavily malformed input is out of scope for full analysis; the system only needs to avoid crashing or misreporting on it.
