export interface Rule {
  id: string;
  name: string;
  principle: string;
  description: string;
  check(text: string, filePath: string): Finding[];
}

export interface Finding {
  file: string;
  line: number;
  column: number | null;
  ruleId: string;
  principle: string;
  message: string;
  remediation: string;
  excerpt: string;
}

export interface CheckResult {
  file: string;
  status: "pass" | "fail";
  findings: Finding[];
}

export interface RunSummary {
  toolVersion: string;
  ruleSetVersion: string;
  results: CheckResult[];
  filesChecked: number;
  filesPassed: number;
  filesFailed: number;
  totalFindings: number;
  exitCode: 0 | 1;
}
