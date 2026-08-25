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
      const match = sentence.text.match(
        /\b(utilize[sd]?|facilitate[sd]?|leverage[sd]?|endeavor|ascertain(ed)?|commence[sd]?|terminate[sd]?)\b/i,
      );
      if (match) {
        const word = match[0].toLowerCase();
        const simple = /^facilitate/.test(word)
          ? "help"
          : /^leverage/.test(word)
            ? "use"
            : /^endeavor/.test(word)
              ? "try"
              : /^ascertain/.test(word)
                ? "find out"
                : /^commence/.test(word)
                  ? "start"
                  : /^terminate/.test(word)
                    ? "end"
                    : "use";
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
