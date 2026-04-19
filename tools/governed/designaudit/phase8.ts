import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

const MOJIBAKE_PATTERNS = ["â€”", "â€“", "â€", "Ã¢â‚¬"] as const;

function findMojibake(text: string): string[] {
  const hits: string[] = [];
  for (const p of MOJIBAKE_PATTERNS) {
    if (text.includes(p)) hits.push(p);
  }
  if (text.includes("\uFFFD")) hits.push("\uFFFD");
  return hits;
}

export async function runDesignAuditPhase8(args: Args): Promise<void> {
  await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");

  const homePage = await fs.readFile(path.join(process.cwd(), "app/page.tsx"), "utf8");
  const homeView = await fs.readFile(
    path.join(process.cwd(), "components/HomeComposition.tsx"),
    "utf8",
  );
  const homeComposition = await fs.readFile(
    path.join(process.cwd(), "content/compositions/home.yml"),
    "utf8",
  );
  const homeSeo = await fs.readFile(path.join(process.cwd(), "lib/seo/home.ts"), "utf8");

  const usesHomeComposition = homePage.includes("HomeCompositionView") || homePage.includes("HomeComposition");
  const ownsDeepInterpretation = homeView.includes("Prose") || homeView.includes("dangerouslySetInnerHTML");
  const hasReadinessBuckets = homeView.includes("Proven now") && homeView.includes("Implemented but immature") && homeView.includes("Future but grounded");

  const requiredRoutes = [
    "/what-is-unifyplane",
    "/why-it-matters",
    "/current-readiness",
    "/evidence",
    "/components",
    "/foundations",
  ];
  const missingRoutes = requiredRoutes.filter((r) => !homeComposition.includes(`"href": "${r}"`));

  const mojibake = {
    "content/compositions/home.yml": findMojibake(homeComposition),
    "lib/seo/home.ts": findMojibake(homeSeo),
  };
  const mojibakeFiles = Object.entries(mojibake)
    .filter(([, hits]) => hits.length > 0)
    .map(([file]) => file);

  const report = {
    generatedAt: new Date().toISOString(),
    checks: {
      usesHomeComposition,
      ownsDeepInterpretation,
      hasReadinessBuckets,
    },
    requiredRoutes,
    missingRoutes,
    mojibake,
  };
  await writeJsonAtomic(path.join(args.runDir, "homepage_audit.json"), report);

  const failures: string[] = [];
  if (!usesHomeComposition) failures.push("home page does not use HomeCompositionView");
  if (ownsDeepInterpretation) failures.push("homepage appears to own deep interpretation (Prose/HTML rendering detected)");
  if (!hasReadinessBuckets) failures.push("homepage readiness boundary buckets missing");
  if (missingRoutes.length > 0) failures.push(`homepage missing route links: ${missingRoutes.join(", ")}`);
  if (mojibakeFiles.length > 0) failures.push(`mojibake detected in: ${mojibakeFiles.join(", ")}`);

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "homepage_audit.json", description: "Homepage behavioral conformance audit.", references: { files: ["app/page.tsx", "components/HomeComposition.tsx", "content/compositions/home.yml", "lib/seo/home.ts"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 8 failed: ${failures[0] ?? "homepage behavior violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["homepage_audit.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
