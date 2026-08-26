import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

const HEDGE_PATTERN = "(might|could|perhaps|maybe|should probably)";

// Canonical positive/negative examples: test/rules/hedging-modal.test.ts
export const hedgingModalRule: Rule = {
  id: "hedging-modal",
  name: "Hedging modal",
  principle: "Use approved words; avoid ambiguous modals",
  description: "Flags hedging modal phrases (might, could, perhaps, maybe) via pattern matching.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      const match = doc.match(HEDGE_PATTERN);
      if (match.found) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "hedging-modal",
          principle: "Use approved words; avoid ambiguous modals",
          message: `Hedging modal found: "${match.text()}".`,
          remediation: `Replace the hedge with a direct, testable statement.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
