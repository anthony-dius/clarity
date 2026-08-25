import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

export const complexWordRule: Rule = {
  id: "complex-word",
  name: "Complex word",
  principle: "Use approved/simple vocabulary over complex synonyms",
  description: "Flags complex words that have a simpler common equivalent.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(/\b(utilize[sd]?|facilitate[sd]?)\b/i);
      if (match) {
        const simple = /^facilitate/i.test(match[0]) ? "help" : "use";
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "complex-word",
          principle: "Use approved/simple vocabulary over complex synonyms",
          message: `Complex word found: "${match[0]}".`,
          remediation: `Replace "${match[0]}" with "${simple}".`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
