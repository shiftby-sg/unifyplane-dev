import fs from "node:fs/promises";
import path from "node:path";
import { fileExists, writeJsonAtomic } from "./fs-utils.js";
import { DEFAULT_TRACK, type GovernedTrack, phaseRoot } from "./paths.js";
import { computeRepoMeta } from "./repo-meta.js";

export async function approveRun(opts: {
  track?: GovernedTrack;
  phase: number;
  runId: string;
  by: string;
  notes: string | null;
}): Promise<void> {
  const track = opts.track ?? DEFAULT_TRACK;
  const runDir = path.join(phaseRoot(opts.phase, track), opts.runId);
  if (!(await fileExists(runDir))) {
    throw new Error(`Run directory not found: ${runDir}`);
  }

  // Track-specific approval preconditions.
  if (track === "implementationplan") {
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
  } else if (track === "designaudit") {
    const statusPath = path.join(runDir, "status.json");
    if (!(await fileExists(statusPath))) {
      throw new Error("Design audit approval requires status.json in the run folder.");
    }
  } else if (track === "implementation") {
    const statusPath = path.join(runDir, "status.json");
    if (!(await fileExists(statusPath))) {
      throw new Error("Implementation approval requires status.json in the run folder.");
    }
  }

  await writeJsonAtomic(path.join(runDir, "approval.json"), {
    approvedAt: new Date().toISOString(),
    track,
    phase: opts.phase,
    runId: opts.runId,
    by: opts.by,
    notes: opts.notes,
  });

  if (track === "implementationplan") {
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
  } else if (track === "designaudit") {
    // Mark the run approved in status.json for convenience; approval.json remains authoritative for gating.
    const statusPath = path.join(runDir, "status.json");
    const raw = await fs.readFile(statusPath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    parsed.approved = true;
    // Attach repo meta if missing (helps strict downstream gates).
    if (!("repoHeadSha" in parsed) || !("repoDirty" in parsed)) {
      const meta = await computeRepoMeta();
      (parsed as any).repoHeadSha = meta.repoHeadSha;
      (parsed as any).repoTreeSha = meta.repoTreeSha;
      (parsed as any).repoDirty = meta.repoDirty;
      (parsed as any).repoMetaMethod = meta.method;
    }
    await fs.writeFile(statusPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  } else if (track === "implementation") {
    const statusPath = path.join(runDir, "status.json");
    const raw = await fs.readFile(statusPath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    parsed.approved = true;
    if (!("repoHeadSha" in parsed) || !("repoDirty" in parsed)) {
      const meta = await computeRepoMeta();
      (parsed as any).repoHeadSha = meta.repoHeadSha;
      (parsed as any).repoTreeSha = meta.repoTreeSha;
      (parsed as any).repoDirty = meta.repoDirty;
      (parsed as any).repoMetaMethod = meta.method;
    }
    await fs.writeFile(statusPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  }
}
