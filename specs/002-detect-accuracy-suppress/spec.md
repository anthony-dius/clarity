# Feature Specification: Accurate Sentence Detection & Verbatim Suppression

**Feature Branch**: `002-detect-accuracy-suppress`
**Created**: 2026-08-25
**Status**: Draft
**Input**: User description: "Fix Clarity's sentence-splitting so it treats hard-wrapped markdown prose as continuous sentences instead of fragmenting on every line break, and add a way to mark a block of a document as verbatim/exempt so all ten rules skip it. Priority 1 (must fix first): the splitter bug — right now splitSentences flushes on every newline as well as every sentence terminator, so a normal ~80-char-wrapped markdown paragraph gets sliced into fragments at each line break. This produces wrong findings today: a wrapped continuation line starting with \"this\"/\"it\"/\"that\" gets flagged as unclear-referent even though the real sentence starts earlier with a different word, and long-sentence word counts are computed per fragment instead of per real sentence, so genuinely long sentences get missed and short fragments occasionally get miscounted. The fix must still report an accurate line number for each finding, must not break on intentional line breaks (blank lines between paragraphs, list items, headings, code fences, table rows) which should NOT be joined into one sentence, and must stay deterministic (same input always produces the same findings, no reliance on iteration order). Priority 2 (secondary, do after priority 1): give users a way to mark a specific block or section of a checked document as verbatim/quoted content that must not be flagged by any rule -- the concrete motivating case is a spec file that quotes a user's original request verbatim in an \"Input\" field, which should never be rewritten to satisfy a linter since that would falsify the historical record. Needs a marker syntax authors can put in their own documents (exact syntax is a design decision for planning, not fixed here), rules must skip fully inside a marked region, and the rest of the same file must still be checked normally."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate findings on normally-wrapped prose (Priority: P1)

A user checks a normal markdown document whose paragraphs wrap across
multiple lines (the common case for specs, READMEs, and agent instructions).
Every finding reflects the real sentence the author wrote, not an artifact
of where their editor happened to wrap the line.

**Why this priority**: This is a correctness bug in the checker's core
detection logic. It affects every one of the ten built-in rules today,
producing both false positives (a wrapped continuation line starting with
"this"/"it"/"that" reads as its own sentence) and false negatives/miscounts
(a genuinely long sentence split across lines is measured as two short
fragments instead of one long sentence). Nothing else in the tool can be
trusted to be accurate until this is fixed.

**Independent Test**: Run the checker against a fixture document containing
a sentence that legitimately spans two wrapped lines, where the wrapped
continuation begins with "this"/"it"/"that" and the whole sentence exceeds
the long-sentence word limit. Confirm no false unclear-referent finding
fires on the wrapped line, and confirm exactly one long-sentence finding
fires for the whole sentence with the correct combined word count.

**Acceptance Scenarios**:

1. **Given** a paragraph where one sentence wraps across two consecutive
   lines and the second line starts with "this", **When** the user runs the
   check, **Then** the tool does NOT report an unclear-referent finding for
   that line, because the real sentence's first word is on the prior line.
2. **Given** a single sentence spanning three wrapped lines totaling more
   than the long-sentence word limit, **When** the user runs the check,
   **Then** the tool reports exactly one long-sentence finding for that
   sentence, not multiple fragment findings.
3. **Given** a document containing a blank line between two paragraphs,
   **When** the user runs the check, **Then** the tool treats the text
   before and after the blank line as separate sentence groups — it never
   joins the last line of one paragraph with the first line of the next.
4. **Given** a document containing a bulleted or numbered list, **When**
   the user runs the check, **Then** each list item is treated as its own
   unit — the tool does not join one list item's text with the next item's
   or with the surrounding paragraph's.
5. **Given** a document containing a markdown heading, **When** the user
   runs the check, **Then** the heading text is never joined with the
   paragraph text that follows it.
6. **Given** a document containing a fenced code block, **When** the user
   runs the check, **Then** the tool does not join code-block content with
   the prose before or after it, and continues to check ordinary prose
   around the code block normally.
7. **Given** the same document checked twice without modification, **When**
   the user runs the check both times, **Then** both runs produce
   byte-for-byte identical output (existing determinism guarantee holds).

---

### User Story 2 - Exempt verbatim content from every rule (Priority: P2)

A user checks a document that deliberately contains a verbatim quotation —
for example, a spec that records a stakeholder's original request word for
word. The user marks that block so the checker skips it entirely, while the
rest of the document is still checked normally.

**Why this priority**: Valuable but secondary to Priority 1 — accurate
detection makes the checker trustworthy; suppression makes the checker
usable on the (uncommon) documents that contain content nobody should
rewrite. Independently useful once P1 lands, and does not block or get
blocked by it.

**Independent Test**: Run the checker against a fixture document containing
one paragraph that would normally trigger multiple findings, wrapped in the
verbatim marker, plus a second, unmarked paragraph containing a different
known violation. Confirm zero findings are reported inside the marked
region and the known violation outside it is still reported.

**Acceptance Scenarios**:

1. **Given** a document with a block wrapped in the verbatim marker that
   contains text that would otherwise violate multiple rules, **When** the
   user runs the check, **Then** the tool reports zero findings for any
   content inside that marked block.
2. **Given** the same document, **When** the user runs the check, **Then**
   the tool still reports findings normally for violations elsewhere in the
   file, outside the marked block.
