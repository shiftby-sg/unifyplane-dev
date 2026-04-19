import { runPhase } from "./runner.js";
import { approveRun } from "./approve.js";
import { validateRegistryReferences } from "./validate-registry.js";
import { validateDesignAuditSpec } from "./designaudit/validate-spec.js";
import { validateImplementationSpec } from "./implementation/validate-spec.js";
import { DEFAULT_TRACK, type GovernedTrack } from "./paths.js";

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    [
      "Usage:",
      "  pnpm governed phase --phase <N> [--track <track>]",
      "  pnpm governed approve --phase <N> --run <run_###> --by <name> [--notes <text>] [--track <track>]",
      "  pnpm governed validate-registry [--missing-from phase1-approved]",
      "  pnpm governed validate-design-audit-spec",
      "  pnpm governed validate-implementation-spec",
      "",
      "Notes:",
      "- Tracks: implementationplan (default), designaudit, implementation",
      "- Evidence root: evidence/reports/<track>/",
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

function parseTrack(raw: string | undefined): GovernedTrack {
  const v = raw ?? DEFAULT_TRACK;
  if (v !== "implementationplan" && v !== "designaudit" && v !== "implementation") usage();
  return v;
}

async function main() {
  const command = process.argv[2];
  if (!command) usage();

  if (command === "phase") {
    const phaseRaw = getArg("--phase");
    const track = parseTrack(getArg("--track"));
    if (!phaseRaw) usage();
    const phase = Number(phaseRaw);
    if (!Number.isInteger(phase) || phase < 1) usage();
    await runPhase({ phase, track });
    return;
  }

  if (command === "approve") {
    const phaseRaw = getArg("--phase");
    const runId = getArg("--run");
    const by = getArg("--by");
    const notes = getArg("--notes");
    const track = parseTrack(getArg("--track"));
    if (!phaseRaw || !runId || !by) usage();
    const phase = Number(phaseRaw);
    if (!Number.isInteger(phase) || phase < 1) usage();
    await approveRun({ track, phase, runId, by, notes: notes ?? null });
    return;
  }

  if (command === "validate-registry") {
    const missingFrom = getArg("--missing-from") ?? "phase1-approved";
    if (missingFrom !== "phase1-approved") usage();
    await validateRegistryReferences({ missingFrom });
    return;
  }

  if (command === "validate-design-audit-spec") {
    await validateDesignAuditSpec();
    return;
  }

  if (command === "validate-implementation-spec") {
    await validateImplementationSpec();
    return;
  }

  usage();
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

