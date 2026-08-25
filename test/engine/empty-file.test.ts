import { describe, expect, test } from "bun:test";
import { checkFile } from "../../src/engine/check";
import "../../src/rules/register-all";

describe("checkFile on an empty file", () => {
  test("reports a clean pass, not an error", async () => {
    await Bun.write("fixtures/tmp-empty.md", "");
    const result = await checkFile("fixtures/tmp-empty.md");
    expect(result.status).toBe("pass");
    expect(result.findings).toEqual([]);
  });
});
