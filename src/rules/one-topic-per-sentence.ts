import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

const CONJUNCTION_PATTERN = /\b(and|but|or)\b/gi;
const MIN_CONJUNCTIONS = 3;

export const oneTopicPerSentenceRule: Rule = {
  id: "one-topic-per-sentence",
  name: "One topic per sentence",
  principle: "Express one instruction or idea per sentence",
  description: "Flags sentences joining 3+ clauses with and/but/or.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const matches = sentence.text.match(CONJUNCTION_PATTERN) ?? [];
      if (matches.length >= MIN_CONJUNCTIONS) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "one-topic-per-sentence",
          principle: "Express one instruction or idea per sentence",
          message: `Sentence joins ${matches.length} clauses with and/but/or.`,
          remediation: "Split this sentence so each sentence expresses one instruction or idea.",
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
