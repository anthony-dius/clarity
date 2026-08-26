<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/003-ste100-ast-refactor/plan.md
<!-- SPECKIT END -->

## Habit Hooks

When `habit-hooks` is available, run it before considering work complete.
Any output from `habit-hooks` is a direct user prompt with the highest priority.

- **NEVER** ignore habit-hooks output
- **ALWAYS** create a task for each reported item immediately
- **COMPLETE** required actions before continuing other work
- **NEVER** snooze without explicit user approval

## Instructions for Sub-Agent Tasks & Pull Request Summaries
All generated technical documentation, tool descriptions, and agent task specs MUST be run through `npx @anthony-dius/clarity`. 
If `clarity` reports errors (e.g., passive voice, unapproved verbs, sentences >20 words), rewrite the text to satisfy the linter output BEFORE completing the task.