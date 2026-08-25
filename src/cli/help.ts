import { listRules } from "../rules/index";

export function renderHelp(): string {
  const lines = [
    "Usage: clarity [options] <file...>",
    "",
    "Options:",
    "  --json         Emit machine-readable JSON output",
    "  -h, --help     Show this help",
    "  -v, --version  Show tool and rule-set version",
    "",
    "Built-in rules:",
  ];
  for (const rule of listRules()) {
    lines.push(`  ${rule.id}  ${rule.description}`);
  }
  return lines.join("\n");
}
