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

  test("reports one finding with the correct word count for a sentence spanning 3 wrapped lines", () => {
    const line1 = Array.from({ length: 9 }, (_, i) => `word${i}`).join(" ");
    const line2 = Array.from({ length: 9 }, (_, i) => `more${i}`).join(" ");
    const line3 = Array.from({ length: 9 }, (_, i) => `extra${i}`).join(" ") + ".";
    const findings = longSentenceRule.check(`${line1}\n${line2}\n${line3}\n`, "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].message).toContain("27 words");
  });

  test("counts a hyphenated compound as one word and passes at exactly the 20-word boundary", () => {
    const words = Array.from({ length: 19 }, (_, i) => `word${i}`);
    words.splice(10, 0, "on-call");
    const findings = longSentenceRule.check(`${words.join(" ")}.\n`, "f.md");
    expect(findings.length).toBe(0);
  });
});
