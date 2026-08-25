import { describe, expect, test } from "bun:test";
import { complexWordRule } from "../../src/rules/complex-word";

describe("complexWordRule", () => {
  test("flags 'utilize', with correct line", () => {
    const findings = complexWordRule.check("First line.\nUtilize the script to check results.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("complex-word");
    expect(findings[0].line).toBe(2);
  });

  test("flags 'facilitate'", () => {
    const findings = complexWordRule.check("This will facilitate the migration.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].remediation).toContain("help");
  });

  test("does not flag plain vocabulary", () => {
    expect(complexWordRule.check("Use the script to check results.\n", "f.md").length).toBe(0);
  });

  test("flags 'leverage', 'endeavor', 'ascertain', 'commence', 'terminate'", () => {
    expect(complexWordRule.check("Leverage the existing tool.\n", "f.md").length).toBe(1);
    expect(complexWordRule.check("Endeavor to fix it soon.\n", "f.md").length).toBe(1);
    expect(complexWordRule.check("Ascertain the root cause first.\n", "f.md").length).toBe(1);
    expect(complexWordRule.check("Commence the build now.\n", "f.md").length).toBe(1);
    expect(complexWordRule.check("Terminate the process.\n", "f.md").length).toBe(1);
  });
});
