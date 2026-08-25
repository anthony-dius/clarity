import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", ...args], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { stdout, exitCode };
}

describe("clarity CLI --version", () => {
  test("prints tool version and rule-set version, exits 0", async () => {
    const { stdout, exitCode } = await runCli(["--version"]);
    expect(stdout).toContain("0.1.0");
    expect(stdout).toContain("1.0.0");
    expect(exitCode).toBe(0);
  });
});

describe("clarity CLI unknown flag", () => {
  test("an unrecognized flag exits 2 with a clear error", async () => {
    const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", "--not-a-real-flag"], { stdout: "pipe", stderr: "pipe" });
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    expect(exitCode).toBe(2);
    expect(stderr).toContain("--not-a-real-flag");
  });
});
