import { describe, expect, test } from "bun:test";
import { renderText } from "../../src/format/text";
import { renderJson } from "../../src/format/json";

describe("text/json parity", () => {
  test("both renderers derive from the same finding data", () => {
    const summary = {
      toolVersion: "0.1.0",
      ruleSetVersion: "1.0.0",
      results: [
        {
          file: "f.md",
          status: "fail" as const,
          findings: [
            {
              file: "f.md",
              line: 2,
              column: null,
              ruleId: "passive-voice",
              principle: "Use active voice",
              message: "msg",
              remediation: "fix it",
              excerpt: "text",
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
    const text = renderText(summary);
    const json = JSON.parse(renderJson(summary));
    expect(text).toContain(json.results[0].findings[0].ruleId);
    expect(text).toContain(json.results[0].findings[0].remediation);
    expect(json.results[0].findings[0].line).toBe(2);
  });
});
