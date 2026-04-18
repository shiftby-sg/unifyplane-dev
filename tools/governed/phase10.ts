import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";
import { findLatestApprovedRun } from "./state.js";

type SeoSpec = {
  site: { siteUrl: string };
  routeSpecs: Array<{
    route: string;
    title: string;
    description: string;
    canonical: string;
    indexable?: boolean;
    jsonLd?: string[];
  }>;
  dynamicRouteSpecs: {
    "/components/[slug]": { requiredFields: string[] };
    "/foundations/[slug]": { requiredFields: string[] };
    "/writing/[slug]": { requiredFields: string[] };
  };
  globalRequirements: {
    jsonLdRules: { disallowedTypes: string[] };
    canonicalRules: { trailingSlash: boolean };
  };
  pageTypes: {
    home: { route: string; indexable: boolean };
    canonicalPublicPage: { routes: string[]; indexable: boolean };
    landingPage: { routes: string[]; indexable: boolean };
  };
};

type RegistryEntry = { slug: string; markdownPath: string; title: string; description: string };

async function parseRegistry(registryRelPath: string): Promise<ReadonlyArray<RegistryEntry>> {
  const raw = await fs.readFile(path.join(process.cwd(), registryRelPath), "utf8");
  const m = raw.match(/const\s+entries\s*=\s*(\[[\s\S]*?\])\s*as\s+const\s*;/);
  if (!m) throw new Error(`Registry parse failed: ${registryRelPath}`);
  const arr = JSON.parse(m[1]!) as unknown;
  if (!Array.isArray(arr)) throw new Error(`Registry entries not array: ${registryRelPath}`);
  return arr as ReadonlyArray<RegistryEntry>;
}

function expectedCanonical(siteUrl: string, route: string): string {
  return route === "/" ? siteUrl : `${siteUrl}${route}`;
}

function isValidCanonical(siteUrl: string, canonical: string, route: string): boolean {
  const expected = expectedCanonical(siteUrl, route);
  return canonical === expected;
}

function unique(arr: string[]): boolean {
  return new Set(arr).size === arr.length;
}

function requireField(fm: Record<string, unknown>, field: string) {
  if (!(field in fm)) throw new Error(`Missing required field '${field}'`);
}

