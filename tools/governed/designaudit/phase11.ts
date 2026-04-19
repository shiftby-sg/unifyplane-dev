import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { findLatestApprovedRun } from "../state.js";
import { writeEvidenceIndex, writeMarkdown, writeStatus, writeValidation } from "./artifacts.js";
import type { ConformanceClassification } from "./types.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

export async function runDesignAuditPhase11(args: Args): Promise<void> {
  // Aggregate only approved prior runs.
  const phases: Array<{ id: number; artifact: string }> = [
    { id: 1, artifact: "spec_validation.json" },
    { id: 2, artifact: "site_snapshot.json" },
    { id: 3, artifact: "route_validation.json" },
    { id: 4, artifact: "layout_audit.json" },
    { id: 5, artifact: "token_audit.json" },
    { id: 6, artifact: "typography_audit.json" },
    { id: 7, artifact: "component_audit.json" },
    { id: 8, artifact: "homepage_audit.json" },
    { id: 9, artifact: "readiness_audit.json" },
    { id: 10, artifact: "performance_report.json" },
  ];

  const approvedRuns: Array<{ phase: number; runDir: string; runId: string }> = [];
  for (const p of phases) {
    const approved = await findLatestApprovedRun(p.id, "designaudit");
    if (!approved) throw new Error(`Phase 11 blocked: missing approved Phase ${p.id} designaudit run.`);
    approvedRuns.push({ phase: p.id, runDir: approved.runDir, runId: approved.runId });
  }

  const gapMatrix: Array<{ phase: number; classification: ConformanceClassification; approvedRun: string }> = [];
  for (const r of approvedRuns) {
    // With fail-closed gating, an approved phase implies "APPLIED" for that phase's scope.
    gapMatrix.push({ phase: r.phase, classification: "APPLIED", approvedRun: r.runId });
  }

  const conformance = {
    generatedAt: new Date().toISOString(),
    track: "designaudit",
    summary: {
      classification: "APPLIED" as ConformanceClassification,
      approvedPhases: approvedRuns.map((r) => r.phase),
    },
    approvedRuns,
  };

  await writeJsonAtomic(path.join(args.runDir, "gap_matrix.json"), {
    generatedAt: new Date().toISOString(),
    entries: gapMatrix,
  });
  await writeJsonAtomic(path.join(args.runDir, "conformance_report.json"), conformance);
  await writeMarkdown(
    args.runDir,
    "remediation_plan.md",
    "Remediation Plan",
    "All phases are approved and applied under fail-closed gating. If conformance expectations change, update contracts and re-run from Phase 1.",
  );

  await writeValidation(args.runDir, true, { approvedRuns: approvedRuns.length });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "conformance_report.json", description: "Final conformance decision report.", references: { files: ["evidence/reports/designaudit/**/approval.json"] } },
      { path: "gap_matrix.json", description: "Gap matrix classification.", references: { files: ["evidence/reports/designaudit/**/approval.json"] } },
      { path: "remediation_plan.md", description: "Remediation plan document.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["conformance_report.json", "gap_matrix.json", "remediation_plan.md", "validation.json", "evidence_index.json", "status.json"],
  });
}

