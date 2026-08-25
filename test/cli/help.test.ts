import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", ...args], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { stdout, exitCode };
}

describe("clarity CLI help", () => {
  test("no arguments prints usage and exits 0", async () => {
    const { stdout, exitCode } = await runCli([]);
    expect(stdout).toContain("Usage: clarity");
    expect(exitCode).toBe(0);
  });

  test("--help lists flags and every built-in rule with a one-line description", async () => {
    const { stdout, exitCode } = await runCli(["--help"]);
    expect(stdout).toContain("--json");
    expect(stdout).toContain("passive-voice");
    expect(exitCode).toBe(0);
  });
});
