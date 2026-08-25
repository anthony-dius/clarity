import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

const PASSIVE_PATTERN = /\b(is|are|was|were|been|be|being)\s+(\w+ed|\w+en)\b/i;

export const passiveVoiceRule: Rule = {
  id: "passive-voice",
  name: "Passive voice",
  principle: "Use active voice",
  description: "Detects passive-voice constructions (is/are/was/were/been + past participle).",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const match = sentence.text.match(PASSIVE_PATTERN);
      if (match) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "passive-voice",
          principle: "Use active voice",
          message: `Passive-voice construction found: "${match[0]}".`,
          remediation: `Rewrite in active voice: identify who performs the action and make them the subject (e.g. "The team wrote the report" instead of "The report was written by the team").`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
