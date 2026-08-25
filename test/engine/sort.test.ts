import { describe, expect, test } from "bun:test";
import { sortFindings } from "../../src/engine/sort";

describe("sortFindings", () => {
  test("orders by file, then line, then ruleId", () => {
    const input = [
      { file: "b.md", line: 2, column: null, ruleId: "z", principle: "", message: "", remediation: "", excerpt: "" },
      { file: "a.md", line: 5, column: null, ruleId: "z", principle: "", message: "", remediation: "", excerpt: "" },
      { file: "a.md", line: 1, column: null, ruleId: "z", principle: "", message: "", remediation: "", excerpt: "" },
    ];
    const sorted = sortFindings(input);
    expect(sorted.map((f) => `${f.file}:${f.line}`)).toEqual(["a.md:1", "a.md:5", "b.md:2"]);
  });
});
