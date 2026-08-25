import { describe, expect, test } from "bun:test";
import { oneTopicPerSentenceRule } from "../../src/rules/one-topic-per-sentence";

describe("oneTopicPerSentenceRule", () => {
  test("flags a sentence with 3+ coordinating conjunctions", () => {
    const text = "Open the file and read it and check it and save it.\n";
    const findings = oneTopicPerSentenceRule.check(text, "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("one-topic-per-sentence");
  });

  test("does not flag a sentence with a single conjunction", () => {
    const findings = oneTopicPerSentenceRule.check("Open the file and read it.\n", "f.md");
    expect(findings.length).toBe(0);
  });
});
