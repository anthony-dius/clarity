import { describe, expect, test } from "bun:test";
import { vagueQuantifierRule } from "../../src/rules/vague-quantifier";

describe("vagueQuantifierRule", () => {
  test("flags 'some' as a vague quantifier, with correct line", () => {
    const findings = vagueQuantifierRule.check("First line.\nSome files failed.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("vague-quantifier");
    expect(findings[0].line).toBe(2);
  });

  test("flags 'many'", () => {
    expect(vagueQuantifierRule.check("Many files failed.\n", "f.md").length).toBe(1);
  });

  test("flags 'various'", () => {
    expect(vagueQuantifierRule.check("Various files failed.\n", "f.md").length).toBe(1);
  });

  test("flags 'several'", () => {
    expect(vagueQuantifierRule.check("Several files failed.\n", "f.md").length).toBe(1);
  });

  test("does not flag a precise count", () => {
    expect(vagueQuantifierRule.check("Three files failed.\n", "f.md").length).toBe(0);
  });
});
