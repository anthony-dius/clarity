import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

const HEDGE_PATTERN = /\b(might|could|perhaps|maybe|should\s+probably)\b/i;

export const hedgingModalRule: Rule = {
  id: "hedging-modal",
  name: "Hedging modal",
  principle: "Use approved words; avoid ambiguous modals",
  description: "Flags hedging modal phrases (might, could, perhaps, maybe).",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(HEDGE_PATTERN);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "hedging-modal",
          principle: "Use approved words; avoid ambiguous modals",
          message: `Hedging modal found: "${match[0]}".`,
          remediation: `Replace the hedge with a direct, testable statement.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
