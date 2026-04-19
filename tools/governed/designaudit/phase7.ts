import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
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

async function parseComponentRegistry(): Promise<string[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "content/registries/components.config.ts"),
    "utf8",
  );
  const slugs: string[] = [];
  const re = /"slug"\s*:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) slugs.push(m[1]!);
  return slugs;
}

export async function runDesignAuditPhase7(args: Args): Promise<void> {
  const locked = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = locked.spec as any;
  const globalIds: string[] = Array.isArray(spec?.components?.global)
    ? spec.components.global.map((c: any) => c?.id).filter((x: any) => typeof x === "string")
    : [];

  const globalPresence: Record<string, { ok: boolean; file: string | null }> = {};
  const idToFile: Record<string, string> = {
    "site-header": "components/SiteHeader.tsx",
    "site-footer": "components/SiteFooter.tsx",
    "mobile-nav-drawer": "components/MobileNav.tsx",
    breadcrumbs: "components/Breadcrumbs.tsx",
    "side-toc": "components/SideToc.tsx",
    "jump-menu": "components/JumpMenu.tsx",
  };
  for (const id of globalIds) {
    const f = idToFile[id] ?? null;
    globalPresence[id] = { ok: f ? await fileExists(f) : false, file: f };
  }

  const slugs = await parseComponentRegistry();
  const allowed = ["unifyplane-core", "inspect-repo", "agent-runtime"].sort();
  const actual = Array.from(new Set(slugs)).sort();
  const registryOk = JSON.stringify(actual) === JSON.stringify(allowed);

  const report = {
    generatedAt: new Date().toISOString(),
    globalComponents: globalPresence,
    componentsRegistry: { expected: allowed, actual, ok: registryOk },
  };
  await writeJsonAtomic(path.join(args.runDir, "component_audit.json"), report);

  const failures: string[] = [];
  for (const [id, v] of Object.entries(globalPresence)) {
    if (!v.ok) failures.push(`missing global component '${id}' (${v.file ?? "unmapped"})`);
  }
  if (!registryOk) failures.push("components registry slugs do not match allowed set");

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "component_audit.json", description: "Component contract audit.", references: { files: ["components/*.tsx", "content/registries/components.config.ts", "contracts/specs/unifyplane.design.spec.json"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 7 failed: ${failures[0] ?? "component violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["component_audit.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