3. **Given** a document containing a verbatim start marker with no matching
   end marker, **When** the user runs the check, **Then** the tool reports
   a clear, actionable error identifying the unclosed marker rather than
   silently exempting the rest of the file or crashing.
4. **Given** a document containing two separate, non-overlapping verbatim
   blocks, **When** the user runs the check, **Then** each block is exempted
   independently and content between them is still checked normally.

### Edge Cases

- What happens when a paragraph is wrapped using trailing double-spaces or
  a backslash (explicit markdown hard-break) rather than a plain line
  break? The tool MUST treat these the same as a plain wrapped line for
  sentence-joining purposes — the visual/semantic break doesn't change
  whether the prose is one sentence.
- What happens when a table row's cell content itself is long enough to
  trip `long-sentence`? Table rows continue to be evaluated as their own
  unit (existing behavior); this feature does not change how tables are
  parsed, only how flowing paragraph prose is joined.
- What happens when a verbatim block is nested inside another verbatim
  block? The tool MUST treat the outer block's start/end as authoritative
  and MUST NOT require or support nesting — a second start marker found
  before a matching end marker is itself a reportable error (ambiguous
  region), per the unclosed-marker error path above.
- What happens when a verbatim end marker appears with no matching start
  marker earlier in the file? The tool MUST report a clear, actionable
  error identifying the stray end marker.
- What happens when a verbatim block spans the entire file? The tool MUST
  report a clean pass (zero findings) for that file, consistent with
  existing empty-file/clean-pass behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tool MUST treat a run of consecutive non-blank prose
  lines (a hard-wrapped paragraph) as one continuous stream of text before
  splitting it into sentences, rather than treating each line as its own
  sentence boundary.
- **FR-002**: The tool MUST NOT join text across a blank line, a heading
  line, a list item boundary, a fenced code block boundary, or a table row
  boundary — each remains its own sentence-detection unit, as it does
  today.
- **FR-003**: Every finding MUST continue to report the correct line number
  within the original source file, even when the sentence it belongs to
  was assembled from multiple wrapped source lines.
- **FR-004**: All ten existing built-in rules MUST operate on the corrected
  sentence boundaries without per-rule changes — the fix is centralized in
  the shared sentence-detection behavior every rule already depends on.
- **FR-005**: For a given input file and tool/rule-set version, running the
  check MUST continue to produce identical output across repeated runs
  (existing determinism guarantee, unaffected by this change).
- **FR-006**: The tool MUST support a verbatim marker that a document
  author places around a block of content, exempting everything inside it
  from every built-in rule.
- **FR-007**: Content outside a verbatim-marked block MUST continue to be
  checked normally, in the same invocation.
- **FR-008**: The tool MUST detect an unclosed verbatim start marker (no
  matching end marker before end of file) and a stray verbatim end marker
  (no matching start marker) and report a clear, actionable error for each,
  identifying the file and the marker's location.
- **FR-009**: The tool MUST NOT support nested verbatim markers; encountering
  a second start marker before the current block's end marker MUST be
  reported as a clear, actionable error rather than silently handled.
- **FR-010**: A file consisting entirely of one verbatim-marked block MUST
  report a clean pass (zero findings), consistent with existing clean-pass
  behavior for a file with no violations.

### Key Entities

- **Sentence Unit**: The corrected building block every rule scans — one
  logically continuous run of prose text assembled from one or more
  wrapped source lines, bounded by blank lines, headings, list items, code
  fences, or table rows. Replaces today's one-unit-per-source-line
  behavior. Retains a mapping back to the original source line(s) for
  accurate finding locations.
- **Verbatim Region**: A user-marked, non-nested span of a document,
  delimited by a start and a matching end marker, inside which no rule
  produces findings. Has a start location and an end location; an
  unmatched start or end is an error condition, not a silently-ignored one.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Given a corpus of markdown documents hard-wrapped at typical
  editor widths (~80 characters), the tool produces zero unclear-referent
  false positives caused purely by a mid-sentence line wrap.
- **SC-002**: Given a sentence that spans multiple wrapped lines and
  exceeds the long-sentence word limit, the tool reports it as exactly one
  finding with the correct total word count, not as multiple fragment
  findings.
- **SC-003**: A user can mark any single block of a document as verbatim
  and confirm, in one check run, that it contributes zero findings while
  the rest of the file is checked unchanged.
- **SC-004**: Running the checker twice on the same unmodified file
  continues to produce byte-for-byte identical output after this change
  (no regression to the existing determinism guarantee).
- **SC-005**: Re-checking this project's own existing spec documents (which
  motivated this feature) after the fix introduces no new false positives
  compared to before, on content unrelated to wrapped sentences or verbatim
  quoting.

## Assumptions

- The verbatim marker's exact syntax (e.g., an HTML-comment pair, a
  fenced-block-like delimiter, or a front-matter-style directive) is a
  planning decision, not fixed by this spec — the requirement is that some
  such marker exists and behaves as described in FR-006 through FR-010.
- Verbatim marking is block-level only (whole lines, from a start marker's
  line to an end marker's line); marking part of a single line is out of
  scope for this feature.
- This feature does not change the fixed set of ten built-in rules or add
  new ones; it changes how all of them see sentence boundaries, and adds
  one new exemption mechanism that applies uniformly across all of them.
- Markdown structural elements out of scope for paragraph-joining (blank
  lines, headings, list items, code fences, table rows) are detected using
  the same lightweight, dependency-free approach already used elsewhere in
  the tool (FR-003 of spec 001: no external libraries) — exact detection
  method is a planning decision.
