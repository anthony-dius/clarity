export interface Sentence {
  text: string;
  line: number;
}

type LineKind =
  | "blank"
  | "heading"
  | "list-item"
  | "table-row"
  | "field-label"
  | "fence-delimiter"
  | "fence-content"
  | "prose";

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function isHeading(line: string): boolean {
  return /^\s{0,3}#{1,6}\s/.test(line);
}

function isListItem(line: string): boolean {
  return /^\s*([-*+]|\d+[.)])\s/.test(line);
}

function isTableRow(line: string): boolean {
  return /^\s*\|/.test(line);
}

function isFieldLabel(line: string): boolean {
  return /^\*\*[^*\n]+\*\*:/.test(line);
}

function isFenceDelimiter(line: string): boolean {
  return /^\s*```/.test(line);
}

function classifyLines(rawLines: string[]): LineKind[] {
  const kinds: LineKind[] = [];
  let inFence = false;
  for (const raw of rawLines) {
    if (inFence) {
      if (isFenceDelimiter(raw)) {
        kinds.push("fence-delimiter");
        inFence = false;
      } else {
        kinds.push("fence-content");
      }
      continue;
    }
    if (isFenceDelimiter(raw)) {
      kinds.push("fence-delimiter");
      inFence = true;
    } else if (isBlank(raw)) {
      kinds.push("blank");
    } else if (isHeading(raw)) {
      kinds.push("heading");
    } else if (isListItem(raw)) {
      kinds.push("list-item");
    } else if (isTableRow(raw)) {
      kinds.push("table-row");
    } else if (isFieldLabel(raw)) {
      kinds.push("field-label");
    } else {
      kinds.push("prose");
    }
  }
  return kinds;
}

function cleanProseLine(line: string): string {
  return line.replace(/\\$/, "").replace(/\s+$/, "").replace(/^\s+/, "");
}

export function splitSentences(text: string): Sentence[] {
  const rawLines = text.split("\n");
  const kinds = classifyLines(rawLines);

  const sentences: Sentence[] = [];
  let buffer = "";
  let bufferStartLine = 0;

  const flush = () => {
    const trimmed = buffer.trim();
    if (trimmed.length > 0) {
      sentences.push({ text: trimmed, line: bufferStartLine });
    }
    buffer = "";
    bufferStartLine = 0;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const kind = kinds[i];

    if (kind === "blank") {
      flush();
      continue;
    }
    if (kind === "fence-delimiter" || kind === "fence-content") {
      flush();
      continue;
    }

    const content = kind === "prose" ? cleanProseLine(rawLines[i]) : rawLines[i];

    for (const char of content) {
      if (buffer.length === 0) {
        bufferStartLine = lineNum;
      }
      buffer += char;
      if (char === "." || char === "!" || char === "?") {
        flush();
      }
    }

    const nextKind = kinds[i + 1];
    const joinsWithNext = kind === "prose" && nextKind === "prose";
    if (joinsWithNext) {
      if (buffer.length > 0) {
        buffer += " ";
      }
    } else {
      flush();
    }
  }

  flush();
  return sentences;
}
