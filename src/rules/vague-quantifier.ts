import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

export const vagueQuantifierRule: Rule = {
  id: "vague-quantifier",
  name: "Vague quantifier",
  principle: "Be precise; avoid vague terms",
  description: "Flags vague quantifiers (some, many, various, several) without a concrete count.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(/\b(some|many|various|several)\b/i);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "vague-quantifier",
          principle: "Be precise; avoid vague terms",
          message: `Vague quantifier found: "${match[0]}".`,
          remediation: `Replace "${match[0]}" with a specific count or a precise description.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
