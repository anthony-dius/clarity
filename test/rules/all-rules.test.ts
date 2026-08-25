import { describe, expect, test } from "bun:test";
import { listRules } from "../../src/rules/index";
import "../../src/rules/register-all";

describe("built-in rule set", () => {
  test("registers all 10 built-in rules", () => {
    const ids = listRules().map((r) => r.id);
    expect(ids).toEqual([
      "passive-voice",
      "long-sentence",
      "one-topic-per-sentence",
      "hedging-modal",
      "nominalization",
      "vague-quantifier",
      "filler-phrase",
      "unclear-referent",
      "complex-word",
      "inconsistent-terminology",
    ]);
  });
});
