import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";
import { parseWithCompromise } from "../engine/compromise-doc";

interface ApprovedVocabularyEntry {
  word: string;
  simpleAlternative?: string;
  allowedPartsOfSpeech?: string[];
}

const VOCABULARY: ApprovedVocabularyEntry[] = [
  { word: "utilize", simpleAlternative: "use" },
  { word: "facilitate", simpleAlternative: "help" },
  { word: "leverage", simpleAlternative: "use" },
  { word: "endeavor", simpleAlternative: "try" },
  { word: "ascertain", simpleAlternative: "find out" },
  { word: "commence", simpleAlternative: "start" },
  { word: "terminate", simpleAlternative: "end" },
  { word: "contact", allowedPartsOfSpeech: ["Verb"] },
];

// Canonical positive/negative examples: test/rules/complex-word.test.ts
export const complexWordRule: Rule = {
  id: "complex-word",
  name: "Complex word",
  principle: "Use approved/simple vocabulary over complex synonyms",
  description: "Flags complex words and words used outside their ASD-STE100-approved part of speech.",
  check: (text, file) => {
    const findings: Finding[] = [];
    for (const sentence of splitSentences(text)) {
      const doc = parseWithCompromise(sentence.text);
      for (const entry of VOCABULARY) {
        const pattern = entry.allowedPartsOfSpeech
          ? `(${entry.word} && !#${entry.allowedPartsOfSpeech[0]})`
          : `{${entry.word}}`;
        const match = doc.match(pattern);
        if (match.found) {
          const matched = match.text();
          const message = entry.simpleAlternative
            ? `Complex word found: "${matched}".`
            : `"${matched}" used outside its approved part of speech (${entry.allowedPartsOfSpeech![0]} only).`;
          const remediation = entry.simpleAlternative
            ? `Replace "${matched}" with "${entry.simpleAlternative}".`
            : `Use "${matched}" only as a ${entry.allowedPartsOfSpeech![0].toLowerCase()} (e.g. "Contact the crew"); use a different word for other parts of speech.`;
          findings.push({
            file,
            line: sentence.line,
            column: null,
            ruleId: "complex-word",
            principle: "Use approved/simple vocabulary over complex synonyms",
            message,
            remediation,
            excerpt: sentence.text,
          });
        }
      }
    }
    return findings;
  },
};
