import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function walkCss(rootAbs: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(rootAbs, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(rootAbs, e.name);
    if (e.isDirectory()) out.push(...(await walkCss(p)));
    else if (e.isFile() && p.endsWith(".css")) out.push(p);
  }
  return out.sort();
}

function toRepoRel(abs: string): string {
  return path.relative(process.cwd(), abs).split(path.sep).join("/");
}

export async function runImplementationPhase3(args: Args): Promise<void> {
  const cssFiles = [
    ...(await walkCss(path.join(process.cwd(), "app"))),
    ...(await walkCss(path.join(process.cwd(), "components"))),
  ];

  const findings: Array<{ kind: string; file: string; detail: string }> = [];
  for (const abs of cssFiles) {
    const raw = await fs.readFile(abs, "utf8");
    if (raw.includes("column-count") || raw.includes("column-width")) {
      findings.push({ kind: "multi-column-prose", file: toRepoRel(abs), detail: "CSS columns detected" });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    checks: ["no CSS multi-column prose"],
    findings,
  };
  await writeJsonAtomic(path.join(args.runDir, "layout_implementation_report.json"), report);

  const ok = findings.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "no_multi_column_css", ok, detail: `findings: ${findings.length}` },
  ]);
  await writeValidation(args.runDir, ok, { findings });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "layout_implementation_report.json", description: "Layout implementation report (static).", references: { files: ["app/**/*.css", "components/**/*.css"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 3 failed: ${findings[0]?.detail ?? "layout violations"}`);

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
      "layout_implementation_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

