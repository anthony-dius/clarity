import { describe, expect, test } from "bun:test";
import { splitSentences } from "../../src/engine/sentences";

describe("splitSentences", () => {
  test("joins a sentence wrapped across two lines into one sentence, reporting the first line", () => {
    const text = "The team reviewed the proposal and agreed it addressed\nevery open concern in the room today.\n";
    const sentences = splitSentences(text);
    expect(sentences.length).toBe(1);
    expect(sentences[0].text).toBe(
      "The team reviewed the proposal and agreed it addressed every open concern in the room today.",
    );
    expect(sentences[0].line).toBe(1);
  });

  test("does not join across a blank line", () => {
    const text = "First paragraph line one.\n\nSecond paragraph starts here.\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["First paragraph line one.", "Second paragraph starts here."]);
  });

  test("does not join across a heading line", () => {
    const text = "# A Heading\nThe paragraph text starts on the next line.\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["# A Heading", "The paragraph text starts on the next line."]);
  });

  test("does not join across a list-item boundary", () => {
    const text = "- First item text.\n- Second item text.\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["- First item text.", "- Second item text."]);
  });

  test("excludes fenced code block content from sentence output", () => {
    const text = "Prose before the block.\n```\nconst x = 1;\n```\nProse after the block.\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["Prose before the block.", "Prose after the block."]);
  });

  test("does not join across a table-row boundary", () => {
    const text = "| A | B |\n| --- | --- |\n| 1 | 2 |\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["| A | B |", "| --- | --- |", "| 1 | 2 |"]);
  });

  test("does not join across a bold-label field line (e.g. '**Field**: value')", () => {
    const text = "**Language/Version**: TypeScript on Bun\n**Storage**: none needed here\n";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual([
      "**Language/Version**: TypeScript on Bun",
      "**Storage**: none needed here",
    ]);
  });

  test("collapses to a single space when a wrapped continuation line has leading indent", () => {
    const text = "When multiple files are\n  checked, an overall summary aggregates each result.\n";
    const sentences = splitSentences(text);
    expect(sentences[0].text).not.toMatch(/\s{2,}/);
  });

  test("joins a paragraph wrapped via trailing double-space or backslash hard-break the same as a plain wrap", () => {
    const trailingSpaces = "First half of the sentence  \nsecond half of the same sentence.\n";
    const backslash = "First half of the sentence\\\nsecond half of the same sentence.\n";
    expect(splitSentences(trailingSpaces).length).toBe(1);
    expect(splitSentences(backslash).length).toBe(1);
  });

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
