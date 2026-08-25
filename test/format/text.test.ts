import { describe, expect, test } from "bun:test";
import { renderText } from "../../src/format/text";

describe("renderText", () => {
  test("renders a PASS header for a passing file and a summary line", () => {
    const summary = {
      toolVersion: "0.1.0",
      ruleSetVersion: "1.0.0",
      results: [{ file: "clean.md", status: "pass" as const, findings: [] }],
      filesChecked: 1,
      filesPassed: 1,
      filesFailed: 0,
      totalFindings: 0,
      exitCode: 0 as const,
    };
    const output = renderText(summary);
    expect(output).toContain("clean.md: PASS (0 finding(s))");
    expect(output).toContain("Summary: 1 checked, 1 passed, 0 failed, 0 findings");
  });

  test("renders per-finding location, rule, principle, and remediation", () => {
    const summary = {
      toolVersion: "0.1.0",
      ruleSetVersion: "1.0.0",
      results: [
        {
          file: "bad.md",
          status: "fail" as const,
          findings: [
            {
              file: "bad.md",
              line: 3,
              column: null,
              ruleId: "passive-voice",
              principle: "Use active voice",
              message: "Passive-voice construction found.",
              remediation: "Rewrite in active voice.",
              excerpt: "It was written.",
            },
          ],
        },
      ],
      filesChecked: 1,
      filesPassed: 0,
      filesFailed: 1,
      totalFindings: 1,
      exitCode: 1 as const,
    };
    const output = renderText(summary);
    expect(output).toContain("3:");
    expect(output).toContain("[passive-voice]");
    expect(output).toContain("Passive-voice construction found.");
    expect(output).toContain("principle: Use active voice");
    expect(output).toContain("fix: Rewrite in active voice.");
  });
});
