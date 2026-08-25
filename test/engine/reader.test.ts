import { describe, expect, test } from "bun:test";
import { readFileForCheck } from "../../src/engine/reader";

describe("readFileForCheck", () => {
  test("reads a valid text file", async () => {
    const result = await readFileForCheck("fixtures/clean.md");
    expect(result.ok).toBe(true);
  });

  test("reports missing file as error, not throw", async () => {
    const result = await readFileForCheck("fixtures/does-not-exist.md");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("not found");
    }
  });

  test("reports binary file as error", async () => {
    const path = "fixtures/binary.bin";
    await Bun.write(path, new Uint8Array([0, 1, 2, 3, 255, 0, 254]));
    const result = await readFileForCheck(path);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("binary");
    }
  });
});
