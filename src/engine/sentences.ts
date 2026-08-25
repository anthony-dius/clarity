export interface Sentence {
  text: string;
  line: number;
}

export function splitSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];
  let line = 1;
  let buffer = "";
  for (const char of text) {
    if (char === "\n") {
      if (buffer.trim().length > 0) {
        sentences.push({ text: buffer.trim(), line });
      }
      buffer = "";
      line++;
      continue;
    }
    buffer += char;
    if (char === "." || char === "!" || char === "?") {
      const trimmed = buffer.trim();
      if (trimmed.length > 0) {
        sentences.push({ text: trimmed, line });
      }
      buffer = "";
    }
  }
  if (buffer.trim().length > 0) {
    sentences.push({ text: buffer.trim(), line });
  }
  return sentences;
}
