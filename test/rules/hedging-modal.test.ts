import { describe, expect, test } from "bun:test";
import { hedgingModalRule } from "../../src/rules/hedging-modal";

describe("hedgingModalRule", () => {
  test("flags a hedging modal", () => {
    const findings = hedgingModalRule.check("You might want to check the config.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("hedging-modal");
  });

  test("flags 'could' as a hedge", () => {
    expect(hedgingModalRule.check("This could break things.\n", "f.md").length).toBe(1);
  });

  test("flags 'perhaps' as a hedge", () => {
    expect(hedgingModalRule.check("Perhaps this is fine.\n", "f.md").length).toBe(1);
  });

  test("flags 'maybe' as a hedge", () => {
    expect(hedgingModalRule.check("Maybe try again.\n", "f.md").length).toBe(1);
  });

  test("flags 'should probably' as a hedge", () => {
    expect(hedgingModalRule.check("You should probably restart.\n", "f.md").length).toBe(1);
  });

  test("does not flag a direct statement", () => {
    expect(hedgingModalRule.check("Check the config.\n", "f.md").length).toBe(0);
  });
});
