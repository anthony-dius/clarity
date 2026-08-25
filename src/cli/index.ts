import { runCheck } from "../engine/run";
import { renderText } from "../format/text";
import { renderJson } from "../format/json";
import { renderHelp } from "./help";
import { renderVersion } from "./version";
import "../rules/register-all";

const TOOL_VERSION = "0.1.0";
const RULE_SET_VERSION = "1.0.0";

async function main(argv: string[]): Promise<number> {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    console.log(renderHelp());
    return 0;
  }
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(renderVersion(TOOL_VERSION, RULE_SET_VERSION));
    return 0;
  }
  const jsonMode = argv.includes("--json");
  const rest = argv.filter((a) => a !== "--json");
  const unknownFlag = rest.find((a) => a.startsWith("-"));
  if (unknownFlag) {
    console.error(`Unknown flag: ${unknownFlag}`);
    return 2;
  }
  const files = rest;
  const summary = await runCheck(files, TOOL_VERSION, RULE_SET_VERSION);
  console.log(jsonMode ? renderJson(summary) : renderText(summary));
  return summary.exitCode;
}

if (import.meta.main) {
  const exitCode = await main(process.argv.slice(2));
  process.exit(exitCode);
}
