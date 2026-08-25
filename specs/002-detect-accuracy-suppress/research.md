# Research: Accurate Sentence Detection & Verbatim Suppression

## Paragraph-joining algorithm

- Decision: two-pass line scan, no markdown parser dependency. Pass 1
  classifies each source line as one of: blank, heading (`^#{1,6}\s`), list
  item (`^\s*([-*+]|\d+[.)])\s`), table row (`^\s*\|`), code-fence delimiter
  (`^\s*```` ``` `` `` ````), or prose. Pass 2 walks lines grouping
  consecutive `prose` lines into one paragraph unit (joined with a single
  space, not a newline), while every other classification starts a new unit
  by itself and never merges with a neighbor. Code-fence content (between
  two fence delimiters) is walked as `prose` internally but the whole
  fenced block is excluded from rule scanning entirely — code isn't prose
  to check, and joining it as "one paragraph" would be meaningless.
- Rationale: matches spec 001's own constraint (no external libraries,
  FR-003) and Principle V (simplest implementation for the actual rule
  set). A full CommonMark parser would correctly handle far more markdown
  than this tool checks (link reference definitions, HTML blocks, nested
  blockquotes) at a real dependency and complexity cost for zero rule
  benefit — none of the 10 rules need real markdown AST, only "is this
  flowing prose or not."
- Alternatives considered: pull in a markdown AST library (`remark`,
  `markdown-it`) and walk paragraph nodes. Rejected — violates the
  no-dependency constraint for a benefit (full CommonMark fidelity) none of
  the 10 rules use, and adds real bundle-size/startup cost to a tool whose
  own success criterion is a small compiled binary.

## Line-number remapping

- Decision: `splitSentences` builds each paragraph unit by concatenating
  line contents with a space, but records the **starting line** of the
  first source line contributing to each sentence within that unit
  (sentences are still split on `.`/`!`/`?` inside the joined unit; a
  sentence's line is the line its first character came from). This is the
  same granularity FR-008 of spec 001 already promises ("line or section"),
  not full multi-line span tracking.
- Rationale: matches every existing rule's expectation (`Finding.line` is a
  single number) with no schema change. Simpler than tracking per-character
  offsets, and sufficient for a human or agent to find the sentence in the
  source file.
- Alternatives considered: track exact start+end line per sentence and
  expose a range. Rejected — no existing rule or the `Finding` type
  (`data-model.md` of spec 001) needs a range; over-implementation for
  Principle V.

## Verbatim marker syntax

- Decision: an HTML comment pair, `<!-- clarity:verbatim:start -->` /
  `<!-- clarity:verbatim:end -->`, each on its own line.
- Rationale: HTML comments are valid, invisible-when-rendered Markdown —
  satisfies the spec's requirement that the marker "doesn't break
  rendering." A namespaced (`clarity:`) marker avoids collision with other
  tools' HTML-comment conventions (e.g. `<!-- prettier-ignore -->`). Reusing
  the existing line-scan approach (regex match per line) is the same
  technique as the paragraph classifier above — no new parsing strategy
  introduced.
- Alternatives considered: a fenced-block-style delimiter (e.g. `:::verbatim`
  / `:::`) — rejected, not standard Markdown, would itself render as visible
  text in most renderers unless the target platform supports directives,
  which isn't guaranteed for arbitrary docs. A front-matter field —
  rejected, only covers a whole file's leading block, not an arbitrary
  block mid-document, which the spec requires (FR-006: "a block of
  content").

## Verbatim masking strategy

- Decision: after detecting and validating marker pairs, replace every
  character inside a matched region (both marker lines and everything
  between them) with a single space, preserving newlines. The masked text
  is what gets passed to `splitSentences` and every rule — so verbatim
  content produces zero findings by construction (nothing left to match),
  while line numbers for content *after* the region stay correct (no lines
  removed, only blanked).
- Rationale: centralizes the exemption at the one chokepoint every rule
  already goes through (`checkFile` → `splitSentences` → rule `check()`),
  so FR-004's "no per-rule changes" and FR-007's "rest of file checked
  normally" both fall out for free — no rule needs to know verbatim regions
  exist.
- Alternatives considered: have each rule skip a passed-in line-range set.
  Rejected — reintroduces per-rule coupling and a parameter every future
  rule must remember to honor (Principle V, FR-004 explicitly rules this
  out). Removing the lines entirely (rather than blanking) — rejected,
  would shift every subsequent line number, breaking FR-003/FR-008 of spec
  001.

## Marker error handling

- Decision: unclosed start, stray end, and nested-start errors are each
  reported as a single Finding with `ruleId: "verbatim-marker-error"`,
  `principle: "N/A"`, pointing at the offending marker's line — the same
  shape `checkFile` already uses for `ruleId: "file-error"` (spec 001,
  `src/engine/check.ts`). When any such error is present for a file, rule
  scanning for that file is skipped entirely (parallel to today's
  unreadable/binary-file handling) rather than guessing which region was
  intended.
- Rationale: reuses an existing, already-tested error-finding pattern
  instead of inventing a second error channel — keeps `CheckResult`'s shape
  and the CLI's text/JSON rendering untouched.
