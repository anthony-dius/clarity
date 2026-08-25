import { describe, expect, test } from "bun:test";
import { checkFile } from "../../src/engine/check";
import "../../src/rules/register-all";

describe("checkFile", () => {
  test("returns a fail CheckResult with sorted findings for a file with violations", async () => {
    const result = await checkFile("fixtures/clean.md");
    expect(result.status).toBe("pass");
    expect(result.findings).toEqual([]);
  });

  test("returns a fail CheckResult for a file with a violation", async () => {
    await Bun.write("fixtures/tmp-violation.md", "You might want to check this.\n");
    const result = await checkFile("fixtures/tmp-violation.md");
    expect(result.status).toBe("fail");
    expect(result.findings.length).toBeGreaterThan(0);
  });

  test("returns a fail CheckResult with a file-error finding for a missing file", async () => {
    const result = await checkFile("fixtures/does-not-exist.md");
    expect(result.status).toBe("fail");
    expect(result.findings[0].ruleId).toBe("file-error");
  });

  test("reports each violated rule as a separate finding, sorted deterministically", async () => {
    await Bun.write(
      "fixtures/tmp-overlap.md",
      "This might have been utilized by many teams and it broke and it failed and it crashed.\n",
    );
    const result = await checkFile("fixtures/tmp-overlap.md");
    const ruleIds = result.findings.map((f) => f.ruleId);
    expect(new Set(ruleIds).size).toBeGreaterThan(1);
    const sorted = [...result.findings].sort((a, b) => a.ruleId.localeCompare(b.ruleId));
    expect(ruleIds).toEqual(sorted.map((f) => f.ruleId));
  });
});
