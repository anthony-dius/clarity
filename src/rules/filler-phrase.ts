import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

export const fillerPhraseRule: Rule = {
  id: "filler-phrase",
  name: "Filler phrase",
  principle: "Eliminate unnecessary words",
  description: "Flags stock filler phrases (e.g. 'it is important to note that').",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(/\b(it is important to note that|in order to)\b/i);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "filler-phrase",
          principle: "Eliminate unnecessary words",
          message: `Filler phrase found: "${match[0]}".`,
          remediation: `Delete "${match[0]}" and state the point directly.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
