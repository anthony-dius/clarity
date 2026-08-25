import { describe, expect, test } from "bun:test";
import { nominalizationRule } from "../../src/rules/nominalization";

describe("nominalizationRule", () => {
  test("flags 'utilization' as a nominalization", () => {
    const findings = nominalizationRule.check("Check the utilization of the disk.\n", "f.md");
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("nominalization");
  });

  test("does not flag ordinary text", () => {
    const findings = nominalizationRule.check("Use the disk.\n", "f.md");
    expect(findings.length).toBe(0);
  });

  test("reports the line the nominalization occurs on, not always line 1", () => {
    const findings = nominalizationRule.check("First line is fine.\nCheck the utilization here.\n", "f.md");
    expect(findings[0].line).toBe(2);
  });

  test("flags 'optimization'", () => {
    expect(nominalizationRule.check("Run the optimization step.\n", "f.md").length).toBe(1);
  });

  test("flags 'facilitation' and 'maximization'/'minimization'", () => {
    expect(nominalizationRule.check("This aids facilitation of the process.\n", "f.md").length).toBe(1);
    expect(nominalizationRule.check("The goal is maximization of output.\n", "f.md").length).toBe(1);
    expect(nominalizationRule.check("The goal is minimization of waste.\n", "f.md").length).toBe(1);
  });
});
