import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";

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

export async function runDesignAuditPhase4(args: Args): Promise<void> {
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
    checks: [
      "no CSS multi-column prose",
    ],
    findings,
  };
  await writeJsonAtomic(path.join(args.runDir, "layout_audit.json"), report);

  const ok = findings.length === 0;
  await writeValidation(args.runDir, ok, { findings });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "layout_audit.json", description: "Layout conformance audit (static).", references: { files: ["app/**/*.css", "components/**/*.css"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 4 failed: ${findings[0]?.detail ?? "layout violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["layout_audit.json", "validation.json", "evidence_index.json", "status.json"],
  });
}

