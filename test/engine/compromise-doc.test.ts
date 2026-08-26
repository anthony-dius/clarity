import { describe, expect, test } from "bun:test";
import { parseWithCompromise } from "../../src/engine/compromise-doc";

describe("parseWithCompromise", () => {
  test("returns a doc whose match() finds a known tag pattern", () => {
    const doc = parseWithCompromise("The report was quickly written by the team.");
    expect(doc.match("#Auxiliary #Adverb? (#PastTense|#PastParticiple)").found).toBe(true);
  });

  test("tags a sentence-initial imperative verb correctly (the case that ruled out retext-pos)", () => {
    const doc = parseWithCompromise("Contact the crew immediately.");
    expect(doc.match("(contact && #Verb)").found).toBe(true);
    expect(doc.match("(contact && #Noun)").found).toBe(false);
  });

  test("tags the same word as a noun when used as one", () => {
    const doc = parseWithCompromise("We are in contact with the crew.");
    expect(doc.match("(contact && #Noun)").found).toBe(true);
    expect(doc.match("(contact && #Verb)").found).toBe(false);
  });
});
