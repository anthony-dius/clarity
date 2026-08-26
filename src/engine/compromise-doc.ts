import nlp from "compromise";

// Multiple rules independently call parseWithCompromise on the same sentence
// text (per-sentence, not per-rule, parsing — see research.md §4), so a
// single sentence would otherwise be tagged once per rule that needs it.
// Memoizing by exact text avoids that redundant work; this is a pure cache
// (same text always yields the same parse), so it cannot affect determinism.
const cache = new Map<string, ReturnType<typeof nlp>>();

export function parseWithCompromise(text: string) {
  const cached = cache.get(text);
  if (cached) {
    return cached;
  }
  const doc = nlp(text);
  cache.set(text, doc);
  return doc;
}
