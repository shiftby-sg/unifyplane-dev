import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

type SiteSnapshot = {
  routes: Array<{ route: string; file: string; dynamic: boolean; pageShellWidth: "content" | "wide" | "unknown" }>;
  nav: { primary: Array<{ label: string; href: string }>; secondary: Array<{ label: string; href: string }> };
};

export async function runDesignAuditPhase3(args: Args): Promise<void> {
  if (!args.prevApprovedRunDir) throw new Error("Phase 3 requires Phase 2 approved run directory.");

  const design = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const designSpec = design.spec;
  if (!isRecord(designSpec) || !isRecord(designSpec.informationArchitecture)) {
    throw new Error("Locked design spec missing informationArchitecture");
  }
  const ia = designSpec.informationArchitecture as Record<string, unknown>;
  const expectedPrimary = Array.isArray(ia.primaryNavigation) ? (ia.primaryNavigation as string[]) : [];
  const expectedSecondary = Array.isArray(ia.secondaryNavigation) ? (ia.secondaryNavigation as string[]) : [];
  const expectedRoutes = Array.isArray(ia.routes) ? (ia.routes as Array<Record<string, unknown>>) : [];

  const snapshot = JSON.parse(
    await fs.readFile(path.join(args.prevApprovedRunDir, "site_snapshot.json"), "utf8"),
  ) as SiteSnapshot;

  const actualPrimaryLabels = snapshot.nav.primary.map((i) => i.label);
  const actualSecondaryLabels = snapshot.nav.secondary.map((i) => i.label);
  const actualRoutes = snapshot.routes.map((r) => r.route);

  const missingPrimary = expectedPrimary.filter((x) => !actualPrimaryLabels.includes(x));
  const extraPrimary = actualPrimaryLabels.filter((x) => !expectedPrimary.includes(x));
  const wrongOrder =
    expectedPrimary.length === actualPrimaryLabels.length &&
    expectedPrimary.some((x, i) => actualPrimaryLabels[i] !== x);

  const writingIsSecondary =
    actualSecondaryLabels.includes("Writing") && !actualPrimaryLabels.includes("Writing");

  const missingRoutes: string[] = [];
  for (const r of expectedRoutes) {
    const p = typeof r.path === "string" ? r.path : null;
    if (p && !actualRoutes.includes(p)) missingRoutes.push(p);
  }

  // Role validation: map spec route layout to actual PageShell width usage.
  const roleMismatches: Array<{ route: string; expectedLayout: string; actualWidth: string }> = [];
  for (const r of expectedRoutes) {
    const p = typeof r.path === "string" ? r.path : null;
    const expectedLayout = typeof r.layout === "string" ? r.layout : null;
    if (!p || !expectedLayout) continue;
    const actual = snapshot.routes.find((x) => x.route === p);
    if (!actual) continue;
    const expectedWidth = expectedLayout === "landing" ? "wide" : "content";
    if (actual.pageShellWidth !== "unknown" && actual.pageShellWidth !== expectedWidth) {
      roleMismatches.push({ route: p, expectedLayout, actualWidth: actual.pageShellWidth });
    }
  }

  const iaDiff = {
    generatedAt: new Date().toISOString(),
    expected: { primary: expectedPrimary, secondary: expectedSecondary },
    actual: { primary: actualPrimaryLabels, secondary: actualSecondaryLabels },
    missingPrimary,
    extraPrimary,
    wrongOrder,
    writingIsSecondary,
  };
  const routeValidation = {
    generatedAt: new Date().toISOString(),
    expectedRoutes: expectedRoutes.map((r) => ({
      id: r.id ?? null,
      path: r.path ?? null,
      layout: r.layout ?? null,
    })),
    missingRoutes,
    roleMismatches,
  };

  await writeJsonAtomic(path.join(args.runDir, "ia_diff.json"), iaDiff);
  await writeJsonAtomic(path.join(args.runDir, "route_validation.json"), routeValidation);

  const failures: string[] = [];
  if (missingPrimary.length > 0) failures.push(`missing primary nav items: ${missingPrimary.join(", ")}`);
  if (extraPrimary.length > 0) failures.push(`extra primary nav items: ${extraPrimary.join(", ")}`);
  if (wrongOrder) failures.push("primary nav order mismatch");
  if (!writingIsSecondary) failures.push("Writing is not secondary-only");
  if (missingRoutes.length > 0) failures.push(`missing routes: ${missingRoutes.join(", ")}`);
  if (roleMismatches.length > 0) failures.push(`route role mismatches: ${roleMismatches.map((m) => m.route).join(", ")}`);

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "ia_diff.json", description: "Expected vs actual navigation structure diff.", references: { files: ["lib/site/nav.ts", "contracts/specs/unifyplane.design.spec.json"] } },
      { path: "route_validation.json", description: "Route existence and role validation report.", references: { files: ["app/**/page.tsx", "contracts/specs/unifyplane.design.spec.json"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) {
    throw new Error(`Design audit Phase 3 failed: ${failures[0] ?? "IA non-conformance"}`);
  }

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["ia_diff.json", "route_validation.json", "validation.json", "evidence_index.json", "status.json"],
  });
}

