import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function walkFiles(rootAbs: string, filter: (abs: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(rootAbs, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(rootAbs, e.name);
    if (e.isDirectory()) out.push(...(await walkFiles(p, filter)));
    else if (e.isFile() && filter(p)) out.push(p);
  }
  return out.sort();
}

function toRepoRel(abs: string): string {
  return path.relative(process.cwd(), abs).split(path.sep).join("/");
}

function deriveRouteFromPageAbs(pageAbs: string): string {
  const rel = toRepoRel(pageAbs);
  const parts = rel.split("/");
  const appIndex = parts.indexOf("app");
  if (appIndex === -1) return "unknown";
  const routeParts = parts.slice(appIndex + 1);
  if (routeParts.length === 1 && routeParts[0] === "page.tsx") return "/";
  if (routeParts[routeParts.length - 1] === "page.tsx") routeParts.pop();
  return `/${routeParts.join("/")}`;
}

function parseNavItems(navTs: string): { primary: Array<{ label: string; href: string }>; secondary: Array<{ label: string; href: string }> } {
  const itemRe = /\{\s*label:\s*"([^"]+)",\s*href:\s*"([^"]+)"\s*\}/g;
  const primaryBlock = navTs.match(/export const primaryNav[\s\S]*?=\s*\[([\s\S]*?)\];/);
  const secondaryBlock = navTs.match(/export const secondaryNav[\s\S]*?=\s*\[([\s\S]*?)\];/);
  const parseBlock = (block: string | null) => {
    const out: Array<{ label: string; href: string }> = [];
    if (!block) return out;
    itemRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(block))) out.push({ label: m[1]!, href: m[2]! });
    return out;
  };
  return { primary: parseBlock(primaryBlock?.[1] ?? null), secondary: parseBlock(secondaryBlock?.[1] ?? null) };
}

export async function runImplementationPhase4(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = lockedDesign.spec as any;

  const expectedPrimary: string[] = Array.isArray(spec?.informationArchitecture?.primaryNavigation)
    ? spec.informationArchitecture.primaryNavigation
    : [];
  const expectedSecondary: string[] = Array.isArray(spec?.informationArchitecture?.secondaryNavigation)
    ? spec.informationArchitecture.secondaryNavigation
    : [];
  const expectedRoutes: Array<{ id: string; path: string; layout: string }> = Array.isArray(spec?.informationArchitecture?.routes)
    ? spec.informationArchitecture.routes.map((r: any) => ({ id: r?.id, path: r?.path, layout: r?.layout }))
    : [];

  const navRaw = await fs.readFile(path.join(process.cwd(), "lib/site/nav.ts"), "utf8");
  const actualNav = parseNavItems(navRaw);
  const actualPrimaryLabels = actualNav.primary.map((x) => x.label);
  const actualSecondaryLabels = actualNav.secondary.map((x) => x.label);

  const appRoot = path.join(process.cwd(), "app");
  const pageFiles = await walkFiles(appRoot, (p) => p.endsWith(`${path.sep}page.tsx`));
  const actualRoutes = pageFiles.map((abs) => ({
    route: deriveRouteFromPageAbs(abs),
    file: toRepoRel(abs),
  }));

  const missingPrimary = expectedPrimary.filter((x) => !actualPrimaryLabels.includes(x));
  const extraPrimary = actualPrimaryLabels.filter((x) => !expectedPrimary.includes(x));
  const writingIsSecondary = actualSecondaryLabels.includes("Writing") && !actualPrimaryLabels.includes("Writing");

  const wrongOrder = expectedPrimary.length === actualPrimaryLabels.length
    ? expectedPrimary.some((x, i) => actualPrimaryLabels[i] !== x)
    : true;

  const expectedPaths = expectedRoutes.map((r) => r.path);
  const actualPaths = actualRoutes.map((r) => r.route);
  const missingRoutes = expectedPaths.filter((p) => !actualPaths.includes(p));

  const navigationStructure = {
    generatedAt: new Date().toISOString(),
    expected: { primary: expectedPrimary, secondary: expectedSecondary },
    actual: { primary: actualPrimaryLabels, secondary: actualSecondaryLabels },
    diffs: { missingPrimary, extraPrimary, wrongOrder, writingIsSecondary },
  };

  const routeAlignmentReport = {
    generatedAt: new Date().toISOString(),
    expectedRoutes,
    actualRoutes,
    missingRoutes,
  };

  await writeJsonAtomic(path.join(args.runDir, "navigation_structure.json"), navigationStructure);
  await writeJsonAtomic(path.join(args.runDir, "route_alignment_report.json"), routeAlignmentReport);

  const failures: string[] = [];
  if (missingPrimary.length > 0) failures.push(`missing primary nav labels: ${missingPrimary.join(", ")}`);
  if (extraPrimary.length > 0) failures.push(`extra primary nav labels: ${extraPrimary.join(", ")}`);
  if (wrongOrder) failures.push("primary nav order mismatch");
  if (!writingIsSecondary) failures.push("Writing is not secondary navigation");
  if (missingRoutes.length > 0) failures.push(`missing required routes: ${missingRoutes.join(", ")}`);

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "nav_labels", ok: missingPrimary.length === 0 && extraPrimary.length === 0, detail: `missing=${missingPrimary.length} extra=${extraPrimary.length}` },
    { id: "nav_order", ok: !wrongOrder, detail: `wrongOrder=${wrongOrder}` },
    { id: "writing_secondary", ok: writingIsSecondary, detail: `writingIsSecondary=${writingIsSecondary}` },
    { id: "routes_exist", ok: missingRoutes.length === 0, detail: `missingRoutes=${missingRoutes.length}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "navigation_structure.json", description: "Navigation structure (expected vs actual).", references: { files: ["design_spec.lock.json", "lib/site/nav.ts"] } },
      { path: "route_alignment_report.json", description: "Route alignment report (expected vs actual).", references: { files: ["design_spec.lock.json", "app/**/page.tsx"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 4 failed: ${failures[0] ?? "IA violations"}`);

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
      "navigation_structure.json",
      "route_alignment_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

