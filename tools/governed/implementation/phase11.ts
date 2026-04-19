import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { findLatestApprovedRun } from "../state.js";
import { computeRepoMeta } from "../repo-meta.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function runImplementationPhase11(args: Args): Promise<void> {
  const meta = await computeRepoMeta();
  if (meta.repoHeadSha === null) throw new Error("Cannot resolve repo HEAD SHA (required for strict Phase 11).");

  const baseline = JSON.parse(await fs.readFile(path.join(args.runDir, "designaudit_lock_source.json"), "utf8")) as any;
  if (!isRecord(baseline) || typeof baseline.runId !== "string" || typeof baseline.runDir !== "string") {
    throw new Error("designaudit_lock_source.json missing or invalid");
  }

  const approvedDesignAudit11 = await findLatestApprovedRun(11, "designaudit");
  if (!approvedDesignAudit11) throw new Error("No approved designaudit Phase 11 run found.");

  const conformanceAbs = path.join(approvedDesignAudit11.runDir, "conformance_report.json");
  const conformance = JSON.parse(await fs.readFile(conformanceAbs, "utf8")) as any;
  const classification = conformance?.summary?.classification ?? null;
  if (classification !== "APPLIED") throw new Error(`designaudit Phase 11 classification is not APPLIED (found ${String(classification)})`);

  const daStatusAbs = path.join(approvedDesignAudit11.runDir, "status.json");
  const daStatus = JSON.parse(await fs.readFile(daStatusAbs, "utf8")) as any;
  if (!("repoHeadSha" in daStatus)) {
    throw new Error("designaudit Phase 11 status.json missing repoHeadSha; re-approve or re-run designaudit Phase 11 with updated tooling.");
  }
  if (daStatus.repoHeadSha !== meta.repoHeadSha) {
    throw new Error(`repo HEAD SHA mismatch: designaudit=${String(daStatus.repoHeadSha)} current=${meta.repoHeadSha}`);
  }

  if (meta.repoDirty) {
    throw new Error("repo is dirty (worktree differs from git index and/or untracked files present)");
  }

  const finalResult = {
    generatedAt: new Date().toISOString(),
    classification,
    designauditPhase11: {
      runId: approvedDesignAudit11.runId,
      runDir: approvedDesignAudit11.runDir,
    },
    repo: {
      headSha: meta.repoHeadSha,
      treeSha: meta.repoTreeSha,
      metaMethod: meta.method,
    },
  };

  const diff = {
    generatedAt: new Date().toISOString(),
    baselineDesignauditLockSource: {
      phase: 1,
      runId: baseline.runId,
      runDir: baseline.runDir,
    },
    validatedDesignauditPhase11: {
      runId: approvedDesignAudit11.runId,
      runDir: approvedDesignAudit11.runDir,
      repoHeadSha: daStatus.repoHeadSha ?? null,
      repoTreeSha: daStatus.repoTreeSha ?? null,
    },
  };

  await writeJsonAtomic(path.join(args.runDir, "final_designaudit_result.json"), finalResult);
  await writeJsonAtomic(path.join(args.runDir, "diff_vs_previous_audit.json"), diff);

  const ok = true;
  await writeTestResults(args.runDir, ok, [
    { id: "repo_clean", ok: !meta.repoDirty, detail: `repoDirty=${meta.repoDirty}` },
    { id: "designaudit11_approved", ok: true, detail: `runId=${approvedDesignAudit11.runId}` },
    { id: "designaudit11_applied", ok: true, detail: `classification=${classification}` },
    { id: "repo_sha_match", ok: true, detail: `headSha=${meta.repoHeadSha}` },
  ]);
  await writeValidation(args.runDir, ok, { classification });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "final_designaudit_result.json", description: "Validated designaudit Phase 11 result reference.", references: { files: [toRel(conformanceAbs), toRel(daStatusAbs)] } },
      { path: "diff_vs_previous_audit.json", description: "Diff vs baseline designaudit lock source captured in Phase 1.", references: { files: ["designaudit_lock_source.json"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  const src = JSON.parse(await fs.readFile(path.join(args.runDir, "designaudit_lock_source.json"), "utf8")) as any;
  await writeStatus(args.runDir, {
    track: "implementation",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    designauditLockSource: { phase: 1, runId: src.runId, runDir: src.runDir },
    evidenceFiles: [
      "final_designaudit_result.json",
      "diff_vs_previous_audit.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

function toRel(abs: string): string {
  return path.relative(process.cwd(), abs).split(path.sep).join("/");
}

