import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function fileExists(rel: string): Promise<boolean> {
  try {
    await fs.stat(path.join(process.cwd(), rel));
    return true;
  } catch {
    return false;
  }
}

async function parseComponentRegistrySlugs(): Promise<string[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "content/registries/components.config.ts"),
    "utf8",
  );
  const slugs: string[] = [];
  const re = /"slug"\s*:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) slugs.push(m[1]!);
  return Array.from(new Set(slugs)).sort();
}

export async function runImplementationPhase5(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = lockedDesign.spec as any;

  const allowed: string[] = Array.isArray(spec?.contentRules?.componentsPage?.mustIncludeOnly)
    ? spec.contentRules.componentsPage.mustIncludeOnly.slice().sort()
    : ["unifyplane-core", "inspect-repo", "agent-runtime"].sort();

  const actual = await parseComponentRegistrySlugs();
  const registryOk = JSON.stringify(actual) === JSON.stringify(allowed);

  const globalChecks: Record<string, { file: string; present: boolean }> = {
    "site-header": { file: "components/SiteHeader.tsx", present: await fileExists("components/SiteHeader.tsx") },
    "site-footer": { file: "components/SiteFooter.tsx", present: await fileExists("components/SiteFooter.tsx") },
    "mobile-nav-drawer": { file: "components/MobileNav.tsx", present: await fileExists("components/MobileNav.tsx") },
    breadcrumbs: { file: "components/Breadcrumbs.tsx", present: await fileExists("components/Breadcrumbs.tsx") },
    "side-toc": { file: "components/SideToc.tsx", present: await fileExists("components/SideToc.tsx") },
    "jump-menu": { file: "components/JumpMenu.tsx", present: await fileExists("components/JumpMenu.tsx") },
  };

  const componentRegistry = {
    generatedAt: new Date().toISOString(),
    expected: allowed,
    actual,
    ok: registryOk,
  };

  const componentValidationReport = {
    generatedAt: new Date().toISOString(),
    globalComponents: globalChecks,
    registry: componentRegistry,
  };

  await writeJsonAtomic(path.join(args.runDir, "component_registry.json"), componentRegistry);
  await writeJsonAtomic(path.join(args.runDir, "component_validation_report.json"), componentValidationReport);

  const failures: string[] = [];
  for (const [id, v] of Object.entries(globalChecks)) {
    if (!v.present) failures.push(`missing global component '${id}' (${v.file})`);
  }
  if (!registryOk) failures.push("components registry slugs do not match allowed set");

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "globals_present", ok: failures.filter((f) => f.startsWith("missing global component")).length === 0, detail: "required global component files exist" },
    { id: "registry_allowed", ok: registryOk, detail: `expected=${allowed.join(",")} actual=${actual.join(",")}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "component_registry.json", description: "Component registry snapshot (expected vs actual).", references: { files: ["design_spec.lock.json", "content/registries/components.config.ts"] } },
      { path: "component_validation_report.json", description: "Component validation report.", references: { files: ["components/*.tsx", "content/registries/components.config.ts"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 5 failed: ${failures[0] ?? "component violations"}`);

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
      "component_registry.json",
      "component_validation_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

