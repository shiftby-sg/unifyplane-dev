import fs from "node:fs/promises";
import path from "node:path";
import { fileExists } from "./fs-utils.js";
import { DEFAULT_TRACK, type GovernedTrack, phaseRoot } from "./paths.js";

export type ApprovedRunRef = {
  track: GovernedTrack;
  phase: number;
  runId: string;
  runDir: string;
};

export async function listRuns(
  phase: number,
  track: GovernedTrack = DEFAULT_TRACK,
): Promise<string[]> {
  const dir = phaseRoot(phase, track);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name.startsWith("run_"))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export async function findLatestApprovedRun(
  phase: number,
  track: GovernedTrack = DEFAULT_TRACK,
): Promise<ApprovedRunRef | null> {
  const runs = await listRuns(phase, track);
  for (let i = runs.length - 1; i >= 0; i--) {
    const runId = runs[i]!;
    const runDir = path.join(phaseRoot(phase, track), runId);
    if (await fileExists(path.join(runDir, "approval.json"))) {
      return { track, phase, runId, runDir };
    }
  }
  return null;
}

