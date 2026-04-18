import fs from "node:fs/promises";
import path from "node:path";
import { fileExists, writeJsonAtomic } from "./fs-utils.js";
import { phaseRoot } from "./paths.js";

export async function approveRun(opts: {
  phase: number;
  runId: string;
  by: string;
  notes: string | null;
}): Promise<void> {
  const runDir = path.join(phaseRoot(opts.phase), opts.runId);
  if (!(await fileExists(runDir))) {
    throw new Error(`Run directory not found: ${runDir}`);
  }

  // Require that phase run produced the canonical inventory pin if present.
  if (opts.phase === 1) {
    const invPath = path.join(runDir, "canonical_inventory.json");
    if (!(await fileExists(invPath))) {
      throw new Error(
        "Phase 1 approval requires canonical_inventory.json alongside approval.json.",
      );
    }
  } else {
    const invPath = path.join(runDir, "canonical_inventory.lock.json");
    if (!(await fileExists(invPath))) {
      throw new Error(
        "Approval requires canonical_inventory.lock.json alongside approval.json (copied from approved Phase 1).",
      );
    }
  }

  await writeJsonAtomic(path.join(runDir, "approval.json"), {
    approvedAt: new Date().toISOString(),
    phase: opts.phase,
    runId: opts.runId,
    by: opts.by,
    notes: opts.notes,
  });

  // Store the discovered canonical path inventory alongside approval.json for each approved phase run.
  // Phase 1 already has canonical_inventory.json; later phases have canonical_inventory.lock.json.
  if (opts.phase === 1) {
    const src = path.join(runDir, "canonical_inventory.json");
    const dest = path.join(runDir, "canonical_inventory.approved.json");
    if (!(await fileExists(dest))) {
      await fs.copyFile(src, dest);
    }
  } else {
    const src = path.join(runDir, "canonical_inventory.lock.json");
    const dest = path.join(runDir, "canonical_inventory.approved.json");
    if (!(await fileExists(dest))) {
      await fs.copyFile(src, dest);
    }
  }
}
