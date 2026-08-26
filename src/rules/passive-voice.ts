import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

const PASSIVE_PATTERNS = [
  "#Auxiliary+ #Adverb? (#PastTense|#PastParticiple)",
  "(get|gets|got|getting) #PastTense",
];

// Canonical positive/negative examples: test/rules/passive-voice.test.ts
export const passiveVoiceRule: Rule = {
  id: "passive-voice",
  name: "Passive voice",
  principle: "Use active voice",
  description: "Detects passive-voice constructions via grammatical pattern matching.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      const match = PASSIVE_PATTERNS.map((pattern) => doc.match(pattern)).find((m) => m.found);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "passive-voice",
          principle: "Use active voice",
          message: `Passive-voice construction found: "${match.text()}".`,
          remediation: `Rewrite in active voice: identify who performs the action and make them the subject (e.g. "The team wrote the report" instead of "The report was written by the team").`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
