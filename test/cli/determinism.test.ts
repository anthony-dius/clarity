import { describe, expect, test } from "bun:test";

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/cli/index.ts", ...args], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;
  return stdout;
}

describe("determinism", () => {
  test("running the CLI twice on the same file produces byte-identical stdout", async () => {
    const first = await runCli(["fixtures/violations.md"]);
    const second = await runCli(["fixtures/violations.md"]);
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });
});