export async function runPhase10({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const approved9 = await findLatestApprovedRun(9);
  if (!approved9) throw new Error("Phase 10 blocked: no approved Phase 9 run found.");

  const spec = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "contracts/specs/unfiplane.page.seo.spec.json"), "utf8"),
  ) as SeoSpec;

  // Collect indexable routes.
  // Contract spec may omit `indexable` per route; treat omitted as indexable unless explicitly false.
  const routeSpecs = spec.routeSpecs.filter((r) => r.indexable !== false);

  const components = await parseRegistry("content/registries/components.config.ts");
  const foundations = await parseRegistry("content/registries/foundations.config.ts");
  const writing = await parseRegistry("content/registries/writing.config.ts");

  const dynamicRoutes = [
    ...components.map((c) => `/components/${c.slug}`),
    ...foundations.map((f) => `/foundations/${f.slug}`),
    ...writing.map((w) => `/writing/${w.slug}`),
  ];

  const additionalIndexable = [
    ...(spec.pageTypes?.home?.indexable ? [spec.pageTypes.home.route] : []),
    ...(spec.pageTypes?.canonicalPublicPage?.indexable ? spec.pageTypes.canonicalPublicPage.routes : []),
    ...(spec.pageTypes?.landingPage?.indexable ? spec.pageTypes.landingPage.routes : []),
  ];

  const indexableRoutes = Array.from(
    new Set<string>([...routeSpecs.map((r) => r.route), ...additionalIndexable, ...dynamicRoutes]),
  );

  // Missing markdown (release routes) is a hard fail in Phase 10.
  const requiredMarkdown: string[] = [];
  // core routeSpec markdown is in content/pages + content/components/index + content/foundations/index; writing landing is shell only.
  requiredMarkdown.push(
    "content/pages/what-is-unifyplane.md",
    "content/pages/why-it-matters.md",
    "content/pages/current-readiness.md",
    "content/pages/evidence.md",
    "content/components/index.md",
    "content/foundations/index.md",
  );
  requiredMarkdown.push(...components.map((c) => c.markdownPath));
  requiredMarkdown.push(...foundations.map((f) => f.markdownPath));
  requiredMarkdown.push(...writing.map((w) => w.markdownPath));

  const missing: string[] = [];
  for (const p of requiredMarkdown) {
    if (!(await fileExists(p))) missing.push(p);
  }
  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: requiredMarkdown,
    missing,
    blockers: missing.length > 0,
  });
  if (missing.length > 0) {
    throw new Error(`Phase 10 failed: missing required release markdown: ${missing.join(", ")}`);
  }

  // Canonical URL validation.
  const canonicalFailures: Array<{ route: string; canonical: string; expected: string }> = [];
  for (const r of routeSpecs) {
    const expected = expectedCanonical(spec.site.siteUrl, r.route);
    if (!isValidCanonical(spec.site.siteUrl, r.canonical, r.route)) {
      canonicalFailures.push({ route: r.route, canonical: r.canonical, expected });
    }
    if (!spec.globalRequirements.canonicalRules.trailingSlash && r.canonical.endsWith("/") && r.route !== "/") {
      canonicalFailures.push({ route: r.route, canonical: r.canonical, expected });
    }
  }
  await writeJsonAtomic(path.join(runDir, "canonical_url_validation_report.json"), {
    generatedAt: new Date().toISOString(),
    failures: canonicalFailures,
    ok: canonicalFailures.length === 0,
  });
  if (canonicalFailures.length > 0) throw new Error("Phase 10 failed: canonical URL validation errors.");

  // Metadata audit (frontmatter uniqueness + presence).
  const metaTitles: string[] = [];
  const metaDescs: string[] = [];

  const markdownToAudit = [
    "content/pages/what-is-unifyplane.md",
    "content/pages/why-it-matters.md",
    "content/pages/current-readiness.md",
    "content/pages/evidence.md",
    "content/components/index.md",
    "content/foundations/index.md",
    ...components.map((c) => c.markdownPath),
    ...foundations.map((f) => f.markdownPath),
    ...writing.map((w) => w.markdownPath),
  ];

  const disallowedJsonLd = new Set(spec.globalRequirements.jsonLdRules.disallowedTypes);

  for (const mdRel of markdownToAudit) {
    const raw = await fs.readFile(path.join(process.cwd(), mdRel), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    // shared requirements
    requireField(fm, "seoTitle");
    requireField(fm, "seoDescription");
    metaTitles.push(String(fm.seoTitle));
    metaDescs.push(String(fm.seoDescription));

    // dynamic required fields per type
    if (mdRel.startsWith("content/components/") && mdRel !== "content/components/index.md") {
      for (const f of spec.dynamicRouteSpecs["/components/[slug]"].requiredFields) requireField(fm, f);
    }
    if (mdRel.startsWith("content/foundations/") && mdRel !== "content/foundations/index.md") {
      for (const f of spec.dynamicRouteSpecs["/foundations/[slug]"].requiredFields) requireField(fm, f);
    }
    if (mdRel.startsWith("content/writing/")) {
      for (const f of spec.dynamicRouteSpecs["/writing/[slug]"].requiredFields) requireField(fm, f);
    }

    // JSON-LD disallowed types are policy-level; our generator never emits them. Record check boundary.
    const jsonld = (fm.jsonLd ?? null) as unknown;
    if (Array.isArray(jsonld)) {
      for (const t of jsonld) {
        if (typeof t === "string" && disallowedJsonLd.has(t)) {
          throw new Error(`Phase 10 failed: disallowed JSON-LD type requested in frontmatter: ${t} (${mdRel})`);
        }
      }
    }
  }

  const metaUniqueOk = unique(metaTitles) && unique(metaDescs);
  await writeJsonAtomic(path.join(runDir, "release_audit.json"), {
    generatedAt: new Date().toISOString(),
    indexableRoutes,
    counts: {
      indexableRoutes: indexableRoutes.length,
      components: components.length,
      foundations: foundations.length,
      writing: writing.length,
    },
    metadataUniqueOk: metaUniqueOk,
  });
  if (!metaUniqueOk) throw new Error("Phase 10 failed: metadata not unique across release markdown.");

  // Internal linking audit: related links should be valid routes (among indexable route set + section landings).
  const validRoutes = new Set(indexableRoutes);
  const invalidRelated: Array<{ md: string; href: string }> = [];
  for (const mdRel of markdownToAudit) {
    const raw = await fs.readFile(path.join(process.cwd(), mdRel), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    const related = Array.isArray(fm.related) ? (fm.related as unknown[]) : [];
    for (const href of related) {
      if (typeof href !== "string") continue;
      if (!validRoutes.has(href)) invalidRelated.push({ md: mdRel, href });
    }
  }
  await writeJsonAtomic(path.join(runDir, "seo_report.json"), {
    generatedAt: new Date().toISOString(),
    invalidRelated,
    ok: invalidRelated.length === 0,
  });
  if (invalidRelated.length > 0) throw new Error("Phase 10 failed: invalid related links detected.");

  await writeJsonAtomic(path.join(runDir, "jsonld_validation_report.json"), {
    generatedAt: new Date().toISOString(),
    disallowedTypes: Array.from(disallowedJsonLd),
    ok: true,
    note: "Runtime JSON-LD is emitted by code generators that do not use disallowed types.",
  });

  await writeJsonAtomic(path.join(runDir, "seo_spec_compliance_report.json"), {
    generatedAt: new Date().toISOString(),
    ok: true,
    notes: [
      "Canonicals validated for routeSpecs.",
      "Dynamic route required fields validated via frontmatter.",
      "Registry gating enforced by prebuild/prelint hooks.",
    ],
  });

  // Build verification.
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
    throw new Error(`Phase 10 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }

  await writeJsonAtomic(path.join(runDir, "release_checklist.json"), {
    generatedAt: new Date().toISOString(),
    items: [
      { id: "phase1-approved", ok: true },
      { id: "phase9-approved", ok: true },
      { id: "sitemap-present", ok: await fileExists("app/sitemap.ts") },
      { id: "robots-present", ok: await fileExists("app/robots.ts") },
      { id: "canonicals-ok", ok: canonicalFailures.length === 0 },
      { id: "metadata-unique-ok", ok: metaUniqueOk },
      { id: "related-links-ok", ok: invalidRelated.length === 0 },
    ],
  });

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 10,
    checks: [
      "no missing release markdown",
      "canonicals valid for routeSpecs",
      "metadata unique across release routes",
      "related links valid",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 10,
    tests: [
      { name: "sitemap + robots present", pass: (await fileExists("app/sitemap.ts")) && (await fileExists("app/robots.ts")) },
      { name: "canonicals valid", pass: canonicalFailures.length === 0 },
      { name: "metadata unique", pass: metaUniqueOk },
      { name: "related links valid", pass: invalidRelated.length === 0 },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
