import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";

type SeoSpec = {
  site: { siteUrl: string };
  routeSpecs: Array<{
    route: string;
    title: string;
    description: string;
    canonical: string;
    mustLinkTo?: string[];
    jsonLd?: string[];
  }>;
};

type CorePage = {
  route: string;
  mdPath: string;
};

function requireString(x: unknown, name: string): string {
  if (typeof x !== "string" || x.trim().length === 0) {
    throw new Error(`Frontmatter missing/invalid: ${name}`);
  }
  return x;
}

function requireStringArray(x: unknown, name: string): string[] {
  if (!Array.isArray(x) || x.some((v) => typeof v !== "string" || v.trim().length === 0)) {
    throw new Error(`Frontmatter missing/invalid: ${name}`);
  }
  return x as string[];
}

export async function runPhase6({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const pages: CorePage[] = [
    { route: "/what-is-unifyplane", mdPath: "content/pages/what-is-unifyplane.md" },
    { route: "/why-it-matters", mdPath: "content/pages/why-it-matters.md" },
    { route: "/current-readiness", mdPath: "content/pages/current-readiness.md" },
    { route: "/evidence", mdPath: "content/pages/evidence.md" },
  ];

  const missingBlockers: string[] = [];
  for (const p of pages) {
    if (!(await fileExists(p.mdPath))) missingBlockers.push(p.mdPath);
  }
  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: pages.map((p) => p.mdPath),
    missing: missingBlockers,
    blockers: missingBlockers.length > 0,
  });
  if (missingBlockers.length > 0) {
    throw new Error(`Phase 6 blocked: missing core narrative markdown: ${missingBlockers.join(", ")}`);
  }

  const seoSpec = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "contracts/specs/unfiplane.page.seo.spec.json"), "utf8"),
  ) as SeoSpec;

  const metaByRoute: Record<
    string,
    { seoTitle: string; seoDescription: string; ownsTopic: string; related: string[]; slug: string; pageType: string }
  > = {};

  for (const p of pages) {
    const raw = await fs.readFile(path.join(process.cwd(), p.mdPath), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    const seoTitle = requireString(fm.seoTitle, "seoTitle");
    const seoDescription = requireString(fm.seoDescription, "seoDescription");
    const ownsTopic = requireString(fm.ownsTopic, "ownsTopic");
    const related = requireStringArray(fm.related, "related");
    const slug = requireString(fm.slug, "slug");
    const pageType = requireString(fm.pageType, "pageType");

    // Core required fields (fail closed).
    requireString(fm.title, "title");
    requireString(fm.description, "description");
    requireStringArray(fm.truthSource, "truthSource");
    requireStringArray(fm.derivedFrom, "derivedFrom");

    metaByRoute[p.route] = { seoTitle, seoDescription, ownsTopic, related, slug, pageType };

    // Contract alignment: routeSpecs title/description/canonical must match.
    const spec = seoSpec.routeSpecs.find((r) => r.route === p.route);
    if (!spec) throw new Error(`SEO spec missing routeSpec for ${p.route}`);
    const expectedCanonical = `${seoSpec.site.siteUrl}${p.route}`;
    if (spec.canonical !== expectedCanonical) {
      throw new Error(`SEO spec canonical mismatch for ${p.route}: ${spec.canonical} != ${expectedCanonical}`);
    }
    if (spec.title !== seoTitle) {
      throw new Error(`seoTitle mismatch vs SEO spec for ${p.route}: '${seoTitle}' != '${spec.title}'`);
    }
    if (spec.description !== seoDescription) {
      throw new Error(`seoDescription mismatch vs SEO spec for ${p.route}`);
    }

    // Must-link-to satisfied via related footer contract.
    const mustLinkTo = spec.mustLinkTo ?? [];
    for (const href of mustLinkTo) {
      if (!related.includes(href)) {
        throw new Error(`Missing mustLinkTo '${href}' in frontmatter.related for ${p.route}`);
      }
    }
  }

  const titles = pages.map((p) => metaByRoute[p.route]!.seoTitle);
  const descs = pages.map((p) => metaByRoute[p.route]!.seoDescription);
  const ownsTopics = pages.map((p) => metaByRoute[p.route]!.ownsTopic);

  const unique = (arr: string[]) => new Set(arr).size === arr.length;
  const roleOk = unique(ownsTopics);
  const metaUniqueOk = unique(titles) && unique(descs);

  await writeJsonAtomic(path.join(runDir, "page_role_audit.json"), {
    generatedAt: new Date().toISOString(),
    ownsTopics,
    roleOk,
    byRoute: metaByRoute,
  });

  await writeJsonAtomic(path.join(runDir, "metadata_audit.json"), {
    generatedAt: new Date().toISOString(),
    titleUnique: unique(titles),
    descriptionUnique: unique(descs),
    metaUniqueOk,
    titles,
    descriptions: descs,
  });

  await writeJsonAtomic(path.join(runDir, "jsonld_audit.json"), {
    generatedAt: new Date().toISOString(),
    expectedPageJsonLdType: "TechArticle",
    expectedBreadcrumbs: true,
    note: "Runtime JSON-LD is emitted by page components; this audit validates spec intent and related-link coverage.",
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
    throw new Error(`Phase 6 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }
  if (!roleOk) throw new Error("Phase 6 failed: core page roles are not distinct (ownsTopic not unique).");
  if (!metaUniqueOk) throw new Error("Phase 6 failed: metadata not unique across core pages.");

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 6,
    checks: [
      "core pages exist and parse",
      "core page roles distinct (ownsTopic unique)",
      "metadata unique across core pages",
      "SEO spec alignment for title/description/canonical",
      "related links satisfy mustLinkTo",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 6,
    tests: [
      { name: "page role separation audit", pass: true },
      { name: "metadata uniqueness audit", pass: true },
      { name: "mustLinkTo coverage via related footer", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
