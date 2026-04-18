import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";

type RegistryEntry = {
  slug: string;
  markdownPath: string;
  title: string;
  description: string;
  maturityLabel?: string;
};

type SeoSpec = {
  dynamicRouteSpecs: {
    "/components/[slug]": { requiredFields: string[] };
  };
};

function requireString(x: unknown, name: string): string {
  if (typeof x !== "string" || x.trim().length === 0) throw new Error(`Frontmatter missing/invalid: ${name}`);
  return x;
}

function requireStringArray(x: unknown, name: string): string[] {
  if (!Array.isArray(x) || x.some((v) => typeof v !== "string" || v.trim().length === 0)) {
    throw new Error(`Frontmatter missing/invalid: ${name}`);
  }
  return x as string[];
}

async function loadComponentsRegistry(): Promise<ReadonlyArray<RegistryEntry>> {
  const raw = await fs.readFile(path.join(process.cwd(), "content/registries/components.config.ts"), "utf8");
  const m = raw.match(/const\s+entries\s*=\s*(\[[\s\S]*?\])\s*as\s+const\s*;/);
  if (!m) throw new Error("components registry parse failed");
  return JSON.parse(m[1]!) as ReadonlyArray<RegistryEntry>;
}

export async function runPhase7({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const requiredMarkdown = [
    "content/components/index.md",
    "content/components/unifyplane-core.md",
    "content/components/agent-runtime.md",
    "content/components/inspect-repo.md",
  ];
  const missingBlockers: string[] = [];
  for (const rel of requiredMarkdown) {
    if (!(await fileExists(rel))) missingBlockers.push(rel);
  }
  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: requiredMarkdown,
    missing: missingBlockers,
    blockers: missingBlockers.length > 0,
  });
  if (missingBlockers.length > 0) {
    throw new Error(`Phase 7 blocked: missing component markdown: ${missingBlockers.join(", ")}`);
  }

  const seoSpec = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "contracts/specs/unfiplane.page.seo.spec.json"), "utf8"),
  ) as SeoSpec;
  const requiredFields = new Set(seoSpec.dynamicRouteSpecs["/components/[slug]"].requiredFields);

  const registry = await loadComponentsRegistry();
  const slugs = registry.map((e) => e.slug);
  const requiredSlugs = ["unifyplane-core", "agent-runtime", "inspect-repo"];
  for (const s of requiredSlugs) {
    if (!slugs.includes(s)) throw new Error(`Phase 7 failed: missing required component slug in registry: ${s}`);
  }

  const maturityOk =
    registry.find((e) => e.slug === "unifyplane-core")?.maturityLabel === "proven" &&
    registry.find((e) => e.slug === "agent-runtime")?.maturityLabel === "implemented-immature" &&
    registry.find((e) => e.slug === "inspect-repo")?.maturityLabel === "implemented-immature";

  const frontmatterAudit: Array<{ slug: string; ok: boolean; missingFields: string[] }> = [];
  for (const entry of registry) {
    const mdAbs = path.join(process.cwd(), entry.markdownPath);
    if (!(await fileExists(mdAbs))) throw new Error(`Registry markdown missing: ${entry.markdownPath}`);
    const raw = await fs.readFile(mdAbs, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;

    // required frontmatter checks
    requireString(fm.slug, "slug");
    requireString(fm.title, "title");
    requireString(fm.description, "description");
    requireStringArray(fm.truthSource, "truthSource");
    requireStringArray(fm.derivedFrom, "derivedFrom");
    requireStringArray(fm.related, "related");

    const missingFields: string[] = [];
    for (const f of requiredFields) {
      if (!(f in fm)) missingFields.push(f);
    }
    frontmatterAudit.push({ slug: entry.slug, ok: missingFields.length === 0, missingFields });
    if (missingFields.length > 0) {
      throw new Error(`Phase 7 failed: ${entry.markdownPath} missing required fields: ${missingFields.join(", ")}`);
    }
  }

  await writeJsonAtomic(path.join(runDir, "components_audit.json"), {
    generatedAt: new Date().toISOString(),
    registryCount: registry.length,
    requiredSlugs,
    maturityOk,
    frontmatterAudit,
  });

  // Build verification (fail-closed).
  const lint = await execCmd("pnpm", ["lint"], { cwd: process.cwd() });
  const build = await execCmd("pnpm", ["build"], { cwd: process.cwd() });

  await writeJsonAtomic(path.join(runDir, "build_report.json"), {
    generatedAt: new Date().toISOString(),
    lint: {
      command: lint.command,
      exitCode: lint.exitCode,
      durationMs: lint.durationMs,
      stdout: lint.stdout,
      stderr: lint.stderr,
    },
    build: {
      command: build.command,
      exitCode: build.exitCode,
      durationMs: build.durationMs,
      stdout: build.stdout,
      stderr: build.stderr,
    },
  });

  if (lint.exitCode !== 0 || build.exitCode !== 0) {
    throw new Error(`Phase 7 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }
  if (!maturityOk) throw new Error("Phase 7 failed: component maturity boundaries not as expected.");

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 7,
    checks: [
      "component landing and detail markdown present",
      "registry slugs complete for required components",
      "component maturity boundaries enforced",
      "component frontmatter meets dynamicRouteSpecs requiredFields",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 7,
    tests: [
      { name: "components registry+markdown audit", pass: true },
      { name: "maturity boundary audit", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
