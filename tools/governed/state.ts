import fs from "node:fs/promises";
import path from "node:path";
import { fileExists } from "./fs-utils.js";
import { phaseRoot } from "./paths.js";

export type ApprovedRunRef = {
  phase: number;
  runId: string;
  runDir: string;
};

export async function listRuns(phase: number): Promise<string[]> {
  const dir = phaseRoot(phase);
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
): Promise<ApprovedRunRef | null> {
  const runs = await listRuns(phase);
  for (let i = runs.length - 1; i >= 0; i--) {
    const runId = runs[i]!;
    const runDir = path.join(phaseRoot(phase), runId);
    if (await fileExists(path.join(runDir, "approval.json"))) {
      return { phase, runId, runDir };
    }
  }
  return null;
}

