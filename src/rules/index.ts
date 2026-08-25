import type { Rule } from "../types/index";

const registry: Rule[] = [];

export function registerRule(rule: Rule): void {
  registry.push(rule);
}

export function listRules(): Rule[] {
  return registry;
}
