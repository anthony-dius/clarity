import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

export const unclearReferentRule: Rule = {
  id: "unclear-referent",
  name: "Unclear referent",
  principle: "Ensure every pronoun has one clear referent",
  description: "Flags sentences that open with 'This', 'It', or 'That' with no preceding noun.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(/^(this|it|that)\b/i);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "unclear-referent",
          principle: "Ensure every pronoun has one clear referent",
          message: `Sentence opens with an unclear referent: "${match[0]}".`,
          remediation: `Replace "${match[0]}" with the specific noun it refers to.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
