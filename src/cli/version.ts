export function renderVersion(toolVersion: string, ruleSetVersion: string): string {
  return `clarity ${toolVersion} (rule set ${ruleSetVersion})`;
}
