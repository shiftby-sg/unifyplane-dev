import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function hasAll(raw: string, needles: string[]): boolean {
  return needles.every((n) => raw.includes(n));
}

export async function runDesignAuditPhase9(args: Args): Promise<void> {
  const readinessPageAbs = path.join(process.cwd(), "content/pages/current-readiness.md");
  const evidencePageAbs = path.join(process.cwd(), "content/pages/evidence.md");

  const readinessRaw = await fs.readFile(readinessPageAbs, "utf8");
  const evidenceRaw = await fs.readFile(evidencePageAbs, "utf8");

  const categories = ["Proven Now", "Implemented but Immature", "Future but Grounded"];
  const readinessHasCategories = hasAll(readinessRaw, categories);

  const evidenceHasBoundaries =
    evidenceRaw.includes("What current evidence proves") &&
    evidenceRaw.includes("What current evidence does not yet prove");

  const report = {
    generatedAt: new Date().toISOString(),
    readiness: { file: "content/pages/current-readiness.md", categories, present: readinessHasCategories },
    evidence: {
      file: "content/pages/evidence.md",
      provesVsNotProvedPresent: evidenceHasBoundaries,
    },
  };
  await writeJsonAtomic(path.join(args.runDir, "readiness_audit.json"), report);

  const failures: string[] = [];
  if (!readinessHasCategories) failures.push("current-readiness page missing readiness category headings");
  if (!evidenceHasBoundaries) failures.push("evidence page missing proves vs not-proved boundary sections");

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "readiness_audit.json", description: "Readiness semantics audit.", references: { files: ["content/pages/current-readiness.md", "content/pages/evidence.md"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 9 failed: ${failures[0] ?? "readiness semantics violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["readiness_audit.json", "validation.json", "evidence_index.json", "status.json"],
  });
}

