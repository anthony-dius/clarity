import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

describe("clarity CLI", () => {
  test("checking a clean file exits 0 and reports PASS", async () => {
    const { stdout, exitCode } = await runCli(["fixtures/clean.md"]);
    expect(stdout).toContain("fixtures/clean.md: PASS");
    expect(exitCode).toBe(0);
  });

  test("checking multiple files reports per-file results and a summary, exit 1 on findings", async () => {
    await Bun.write("fixtures/tmp-cli-violation.md", "You might want to check this.\n");
    const { stdout, exitCode } = await runCli(["fixtures/clean.md", "fixtures/tmp-cli-violation.md"]);
    expect(stdout).toContain("fixtures/clean.md: PASS");
    expect(stdout).toContain("fixtures/tmp-cli-violation.md: FAIL");
    expect(stdout).toContain("Summary: 2 checked, 1 passed, 1 failed");
    expect(exitCode).toBe(1);
  });
});
