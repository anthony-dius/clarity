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
});
