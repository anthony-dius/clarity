import { describe, expect, test } from "bun:test";
import { findVerbatimRegions } from "../../src/engine/verbatim";

describe("findVerbatimRegions", () => {
  test("detects a matched marker pair and returns its start/end line", () => {
    const text = [
      "Before.",
      "<!-- clarity:verbatim:start -->",
      "Inside, ignored.",
      "<!-- clarity:verbatim:end -->",
      "After.",
    ].join("\n");
    const result = findVerbatimRegions(text);
    expect(result.regions).toEqual([{ startLine: 2, endLine: 4 }]);
    expect(result.errors).toEqual([]);
  });

  test("detects an unclosed start marker and identifies its line", () => {
    const text = ["Before.", "<!-- clarity:verbatim:start -->", "No end marker below."].join("\n");
    const result = findVerbatimRegions(text);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].line).toBe(2);
  });

  test("detects a stray end marker with no preceding start and identifies its line", () => {
    const text = ["Before.", "<!-- clarity:verbatim:end -->", "After."].join("\n");
    const result = findVerbatimRegions(text);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].line).toBe(2);
  });

  test("detects a nested start marker (second start before matching end) and identifies its line", () => {
    const text = [
      "Before.",
      "<!-- clarity:verbatim:start -->",
      "Inside.",
      "<!-- clarity:verbatim:start -->",
      "Still inside.",
      "<!-- clarity:verbatim:end -->",
    ].join("\n");
    const result = findVerbatimRegions(text);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].line).toBe(4);
  });
});
