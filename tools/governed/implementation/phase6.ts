import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

type UxRuleDef = {
  id: string;
  title: string;
  severity: "critical";
  evidence?: { files?: string[] };
};

type UxRuleResult = {
  id: string;
  title: string;
  ok: boolean;
  details: string;
  evidence: { files: string[]; excerpts?: string[] };
};

function extractHomeBandOrder(homeTsx: string): string[] {
  const out: string[] = [];
  const re = /data-home-band="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(homeTsx))) out.push(m[1]!);
  return out;
}

function includesRegex(text: string, re: RegExp): boolean {
  return re.test(text);
}

function countOccurrences(text: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const next = text.indexOf(needle, idx);
    if (next < 0) return count;
    count++;
    idx = next + needle.length;
  }
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
  const homeCss = await fs.readFile(
    path.join(process.cwd(), "components/HomeComposition.module.css"),
    "utf8",
  );
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

  // UX checks are driven by the locked implementation spec when present.
  const lockedImpl = await loadLockedSpec<Record<string, unknown>>(args.runDir, "implementation_spec.lock.json");
  const implSpec = lockedImpl.spec as any;
  const phaseSpec = Array.isArray(implSpec?.phases) ? implSpec.phases.find((p: any) => p?.id === args.phase) : null;
  const uxChecklist = phaseSpec?.uxChecklist ?? null;

  const uxRuleResults: UxRuleResult[] = [];
  const uxFailures: string[] = [];

  const uxFiles = ["components/HomeComposition.tsx", "components/HomeComposition.module.css", "content/compositions/home.yml"];

  const uxChecklistMissing =
    !uxChecklist || !Array.isArray(uxChecklist.rules) || uxChecklist.rules.length === 0;
  const runUx = !uxChecklistMissing;

  if (uxChecklistMissing) {
    // Phase 6 is contract-governed: missing uxChecklist is a fail-closed condition.
    uxFailures.push("UX checklist missing from locked implementation spec for Phase 6");
  } else {
    const ruleDefs = uxChecklist.rules as UxRuleDef[];

    // Precompute shared facts once.
    const hasCardTitleRef = includesRegex(homeView, /\bstyles\.cardTitle\b/);
    const headingInsideCard = includesRegex(
      homeView,
      /<(article|div)[^>]*className=\\{[^}]*styles\\.card[^}]*\\}[\\s\\S]*?<h3\\b/,
    );

    const linkWithCardClass = includesRegex(homeView, /<Link[^>]*className=\\{[^}]*styles\\.card[^}]*\\}/);
    const linkWrapsCard = includesRegex(
      homeView,
      /<Link[^>]*>[\\s\\r\\n]*<(article|div|section)[^>]*className=\\{[^}]*styles\\.card[^}]*\\}/,
    );
    const fullCardClick = linkWithCardClass || linkWrapsCard;

    const hasSectionTitleMinHeight = includesRegex(
      homeCss,
      /@media\\s*\\(min-width:\\s*900px\\)\\s*\\{[\\s\\S]*?\\.sectionTitle\\s*\\{[\\s\\S]*?min-height\\s*:\\s*[^;]+;/,
    );

    const bandInnerCount = countOccurrences(homeView, "className={styles.bandInner}");
    const bandInnerCenteredCss = includesRegex(homeCss, /\.bandInner\\s*\\{[\\s\\S]*?margin\\s*:\\s*0\\s+auto\\s*;/);
    const centeredAllBands = bandInnerCount >= 5 && bandInnerCenteredCss;

    const hasLinksTwoCol = includesRegex(
      homeCss,
      /@media\\s*\\(min-width:\\s*900px\\)\\s*\\{[\\s\\S]*?\\.linksList\\s*\\{[\\s\\S]*?grid-template-columns\\s*:\\s*[^;]+;/,
    );

    const hasDisallowedLabels =
      homeView.includes("Operational parts") ||
      homeView.includes("Deeper foundations") ||
      homeComposition.includes('\"title\": \"What UnifyPlane is\"');

    const railHasPointer = includesRegex(homeCss, /\.railItem\\s*\\{[\\s\\S]*?cursor\\s*:\\s*pointer\\s*;/);
    const railHasHover = includesRegex(homeCss, /\.railItem:hover/);
    const railOk = !railHasPointer && !railHasHover;

    for (const def of ruleDefs) {
      const evidenceFiles = Array.isArray(def?.evidence?.files) && def.evidence.files.length > 0 ? def.evidence.files : uxFiles;
      const title = typeof def.title === "string" && def.title.length > 0 ? def.title : def.id;

      let okRule = false;
      let details = "";

      switch (def.id) {
        case "S1": {
          okRule = !hasCardTitleRef && !headingInsideCard;
          details = okRule
            ? "no card titles detected inside .card containers"
            : hasCardTitleRef
              ? "cardTitle styling is still referenced; card titles are expected to be removed"
              : "found a heading inside a .card container; headings must live above cards";
          break;
        }
        case "I1": {
          okRule = !fullCardClick;
          details = okRule
            ? "no Link wrappers for .card detected"
            : linkWithCardClass
              ? "found Link with className including styles.card"
              : "found Link wrapping a .card container";
          break;
        }
        case "I2": {
          okRule = !fullCardClick;
          details = okRule
            ? "derived pass (card is not a Link wrapper)"
            : "derived fail (card is wrapped by Link or Link carries card class)";
          break;
        }
        case "S3": {
          okRule = hasSectionTitleMinHeight;
          details = okRule
            ? "sectionTitle min-height rule present at desktop breakpoint"
            : "missing desktop sectionTitle min-height rule";
          break;
        }
        case "L1": {
          okRule = centeredAllBands;
          details = okRule
            ? `bandInner wrappers found: ${bandInnerCount}; CSS centers via margin: 0 auto`
            : `expected >= 5 bandInner wrappers AND centered CSS; found wrappers=${bandInnerCount}, centeredCss=${bandInnerCenteredCss}`;
          break;
        }
        case "E1": {
          okRule = hasLinksTwoCol;
          details = okRule
            ? "desktop linksList grid-template-columns present"
            : "missing desktop 2-column linksList styling";
          break;
        }
        case "N1": {
          okRule = !hasDisallowedLabels;
          details = okRule ? "no disallowed labels present" : "found disallowed homepage labels or mismatched route label";
          break;
        }
        case "V2": {
          okRule = railOk;
          details = okRule
            ? "railItem has no pointer cursor and no hover rules"
            : "railItem cursor/hover indicates interactivity";
          break;
        }
        default: {
          okRule = false;
          details = `unknown UX rule id '${def.id}' (Phase 6 is fail-closed for unknown rules)`;
        }
      }

      uxRuleResults.push({
        id: def.id,
        title,
        ok: okRule,
        details,
        evidence: { files: evidenceFiles },
      });
      if (!okRule) uxFailures.push(`${def.id}: ${details}`);
    }
  }

  const homepageUxReport = {
    generatedAt: new Date().toISOString(),
    hasChecklist: Boolean(runUx),
    checklistVersion: runUx ? String(uxChecklist.version ?? "") : null,
    rules: uxRuleResults,
    failures: uxFailures,
    evidence: { files: uxFiles },
  };
  await writeJsonAtomic(path.join(args.runDir, "homepage_ux_report.json"), homepageUxReport);

  const failures: string[] = [];
  if (!compositionUsed) failures.push("homepage does not use content composition loader/view");
  if (!readinessBucketsPresent) failures.push("homepage readiness buckets not visible");
  if (missingRouteLinks.length > 0) failures.push(`homepage missing route links: ${missingRouteLinks.join(", ")}`);
  if (uxFailures.length > 0) failures.push(`homepage UX checklist failed: ${uxFailures[0]}`);

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "composition_used", ok: compositionUsed, detail: `compositionUsed=${compositionUsed}` },
    { id: "readiness_buckets", ok: readinessBucketsPresent, detail: `readinessBucketsPresent=${readinessBucketsPresent}` },
    { id: "route_links", ok: missingRouteLinks.length === 0, detail: `missing=${missingRouteLinks.length}` },
    { id: "ux_checklist_present", ok: runUx, detail: runUx ? "uxChecklist present in locked implementation spec" : "uxChecklist missing in locked implementation spec" },
    ...(uxRuleResults.length > 0
      ? uxRuleResults.map((r) => ({ id: `ux_${r.id}`, ok: r.ok, detail: r.details }))
      : [{ id: "ux_rules", ok: false, detail: "no UX rules executed" }]),
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "homepage_structure.json", description: "Homepage structure snapshot.", references: { files: ["app/page.tsx", "components/HomeComposition.tsx"] } },
      { path: "homepage_behavior_report.json", description: "Homepage behavior report (routing-first).", references: { files: ["design_spec.lock.json", "components/HomeComposition.tsx"] } },
      { path: "homepage_ux_report.json", description: "Homepage UX checklist report (deterministic, fail-closed).", references: { files: ["implementation_spec.lock.json", "components/HomeComposition.tsx", "components/HomeComposition.module.css", "content/compositions/home.yml"] } },
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
      "homepage_ux_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}
