import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

export const nominalizationRule: Rule = {
  id: "nominalization",
  name: "Nominalization",
  principle: "Use verbs, not noun forms of verbs",
  description: "Flags noun forms of verbs that have a simpler verb equivalent.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(/\butilization\b/i);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "nominalization",
          principle: "Use verbs, not noun forms of verbs",
          message: `Nominalization found: "${match[0]}".`,
          remediation: `Replace "${match[0]}" with the verb "use".`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
