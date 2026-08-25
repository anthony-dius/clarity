import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", ...args], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { stdout, exitCode };
}

describe("clarity CLI --json", () => {
  test("emits a parseable RunSummary with one entry per finding", async () => {
    const { stdout, exitCode } = await runCli(["--json", "fixtures/violations.md"]);
    const summary = JSON.parse(stdout);
    expect(summary.toolVersion).toBeDefined();
    expect(summary.ruleSetVersion).toBeDefined();
    expect(summary.results[0].findings.length).toBeGreaterThan(0);
    expect(summary.results[0].findings[0].ruleId).toBeDefined();
    expect(summary.results[0].findings[0].remediation).toBeDefined();
    expect(exitCode).toBe(1);
  });
});
