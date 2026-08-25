import type { RunSummary } from "../types/index";

export function renderJson(summary: RunSummary): string {
  return JSON.stringify(summary, null, 2);
}
