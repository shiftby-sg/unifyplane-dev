import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

export async function runImplementationPhase9(args: Args): Promise<void> {
  const layout = await fs.readFile(path.join(process.cwd(), "app/layout.tsx"), "utf8");
  const globals = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");

  const report = {
    generatedAt: new Date().toISOString(),
    skipLinkPresent: layout.includes("Skip to content"),
    mainIdPresent: layout.includes('id="main"') || layout.includes("id='main'"),
    focusVisiblePresent: globals.includes(":focus-visible"),
    reducedMotionPresent: globals.includes("prefers-reduced-motion"),
  };
  await writeJsonAtomic(path.join(args.runDir, "a11y_validation_report.json"), report);

  const failures: string[] = [];
  if (!report.skipLinkPresent) failures.push("skip link missing");
  if (!report.mainIdPresent) failures.push("main id missing");
  if (!report.focusVisiblePresent) failures.push("focus-visible styles missing");
  if (!report.reducedMotionPresent) failures.push("prefers-reduced-motion handling missing");

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "skip_link", ok: report.skipLinkPresent, detail: `skipLinkPresent=${report.skipLinkPresent}` },
    { id: "main_landmark", ok: report.mainIdPresent, detail: `mainIdPresent=${report.mainIdPresent}` },
    { id: "focus_visible", ok: report.focusVisiblePresent, detail: `focusVisiblePresent=${report.focusVisiblePresent}` },
    { id: "reduced_motion", ok: report.reducedMotionPresent, detail: `reducedMotionPresent=${report.reducedMotionPresent}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "a11y_validation_report.json", description: "Accessibility baseline report (static).", references: { files: ["app/layout.tsx", "app/globals.css"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 9 failed: ${failures[0] ?? "a11y violations"}`);

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
      "a11y_validation_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

