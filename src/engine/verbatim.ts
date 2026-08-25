export interface VerbatimRegion {
  startLine: number;
  endLine: number;
}

export interface VerbatimError {
  line: number;
  message: string;
}

export interface VerbatimScanResult {
  regions: VerbatimRegion[];
  errors: VerbatimError[];
}

const START_MARKER = "<!-- clarity:verbatim:start -->";
const END_MARKER = "<!-- clarity:verbatim:end -->";

export function findVerbatimRegions(text: string): VerbatimScanResult {
  const regions: VerbatimRegion[] = [];
  const errors: VerbatimError[] = [];
  let openStartLine: number | null = null;

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const trimmed = lines[i].trim();
    if (trimmed === START_MARKER) {
      if (openStartLine !== null) {
        errors.push({ line: lineNum, message: "Nested verbatim start marker: verbatim regions cannot be nested." });
      } else {
        openStartLine = lineNum;
      }
    } else if (trimmed === END_MARKER) {
      if (openStartLine !== null) {
        regions.push({ startLine: openStartLine, endLine: lineNum });
        openStartLine = null;
      } else {
        errors.push({ line: lineNum, message: "Stray verbatim end marker: no matching <!-- clarity:verbatim:start --> before it." });
      }
    }
  }

  if (openStartLine !== null) {
    errors.push({ line: openStartLine, message: "Unclosed verbatim marker: no matching <!-- clarity:verbatim:end --> before end of file." });
  }

  return { regions, errors };
}
