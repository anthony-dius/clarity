import type { CheckResult } from "../types/index";
import { readFileForCheck } from "./reader";
import { listRules } from "../rules/index";
import { sortFindings } from "./sort";

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

  const findings = sortFindings(listRules().flatMap((rule) => rule.check(read.text, filePath)));
  return {
    file: filePath,
    status: findings.length === 0 ? "pass" : "fail",
    findings,
  };
}
