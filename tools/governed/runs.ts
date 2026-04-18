import path from "node:path";
import { ensureDir, fileExists } from "./fs-utils.js";
import { phaseRoot } from "./paths.js";
import { listRuns } from "./state.js";

export type RunRef = {
  phase: number;
  runId: string;
  runDir: string;
};

function formatRunId(n: number): string {
  return `run_${String(n).padStart(3, "0")}`;
}

export async function createNextRunDir(phase: number): Promise<RunRef> {
  const existing = await listRuns(phase);
  let next = 1;
  if (existing.length > 0) {
    const last = existing[existing.length - 1]!;
    const m = last.match(/^run_(\d{3})$/);
    if (m) next = Number(m[1]) + 1;
  }
  while (true) {
    const runId = formatRunId(next);
    const runDir = path.join(phaseRoot(phase), runId);
    if (!(await fileExists(runDir))) {
      await ensureDir(runDir);
      return { phase, runId, runDir };
    }
    next++;
  }
}

