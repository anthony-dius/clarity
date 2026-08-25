import { describe, expect, test } from "bun:test";
import { unclearReferentRule } from "../../src/rules/unclear-referent";

describe("unclearReferentRule", () => {
  test("flags a sentence starting with 'This', with correct line", () => {
    const findings = unclearReferentRule.check("First line.\nThis breaks the build.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("unclear-referent");
    expect(findings[0].line).toBe(2);
  });

  test("flags a sentence starting with 'It'", () => {
    expect(unclearReferentRule.check("It breaks the build.\n", "f.md").length).toBe(1);
  });

  test("flags a sentence starting with 'That'", () => {
    expect(unclearReferentRule.check("That breaks the build.\n", "f.md").length).toBe(1);
  });

  test("does not flag a sentence with an explicit subject", () => {
    expect(unclearReferentRule.check("The build fails on this input.\n", "f.md").length).toBe(0);
  });
});
