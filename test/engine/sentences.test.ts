import { describe, expect, test } from "bun:test";
import { splitSentences } from "../../src/engine/sentences";

describe("splitSentences", () => {
  test("splits on sentence terminators and reports line numbers", () => {
    const text = "First sentence. Second sentence.\nThird sentence on line two.";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual([
      "First sentence.",
      "Second sentence.",
      "Third sentence on line two.",
    ]);
    expect(sentences.map((s) => s.line)).toEqual([1, 1, 2]);
  });
});
