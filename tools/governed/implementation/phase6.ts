import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function extractHomeBandOrder(homeTsx: string): string[] {
  const out: string[] = [];
  const re = /data-home-band="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(homeTsx))) out.push(m[1]!);
  return out;
}

export async function runImplementationPhase6(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = lockedDesign.spec as any;

  const requiredRoutes: string[] = Array.isArray(spec?.informationArchitecture?.routes)
    ? spec.informationArchitecture.routes
        .map((r: any) => r?.path)
        // Required onward routes: exclude home itself and Writing (secondary).
        .filter((p: any) => typeof p === "string" && p !== "/" && p !== "/writing")
    : [
        "/what-is-unifyplane",
        "/why-it-matters",
        "/current-readiness",
        "/evidence",
        "/components",
        "/foundations",
      ];

  const homePage = await fs.readFile(path.join(process.cwd(), "app/page.tsx"), "utf8");
  const compositionUsed =
    homePage.includes("loadHomeComposition") && homePage.includes("HomeCompositionView");

  const homeView = await fs.readFile(path.join(process.cwd(), "components/HomeComposition.tsx"), "utf8");
  const homeComposition = await fs.readFile(path.join(process.cwd(), "content/compositions/home.yml"), "utf8");
  const bands = extractHomeBandOrder(homeView);

  const readinessBucketsPresent =
    homeView.includes("Proven now") &&
    homeView.includes("Implemented but immature") &&
    homeView.includes("Future but grounded");

  const missingRouteLinks = requiredRoutes.filter((r) => !homeComposition.includes(`"href": "${r}"`));

  const homepageStructure = {
    generatedAt: new Date().toISOString(),
    compositionUsed,
    bandsInRenderOrder: bands,
  };
  const homepageBehavior = {
    generatedAt: new Date().toISOString(),
    requiredRoutes,
    missingRouteLinks,
    readinessBucketsPresent,
    ownsDeepInterpretation: false,
  };

  await writeJsonAtomic(path.join(args.runDir, "homepage_structure.json"), homepageStructure);
  await writeJsonAtomic(path.join(args.runDir, "homepage_behavior_report.json"), homepageBehavior);

  const failures: string[] = [];
  if (!compositionUsed) failures.push("homepage does not use content composition loader/view");
  if (!readinessBucketsPresent) failures.push("homepage readiness buckets not visible");
  if (missingRouteLinks.length > 0) failures.push(`homepage missing route links: ${missingRouteLinks.join(", ")}`);

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "composition_used", ok: compositionUsed, detail: `compositionUsed=${compositionUsed}` },
    { id: "readiness_buckets", ok: readinessBucketsPresent, detail: `readinessBucketsPresent=${readinessBucketsPresent}` },
    { id: "route_links", ok: missingRouteLinks.length === 0, detail: `missing=${missingRouteLinks.length}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "homepage_structure.json", description: "Homepage structure snapshot.", references: { files: ["app/page.tsx", "components/HomeComposition.tsx"] } },
      { path: "homepage_behavior_report.json", description: "Homepage behavior report (routing-first).", references: { files: ["design_spec.lock.json", "components/HomeComposition.tsx"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 6 failed: ${failures[0] ?? "homepage violations"}`);

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
      "homepage_structure.json",
      "homepage_behavior_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}
