import { describe, expect, test } from "bun:test";
import { passiveVoiceRule } from "../../src/rules/passive-voice";

describe("passiveVoiceRule", () => {
  test("flags a passive-voice sentence", () => {
    const findings = passiveVoiceRule.check("The report was written by the team.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("passive-voice");
  });

  test("does not flag an active-voice sentence", () => {
    const findings = passiveVoiceRule.check("The team wrote the report.\n", "f.md");
    expect(findings.length).toBe(0);
  });

  test("flags a passive sentence with an adverb separating auxiliary and participle", () => {
    const findings = passiveVoiceRule.check("The report was quickly written by the team.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("passive-voice");
  });

  test("flags a get-passive construction", () => {
    const findings = passiveVoiceRule.check("The bug gets fixed by the on-call engineer.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("passive-voice");
  });
});
