import type { RunSummary } from "../types/index";
import { checkFile } from "./check";

export async function runCheck(files: string[], toolVersion: string, ruleSetVersion: string): Promise<RunSummary> {
  const results = [];
  for (const file of files) {
    results.push(await checkFile(file));
  }

  const filesPassed = results.filter((r) => r.status === "pass").length;
  const filesFailed = results.length - filesPassed;
  const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0);

  return {
    toolVersion,
    ruleSetVersion,
    results,
    filesChecked: results.length,
    filesPassed,
    filesFailed,
    totalFindings,
    exitCode: totalFindings > 0 ? 1 : 0,
  };
}
