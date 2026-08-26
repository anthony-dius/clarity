import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

const QUANTIFIER_PATTERN = "(some|many|various|several)";

// Canonical positive/negative examples: test/rules/vague-quantifier.test.ts
export const vagueQuantifierRule: Rule = {
  id: "vague-quantifier",
  name: "Vague quantifier",
  principle: "Be precise; avoid vague terms",
  description: "Flags vague quantifiers (some, many, various, several) via pattern matching.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      const match = doc.match(QUANTIFIER_PATTERN);
      if (match.found) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "vague-quantifier",
          principle: "Be precise; avoid vague terms",
          message: `Vague quantifier found: "${match.text()}".`,
          remediation: `Replace "${match.text()}" with a specific count or a precise description.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
