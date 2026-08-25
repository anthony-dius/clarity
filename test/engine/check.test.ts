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

  test("masks a verbatim region so no rule reports findings inside it, while content outside is still checked", async () => {
    const text = [
      "<!-- clarity:verbatim:start -->",
      "You might want to utilize this, it is important to note that.",
      "<!-- clarity:verbatim:end -->",
      "",
      "You might want to check this normally.",
      "",
    ].join("\n");
    await Bun.write("fixtures/tmp-verbatim.md", text);
    const result = await checkFile("fixtures/tmp-verbatim.md");
    expect(result.findings.every((f) => f.line < 1 || f.line > 3)).toBe(true);
    expect(result.findings.some((f) => f.line === 5)).toBe(true);
  });

  test("reports a single verbatim-marker-error finding and skips rule scanning when a marker error is present", async () => {
    const text = ["<!-- clarity:verbatim:start -->", "No end marker below."].join("\n");
    await Bun.write("fixtures/tmp-verbatim-error.md", text);
    const result = await checkFile("fixtures/tmp-verbatim-error.md");
    expect(result.status).toBe("fail");
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].ruleId).toBe("verbatim-marker-error");
    expect(result.findings[0].line).toBe(1);
  });

  test("a file consisting entirely of one verbatim block reports a clean pass", async () => {
    const text = [
      "<!-- clarity:verbatim:start -->",
      "You might want to utilize this, it is important to note that.",
      "<!-- clarity:verbatim:end -->",
    ].join("\n");
    await Bun.write("fixtures/tmp-verbatim-whole.md", text);
    const result = await checkFile("fixtures/tmp-verbatim-whole.md");
    expect(result.status).toBe("pass");
    expect(result.findings).toEqual([]);
  });
});
