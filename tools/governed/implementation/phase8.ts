import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function hasAll(raw: string, needles: string[]): boolean {
  return needles.every((n) => raw.includes(n));
}

export async function runImplementationPhase8(args: Args): Promise<void> {
  const abs = path.join(process.cwd(), "content/pages/current-readiness.md");
  const raw = await fs.readFile(abs, "utf8");

  const categories = ["Proven Now", "Implemented but Immature", "Future but Grounded"];
  const present = hasAll(raw, categories);

  const report = {
    generatedAt: new Date().toISOString(),
    file: "content/pages/current-readiness.md",
    categories,
    present,
  };
  await writeJsonAtomic(path.join(args.runDir, "readiness_system_report.json"), report);

  const failures: string[] = [];
  if (!present) failures.push("readiness bucket headings missing");

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "bucket_headings_present", ok: present, detail: `present=${present}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "readiness_system_report.json", description: "Readiness bucket presence report.", references: { files: ["content/pages/current-readiness.md"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 8 failed: ${failures[0] ?? "readiness semantics violations"}`);

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
      "readiness_system_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

