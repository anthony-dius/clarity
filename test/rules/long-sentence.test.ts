import { describe, expect, test } from "bun:test";
import { longSentenceRule } from "../../src/rules/long-sentence";

describe("longSentenceRule", () => {
  test("flags a sentence over 20 words", () => {
    const words = Array.from({ length: 25 }, (_, i) => `word${i}`).join(" ");
    const findings = longSentenceRule.check(`${words}.\n`, "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("long-sentence");
  });

  test("does not flag a short sentence", () => {
    const findings = longSentenceRule.check("This is a short sentence.\n", "f.md");
    expect(findings.length).toBe(0);
  });
});
