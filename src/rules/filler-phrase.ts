import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

const FILLER_PATTERN =
  "(it is important to note that|in order to|as previously mentioned|it should be noted that)";

// Canonical positive/negative examples: test/rules/filler-phrase.test.ts
export const fillerPhraseRule: Rule = {
  id: "filler-phrase",
  name: "Filler phrase",
  principle: "Eliminate unnecessary words",
  description: "Flags stock filler phrases (e.g. 'it is important to note that') via pattern matching.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      const match = doc.match(FILLER_PATTERN);
      if (match.found) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "filler-phrase",
          principle: "Eliminate unnecessary words",
          message: `Filler phrase found: "${match.text()}".`,
          remediation: `Delete "${match.text()}" and state the point directly.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
