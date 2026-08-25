import { describe, expect, test } from "bun:test";
import { runCheck } from "../../src/engine/run";
import "../../src/rules/register-all";

describe("runCheck", () => {
  test("aggregates results across files into a RunSummary", async () => {
    const summary = await runCheck(["fixtures/clean.md"], "0.1.0", "1.0.0");
    expect(summary.filesChecked).toBe(1);
    expect(summary.filesPassed).toBe(1);
    expect(summary.filesFailed).toBe(0);
    expect(summary.totalFindings).toBe(0);
    expect(summary.exitCode).toBe(0);
    expect(summary.toolVersion).toBe("0.1.0");
    expect(summary.ruleSetVersion).toBe("1.0.0");
  });

  test("aggregates a mix of passing and failing files", async () => {
    await Bun.write("fixtures/tmp-mixed-violation.md", "You might want to check this.\n");
    const summary = await runCheck(["fixtures/clean.md", "fixtures/tmp-mixed-violation.md"], "0.1.0", "1.0.0");
    expect(summary.filesChecked).toBe(2);
    expect(summary.filesPassed).toBe(1);
    expect(summary.filesFailed).toBe(1);
    expect(summary.exitCode).toBe(1);
  });
});
