import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

const NOMINALIZATION_PATTERN = "(utilization|optimization|facilitation|maximization|minimization)";

// Canonical positive/negative examples: test/rules/nominalization.test.ts
export const nominalizationRule: Rule = {
  id: "nominalization",
  name: "Nominalization",
  principle: "Use verbs, not noun forms of verbs",
  description: "Flags noun forms of verbs that have a simpler verb equivalent, via pattern matching.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      const match = doc.match(NOMINALIZATION_PATTERN);
      if (match.found) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "nominalization",
          principle: "Use verbs, not noun forms of verbs",
          message: `Nominalization found: "${match.text()}".`,
          remediation: `Replace "${match.text()}" with the verb "use".`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
