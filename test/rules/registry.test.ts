import { describe, expect, test } from "bun:test";
import { registerRule, listRules } from "../../src/rules/index";

describe("rule registry", () => {
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
