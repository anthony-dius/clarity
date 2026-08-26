import { afterEach, describe, expect, test } from "bun:test";
import { registerRule, listRules } from "../../src/rules/index";

describe("rule registry", () => {
  // The registry is a process-wide singleton (bun runs every test file in
  // one process), and listRules() returns the live array, not a copy — so a
  // rule registered here leaks into every other file's listRules() call
  // unless removed. Bun's test-file scheduling order differs between
  // environments (observed: this leaked into test/rules/all-rules.test.ts
  // in CI on Linux, https://github.com/anthony-dius/clarity/pull/5, but not
  // locally on macOS) so cleanup can't be skipped just because it doesn't
  // reproduce on one machine. Mutate the returned array in place to clean up.
  afterEach(() => {
    const rules = listRules();
    const index = rules.findIndex((r) => r.id === "test-only-rule");
    if (index !== -1) {
      rules.splice(index, 1);
    }
  });

  test("lists a registered rule", () => {
    registerRule({
      id: "test-only-rule",
      name: "Test Only",
      principle: "N/A",
      description: "for registry test",
      check: () => [],
    });
    expect(listRules().some((r) => r.id === "test-only-rule")).toBe(true);
  });
});
