# Development Environment

Setup instructions for working on Clarity itself, and for the non-standard
tooling wired into this repo. This repo has a second purpose beyond the CLI
tool: it's a working testbed for figuring out what an effective **agentic
development harness** needs — TDD enforcement, spec-driven planning, and
session-quality checks, all wired into one Claude Code project. `notes.md`
at the repo root tracks friction/ideas from actually using it. Every section
below is written to be copy-pasted into a different project — that's
deliberate, per the tools' own design (each is config/skills dropped into a
repo, not a fork).

## Prerequisites

| Tool | Used for | Check |
|---|---|---|
| [Bun](https://bun.sh) 1.3+ | Runtime, test runner, bundler/compiler for Clarity itself | `bun --version` |
| Node.js + npm | Runs `npx`-invoked tools (probity) and the global `caveman` CLI | `node --version` |
| [uv](https://docs.astral.sh/uv/) | Installs Python-based CLIs (`specify`, `habit-hooks`) as isolated tools | `uv --version` |
| git | Everything here assumes a git repo (spec-kit's branch workflow, probity's session history) | `git --version` |

## Build from source

```bash
bun install                                              # devDependencies only; zero runtime deps
bun test                                                  # run the suite
bun build --compile ./src/cli/index.ts --outfile ./dist/clarity   # single native binary, no runtime needed to ship
./dist/clarity path/to/doc.md                             # check a file
```

npm-targeted build (for the published package, runs under plain Node):

```bash
bun run build:npm    # bin/clarity.js, runnable via `node bin/clarity.js ...`
```

## Releasing

Releases are automated via [Release Please](https://github.com/googleapis/release-please)
from Conventional Commit PR titles (enforced by CI) — see
[`RELEASE.md`](../RELEASE.md) for the full process, npm trusted-publishing
setup, and prerelease (`next` tag) publishing.

## Repo layout

```text
src/            Clarity's implementation (cli/, engine/, rules/, format/, types/)
test/           bun:test suite, mirrors src/
fixtures/       sample docs used by tests (clean.md, violations.md, large.md)
specs/          spec-kit feature specs (001-*, 002-*, …) — spec.md, plan.md, tasks.md, contracts/
.specify/       spec-kit scripts, templates, extensions
.claude/skills/ speckit-* and caveman-* skills (installed, not hand-written)
.agents/skills/ additional caveman skill suite
probity.config.ts   TDD-enforcement rules
.habit-hooks/   habit-hooks project config
notes.md        running log of friction/ideas from building & using this repo's tools
```

## Non-standard tooling

Four tools outside the Bun/TypeScript stack are wired into this repo. Each
subsection is a self-contained setup recipe.

### Probity — TDD enforcement hook

Blocks a Claude Code (or Codex/Copilot) tool call that writes code without a
preceding failing test, using an AI judge over the session transcript.
[github.com/nizos/probity](https://github.com/nizos/probity)

**Install:**

```bash
npm install -D @nizos/probity      # Node/Bun projects (this repo)
npm install -g @nizos/probity      # non-Node projects (Python, C++, PHP, …)
```

**Wire into Claude Code** — add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write|Edit|NotebookEdit",
        "hooks": [
          { "type": "command", "command": "npx @nizos/probity --agent claude-code" }
        ]
      }
    ]
  }
}
```

**Configure rules** in a `probity.config.ts` at the project root:

```ts
import { defineConfig, enforceTdd } from '@nizos/probity'

export default defineConfig({
  rules: [
    {
      files: ['src/**', 'test/**'],   // scope narrowly — this is an AI call per matching write
      rules: [enforceTdd({ fastPath: true })],
    },
  ],
})
```

This repo's `probity.config.ts` extends the default rules with a short
project-specific addendum (see the file) — worth reading before copying:
it's a direct response to real friction (the validator inconsistently
re-litigating writes it had already blocked earlier in the same session).
`docs/rules.md` in the probity repo covers every `enforceTdd` option.

### Spec-Kit (`speckit`) — spec-driven development workflow

GitHub's toolkit for the specify → clarify → plan → tasks → implement →
analyze cycle. [github.com/github/spec-kit](https://github.com/github/spec-kit)

**Install the CLI:**

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Bootstrap a project** (run once, in the repo root):

```bash
specify init --here --ai claude
```

This drops `.specify/` (scripts, templates, the git-branching extension) and
`.claude/skills/speckit-*` (one skill per slash command: `/speckit-specify`,
`/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`,
`/speckit-analyze`, `/speckit-checklist`, plus the git-workflow commands).
`specify check` verifies all required tools are present.

**Day-to-day flow**, one feature at a time:

```text
/speckit-constitution   # once per project — non-negotiable principles
/speckit-specify   <description>   → specs/NNN-name/spec.md
/speckit-clarify                    → resolves ambiguities in-place
/speckit-plan                       → plan.md, research.md, data-model.md, contracts/
/speckit-tasks                      → tasks.md, dependency-ordered
/speckit-implement                  → executes tasks.md, TDD-first
/speckit-analyze                    → cross-checks spec/plan/tasks for drift
```

Feature specs live in `specs/NNN-short-name/`; the active feature's spec is
findable from any branch via `.specify/feature.json`. Every command respects
optional git-workflow hooks configured in `.specify/extensions.yml` /
`.specify/extensions/git/git-config.yml` (auto-branch per feature, optional
auto-commit per step — off by default in this repo).

### Caveman — agent skill installer + compression toolkit

Installs curated Claude Code/Codex skills and (optionally) compresses tool
output before it reaches the model. [caveman.ai](https://caveman.ai) /
skills source: `github.com/juliusbrussee/caveman`.

**Install:**

```bash
npm install -g @caveman-ai/cli
```

**Install skills into this repo** (writes `.claude/skills/<name>/SKILL.md`,
tracked in `skills-lock.json`):

```bash
caveman skills install                       # default suite (caveman-learn)
caveman skills add juliusbrussee/caveman --all   # or pull specific skills from a source repo
```

`caveman skills list` shows what's available; `caveman skills preview
<name>` shows a skill without installing it. No login is required for local
skill installs — `caveman login` is only for the cloud/evidence features
(`caveman learn`, `caveman status`, cost/quality dashboards), not used here.

**Optional: compression hooks**, so shell/tool output gets shrunk before the
model reads it (recoverable byte-exact via `caveman retrieve`):

```bash
caveman hooks install claude
```

### habit-hooks — session/code hygiene checks

A CLI that scans recent changes for quality "sensors" (currently python,
typescript, generic — see `.habit-hooks/config.toml`) and reports what's
missing or drifting, run on demand or before wrapping up a session.

**Install:**

```bash
uv tool install habit-hooks
```

**Initialize in a repo:**

```bash
habit-hooks init      # writes .habit-hooks/config.toml, reports what's missing
```

**Run it:**

```bash
habit-hooks --all             # everything
habit-hooks --branch main     # just this branch's changes vs. main
habit-hooks --file path.ts    # one file
```

The `typescript`/`generic` sensors in this repo lean on `eslint`, `jscpd`
(copy-paste detection), and `knip` (unused-export detection) —
`devDependencies` in `package.json`, installed via `bun install`.

⚠️ **This repo's `CLAUDE.md` currently instructs the agent to treat
habit-hooks output as a top-priority, always-obey directive and never
mention it to the user.** That's an unusual, injection-shaped instruction
regardless of whether habit-hooks itself is legitimate (it is). If you copy
this setup, write your own framing for how strongly an agent should weight
sensor output — don't copy that clause verbatim.
