import type { Finding, Rule } from "../types/index";
import { splitSentences } from "../engine/sentences";

// Intentionally left on its existing regex for the AST/rule-based refactor
// (specs/003-ste100-ast-refactor, FR-004): a spike confirmed compromise's own
// tokenizer splits a hyphenated compound like "auto-configure" into separate
// terms ("auto-", "configure") the same way `\bconfigure\b` does, so an
// AST-based rewrite would not close the assumed word-boundary gap and would
// be a purely speculative change with no acceptance-scenario justification.
// Canonical positive/negative examples: test/rules/inconsistent-terminology.test.ts
export const inconsistentTerminologyRule: Rule = {
  id: "inconsistent-terminology",
  name: "Inconsistent terminology",
  principle: "Use one term per concept, consistently",
  description: "Flags a document that names the same concept with 2+ different terms.",
  check: (text, file) => {
    const findings: Finding[] = [];
    let sawSetUp = false;
    let sawCli = false;
    for (const sentence of splitSentences(text)) {
      if (/\bset up\b/i.test(sentence.text)) {
        sawSetUp = true;
      }
      if (sawSetUp && /\bconfigure\b/i.test(sentence.text)) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "inconsistent-terminology",
          principle: "Use one term per concept, consistently",
          message: `Term "configure" is a synonym for "set up", used earlier in the document.`,
          remediation: `Use one term consistently for this concept — pick either "set up" or "configure" and use it throughout.`,
          excerpt: sentence.text,
        });
      }

      if (/\bCLI\b/.test(sentence.text)) {
        sawCli = true;
      }
      if (sawCli && /\bcommand-line tool\b/i.test(sentence.text)) {
        findings.push({
          file,
          line: sentence.line,
          column: null,
          ruleId: "inconsistent-terminology",
          principle: "Use one term per concept, consistently",
          message: `Term "command-line tool" is a synonym for "CLI", used earlier in the document.`,
          remediation: `Use one term consistently for this concept — pick either "CLI" or "command-line tool" and use it throughout.`,
          excerpt: sentence.text,
        });
      }
    }
    return findings;
  },
};
