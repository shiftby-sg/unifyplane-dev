import { runPhase } from "./runner.js";
import { approveRun } from "./approve.js";
import { validateRegistryReferences } from "./validate-registry.js";

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    [
      "Usage:",
      "  pnpm governed phase --phase <N>",
      "  pnpm governed approve --phase <N> --run <run_###> --by <name> [--notes <text>]",
      "  pnpm governed validate-registry [--missing-from phase1-approved]",
      "",
      "Notes:",
      "- Evidence root: evidence/reports/implementationplan/",
      "- Approvals gate progression; phases must be run explicitly.",
    ].join("\n"),
  );
  process.exit(2);
}

function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

async function main() {
  const command = process.argv[2];
  if (!command) usage();

  if (command === "phase") {
    const phaseRaw = getArg("--phase");
    if (!phaseRaw) usage();
    const phase = Number(phaseRaw);
    if (!Number.isInteger(phase) || phase < 1) usage();
    await runPhase({ phase });
    return;
  }

  if (command === "approve") {
    const phaseRaw = getArg("--phase");
    const runId = getArg("--run");
    const by = getArg("--by");
    const notes = getArg("--notes");
    if (!phaseRaw || !runId || !by) usage();
    const phase = Number(phaseRaw);
    if (!Number.isInteger(phase) || phase < 1) usage();
    await approveRun({ phase, runId, by, notes: notes ?? null });
    return;
  }

  if (command === "validate-registry") {
    const missingFrom = getArg("--missing-from") ?? "phase1-approved";
    if (missingFrom !== "phase1-approved") usage();
    await validateRegistryReferences({ missingFrom });
    return;
  }

  usage();
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

