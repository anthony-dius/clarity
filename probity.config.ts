// probity.config.ts
import { defineConfig, enforceTdd } from '@nizos/probity'

export default defineConfig({
  rules: [
    {
      files: ['src/**', 'test/**'],
      rules: [
        enforceTdd({
          fastPath: true,
          instructions: (defaults) => `${defaults}

## Clarity project addendum

- A block or pass verdict recorded earlier in this session for the same or
  a near-identical write is not evidence about this write. Judge strictly
  from the rules above and the current file/test state; do not let an
  earlier verdict on similar content raise or lower your bar.
- When the single most-recently-observed failing test already asserts
  several new literal cases in one test body (e.g. multiple words in one
  regex alternation, multiple entries in one lookup table), matching that
  whole set in one write is the minimum needed to pass it — not
  over-implementation, even though it covers more than one case.
- A small hardcoded pattern, regex alternation, or lookup table is the
  correct minimal shape for a line-scan detection rule module in this
  project (\`src/rules/*.ts\`) — it is not a smell to generalize away.`,
        }),
      ],
    },
  ],
})
