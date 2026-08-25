import { describe, expect, test } from "bun:test";
import { checkFile } from "../../src/engine/check";
import "../../src/rules/register-all";

describe("performance", () => {
  test("checking a 10,000-word document completes in under 2 seconds", async () => {
    const start = performance.now();
    await checkFile("fixtures/large.md");
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
