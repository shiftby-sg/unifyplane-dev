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
};

type SeoSpec = {
  dynamicRouteSpecs: {
    "/foundations/[slug]": { requiredFields: string[] };
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

async function loadFoundationsRegistry(): Promise<ReadonlyArray<RegistryEntry>> {
  const raw = await fs.readFile(path.join(process.cwd(), "content/registries/foundations.config.ts"), "utf8");
  const m = raw.match(/const\s+entries\s*=\s*(\[[\s\S]*?\])\s*as\s+const\s*;/);
  if (!m) throw new Error("foundations registry parse failed");
  return JSON.parse(m[1]!) as ReadonlyArray<RegistryEntry>;
}

export async function runPhase8({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const requiredMarkdown = [
    "content/foundations/index.md",
    "content/foundations/continuity.md",
    "content/foundations/proof.md",
    "content/foundations/drift.md",
    "content/foundations/evidence.md",
    "content/foundations/change.md",
    "content/foundations/impact.md",
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
    throw new Error(`Phase 8 blocked: missing foundation markdown: ${missingBlockers.join(", ")}`);
  }

  const seoSpec = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "contracts/specs/unfiplane.page.seo.spec.json"), "utf8"),
  ) as SeoSpec;
  const requiredFields = new Set(seoSpec.dynamicRouteSpecs["/foundations/[slug]"].requiredFields);

  const registry = await loadFoundationsRegistry();
  const slugs = registry.map((e) => e.slug);
  const requiredSlugs = ["continuity", "proof", "drift", "evidence", "change", "impact"];
  for (const s of requiredSlugs) {
    if (!slugs.includes(s)) throw new Error(`Phase 8 failed: missing required foundation slug in registry: ${s}`);
  }

  const frontmatterAudit: Array<{ slug: string; ok: boolean; missingFields: string[] }> = [];
  for (const entry of registry) {
    const mdAbs = path.join(process.cwd(), entry.markdownPath);
    if (!(await fileExists(mdAbs))) throw new Error(`Registry markdown missing: ${entry.markdownPath}`);
    const raw = await fs.readFile(mdAbs, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;

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
      throw new Error(`Phase 8 failed: ${entry.markdownPath} missing required fields: ${missingFields.join(", ")}`);
    }
  }

  // Continuity-centrality audit: foundations index should mention continuity as central.
  const idxRaw = await fs.readFile(path.join(process.cwd(), "content/foundations/index.md"), "utf8");
  const continuityCentralOk = idxRaw.toLowerCase().includes("continuity") && idxRaw.toLowerCase().includes("central");

  await writeJsonAtomic(path.join(runDir, "foundations_audit.json"), {
    generatedAt: new Date().toISOString(),
    registryCount: registry.length,
    requiredSlugs,
    frontmatterAudit,
    continuityCentralOk,
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
    throw new Error(`Phase 8 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }
  if (!continuityCentralOk) {
    throw new Error("Phase 8 failed: continuity-centrality not detected in foundations index.");
  }

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 8,
    checks: [
      "foundations landing and detail markdown present",
      "registry slugs complete for required foundations",
      "foundation frontmatter meets dynamicRouteSpecs requiredFields",
      "continuity-centrality present in foundations index",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 8,
    tests: [
      { name: "foundations registry+markdown audit", pass: true },
      { name: "continuity centrality audit", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
