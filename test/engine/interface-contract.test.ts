import { describe, expect, test } from "bun:test";
import { checkFile } from "../../src/engine/check";
import "../../src/rules/register-all";

// The rule-id-set regression check lives in test/rules/all-rules.test.ts —
// not duplicated here to avoid a second assertion racing the shared rule
// registry against test/rules/registry.test.ts's cross-file mutation.
describe("interface contract (FR-007)", () => {
  test("every Finding from a failing file has the full contract shape with correct types", async () => {
    const result = await checkFile("fixtures/violations.md");
    expect(result.findings.length).toBeGreaterThan(0);
    for (const finding of result.findings) {
      expect(typeof finding.file).toBe("string");
      expect(typeof finding.line).toBe("number");
      expect(finding.column === null || typeof finding.column === "number").toBe(true);
      expect(typeof finding.ruleId).toBe("string");
      expect(typeof finding.principle).toBe("string");
      expect(typeof finding.message).toBe("string");
      expect(typeof finding.remediation).toBe("string");
      expect(typeof finding.excerpt).toBe("string");
    }
  });
});
