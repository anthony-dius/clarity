import type { CheckResult } from "../types/index";
import { readFileForCheck } from "./reader";
import { listRules } from "../rules/index";
import { sortFindings } from "./sort";
import { findVerbatimRegions } from "./verbatim";

function maskVerbatimRegions(text: string, regions: { startLine: number; endLine: number }[]): string {
  const lines = text.split("\n");
  for (const region of regions) {
    for (let lineNum = region.startLine; lineNum <= region.endLine; lineNum++) {
      lines[lineNum - 1] = " ".repeat(lines[lineNum - 1].length);
    }
  }
  return lines.join("\n");
}

export async function checkFile(filePath: string): Promise<CheckResult> {
  const read = await readFileForCheck(filePath);
  if (!read.ok) {
    return {
      file: filePath,
      status: "fail",
      findings: [
        {
          file: filePath,
          line: 0,
          column: null,
          ruleId: "file-error",
          principle: "N/A",
          message: read.error,
          remediation: "Fix the file path or its contents so it can be read as text.",
          excerpt: "",
        },
      ],
    };
  }

  const { regions, errors } = findVerbatimRegions(read.text);
  if (errors.length > 0) {
    return {
      file: filePath,
      status: "fail",
      findings: [
        {
          file: filePath,
          line: errors[0].line,
          column: null,
          ruleId: "verbatim-marker-error",
          principle: "N/A",
          message: errors[0].message,
          remediation: "Fix the verbatim marker pair so every start has exactly one matching end, with no nesting.",
          excerpt: "",
        },
      ],
    };
  }

  const maskedText = maskVerbatimRegions(read.text, regions);
  const findings = sortFindings(listRules().flatMap((rule) => rule.check(maskedText, filePath)));
  return {
    file: filePath,
    status: findings.length === 0 ? "pass" : "fail",
    findings,
  };
}
