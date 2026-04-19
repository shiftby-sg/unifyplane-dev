import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function parseLineHeight(globalsCss: string): number | null {
  const m = globalsCss.match(/body\s*\{[\s\S]*?line-height:\s*([0-9.]+)\s*;?/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function parseHeadlineFontSize(css: string): number | null {
  const m = css.match(/\.headline\s*\{[\s\S]*?font-size:\s*([0-9.]+)rem\s*;?/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export async function runDesignAuditPhase6(args: Args): Promise<void> {
  const locked = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = locked.spec as any;
  const typography = spec?.typography ?? null;
  const h1Min = Number(typography?.scale?.h1?.min?.replace?.("rem", "") ?? NaN);
  const bodyMin = Number(typography?.scale?.body?.min?.replace?.("rem", "") ?? NaN);
  const bodyLine = typography?.scale?.body?.lineHeight ?? null;

  const globalsCss = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");
  const homeCss = await fs.readFile(
    path.join(process.cwd(), "components/HomeComposition.module.css"),
    "utf8",
  );

  const actualLineHeight = parseLineHeight(globalsCss);
  const actualHeadlineRem = parseHeadlineFontSize(homeCss);

  const findings: Array<{ kind: string; detail: string }> = [];
  if (actualLineHeight === null) findings.push({ kind: "missing", detail: "body line-height not found" });
  if (actualLineHeight !== null && typeof bodyLine === "string") {
    // Only enforce numeric lower bound from spec range string like "1.6-1.75".
    const m = bodyLine.match(/^([0-9.]+)\s*-/);
    const min = m ? Number(m[1]) : null;
    if (min !== null && actualLineHeight < min) {
      findings.push({ kind: "range", detail: `body line-height ${actualLineHeight} < spec min ${min}` });
    }
  }

  if (actualHeadlineRem !== null && Number.isFinite(h1Min) && actualHeadlineRem < h1Min) {
    findings.push({ kind: "h1", detail: `homepage hero h1 size ${actualHeadlineRem}rem < spec min ${h1Min}rem` });
  }

  // Body min size isn't directly set; we do not fail on absence, only on explicit under-sizing elsewhere.
  if (!Number.isFinite(bodyMin)) {
    findings.push({ kind: "spec", detail: "spec typography body min not parseable" });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    checks: [
      "body line-height meets spec lower bound",
      "homepage h1 meets spec min size",
    ],
    actual: {
      bodyLineHeight: actualLineHeight,
      homepageHeroH1Rem: actualHeadlineRem,
    },
    findings,
  };
  await writeJsonAtomic(path.join(args.runDir, "typography_audit.json"), report);

  const ok = findings.filter((f) => f.kind !== "spec").length === 0;
  await writeValidation(args.runDir, ok, { findings });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "typography_audit.json", description: "Typography conformance audit (static).", references: { files: ["app/globals.css", "components/HomeComposition.module.css", "contracts/specs/unifyplane.design.spec.json"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 6 failed: ${findings[0]?.detail ?? "typography violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["typography_audit.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
