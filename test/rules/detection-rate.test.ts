import { describe, expect, test } from "bun:test";
import { checkFile } from "../../src/engine/check";
import { listRules } from "../../src/rules/index";
import "../../src/rules/register-all";

describe("SC-001 informal detection-rate check", () => {
  test("logs how many of the built-in rules fire on the seeded violations fixture", async () => {
    const result = await checkFile("fixtures/violations.md");
    const rulesFired = new Set(result.findings.map((f) => f.ruleId));
    const totalRules = listRules().length;
    const rate = rulesFired.size / totalRules;
    console.log(`SC-001 informal check: ${rulesFired.size}/${totalRules} rules fired (${Math.round(rate * 100)}%)`);
    expect(result.findings.length).toBeGreaterThan(0);
  });
});
