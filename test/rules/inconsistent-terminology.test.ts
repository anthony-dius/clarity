import { describe, expect, test } from "bun:test";
import { inconsistentTerminologyRule } from "../../src/rules/inconsistent-terminology";

describe("inconsistentTerminologyRule", () => {
  test("flags a second synonym for a concept already named, with correct line", () => {
    const text = "First set up the environment.\nNow configure the database.\n";
    const findings = inconsistentTerminologyRule.check(text, "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("inconsistent-terminology");
    expect(findings[0].line).toBe(2);
  });

  test("does not flag consistent terminology", () => {
    const text = "First set up the environment.\nNow set up the database.\n";
    expect(inconsistentTerminologyRule.check(text, "f.md").length).toBe(0);
  });
});
