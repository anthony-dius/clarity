import type { RunSummary } from "../types/index";

export function renderText(summary: RunSummary): string {
  const lines: string[] = [];
  for (const result of summary.results) {
    const status = result.status === "pass" ? "PASS" : "FAIL";
    lines.push(`${result.file}: ${status} (${result.findings.length} finding(s))`);
    for (const finding of result.findings) {
      lines.push(`  ${finding.line}:${finding.column ?? ""}  [${finding.ruleId}]  ${finding.message}`);
      lines.push(`    principle: ${finding.principle}`);
      lines.push(`    fix: ${finding.remediation}`);
    }
  }
  lines.push("");
  lines.push(
    `Summary: ${summary.filesChecked} checked, ${summary.filesPassed} passed, ${summary.filesFailed} failed, ${summary.totalFindings} findings`,
  );
  return lines.join("\n");
}
