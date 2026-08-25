import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

const MAX_WORDS = 20;

export const longSentenceRule: Rule = {
  id: "long-sentence",
  name: "Long sentence",
  principle: "Keep sentences short",
  description: "Flags sentences over 20 words.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const wordCount = sentence.text.split(/\s+/).filter(Boolean).length;
      if (wordCount > MAX_WORDS) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "long-sentence",
          principle: "Keep sentences short",
          message: `Sentence has ${wordCount} words (limit ${MAX_WORDS}).`,
          remediation: "Split this sentence into two or more shorter sentences, one idea per sentence.",
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
