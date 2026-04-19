import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function fileExists(abs: string): Promise<boolean> {
  try {
    await fs.stat(abs);
    return true;
  } catch {
    return false;
  }
}

function slugFromPath(routePath: string): string {
  if (routePath === "/") return "home";
  return routePath.replace(/^\//, "");
}

export async function runImplementationPhase7(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = lockedDesign.spec as any;

  const routes: Array<{ id: string; path: string; layout: string; sections: string[] }> = Array.isArray(spec?.informationArchitecture?.routes)
    ? spec.informationArchitecture.routes.map((r: any) => ({
        id: r?.id,
        path: r?.path,
        layout: r?.layout,
        sections: Array.isArray(r?.sections) ? r.sections : [],
      }))
    : [];

  const readingTargets = routes.filter((r) => r.layout === "reading" && typeof r.path === "string");
  const canonicalReadingPaths = new Set([
    "/what-is-unifyplane",
    "/why-it-matters",
    "/current-readiness",
    "/evidence",
  ]);

  const pages = [];
  const failures: string[] = [];

  for (const r of readingTargets) {
    if (!canonicalReadingPaths.has(r.path)) continue;
    const slug = slugFromPath(r.path);
    const abs = path.join(process.cwd(), "content", "pages", `${slug}.md`);
    const exists = await fileExists(abs);
    if (!exists) {
      failures.push(`missing content page file for ${r.path}: content/pages/${slug}.md`);
      pages.push({ path: r.path, file: `content/pages/${slug}.md`, exists: false, missingSections: r.sections });
      continue;
    }

    const raw = await fs.readFile(abs, "utf8");
    const missingSections = r.sections.filter((s) => typeof s === "string" && s.trim().length > 0 && !raw.includes(s));
    if (missingSections.length > 0) failures.push(`missing required sections in ${r.path}: ${missingSections.join(", ")}`);
    pages.push({ path: r.path, file: `content/pages/${slug}.md`, exists: true, missingSections });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    pages,
  };
  await writeJsonAtomic(path.join(args.runDir, "content_pages_report.json"), report);

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "reading_pages_exist", ok: pages.every((p: any) => p.exists), detail: `missing=${pages.filter((p: any) => !p.exists).length}` },
    { id: "required_sections_present", ok: pages.every((p: any) => (p.missingSections?.length ?? 0) === 0), detail: `pagesWithMissingSections=${pages.filter((p: any) => (p.missingSections?.length ?? 0) > 0).length}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "content_pages_report.json", description: "Canonical content pages structural report.", references: { files: ["design_spec.lock.json", "content/pages/*.md"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 7 failed: ${failures[0] ?? "content page violations"}`);

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
      "content_pages_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

