import { describe, expect, test } from "bun:test";
import { fillerPhraseRule } from "../../src/rules/filler-phrase";

describe("fillerPhraseRule", () => {
  test("flags 'it is important to note that', with correct line", () => {
    const findings = fillerPhraseRule.check(
      "First line.\nIt is important to note that the build failed.\n",
      "f.md",
    );
    expect(findings.length).toBe(1);
    expect(findings[0].ruleId).toBe("filler-phrase");
    expect(findings[0].line).toBe(2);
  });

  test("flags 'in order to'", () => {
    expect(fillerPhraseRule.check("Restart the service in order to apply the change.\n", "f.md").length).toBe(1);
  });

  test("does not flag plain text", () => {
    expect(fillerPhraseRule.check("Restart the service to apply the change.\n", "f.md").length).toBe(0);
  });
});
