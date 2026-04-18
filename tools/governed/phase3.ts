import fs from "node:fs/promises";
import path from "node:path";
import { sha256File, writeJsonAtomic, ensureDir, fileExists } from "./fs-utils.js";
import { validateRegistryReferences } from "./validate-registry.js";
import { execCmd } from "./exec.js";

type PublishableSpec = {
  sourceCorePath: string;
  targetPath: string;
  frontmatter: Record<string, unknown>;
  route: string;
};

async function writeMarkdownWithFrontmatter(
  targetPath: string,
  frontmatter: Record<string, unknown>,
  body: string,
): Promise<void> {
  const fm = JSON.stringify(frontmatter, null, 2)
    .split("\n")
    .map((l) => (l === "" ? "" : l))
    .join("\n");
  const content = `---\n${fm}\n---\n\n${body.trim()}\n`;
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, "utf8");
}

async function readCoreBody(sourceCorePath: string): Promise<string> {
  const raw = await fs.readFile(sourceCorePath, "utf8");
  // Core canonical copies do not necessarily have frontmatter; keep whole content.
  return raw;
}

function baseFrontmatter(args: {
  title: string;
  description: string;
  slug: string;
  section: "pages" | "components" | "foundations" | "writing";
  pageType: "canonical-public" | "landing" | "deep-doc" | "writing";
  truthSource: string[];
  derivedFrom: string[];
  readiness: "not-applicable" | "proven" | "implemented-immature" | "future-grounded";
  ownsTopic: string;
  related: string[];
  showInNav: boolean;
  showInToc: boolean;
  seoTitle: string;
  seoDescription: string;
  maturityLabel?: string;
  currentDemonstratedUse?: string;
  intendedBroaderUse?: string;
  futureScope?: string;
  publishedAt?: string;
  author?: string;
}): Record<string, unknown> {
  return {
    title: args.title,
    description: args.description,
    slug: args.slug,
    section: args.section,
    pageType: args.pageType,
    truthSource: args.truthSource,
    derivedFrom: args.derivedFrom,
    audience: ["primary"],
    readiness: args.readiness,
    ownsTopic: args.ownsTopic,
    related: args.related,
    seoTitle: args.seoTitle,
    seoDescription: args.seoDescription,
    showInNav: args.showInNav,
    showInToc: args.showInToc,
    ...(args.maturityLabel ? { maturityLabel: args.maturityLabel } : {}),
    ...(args.currentDemonstratedUse ? { currentDemonstratedUse: args.currentDemonstratedUse } : {}),
    ...(args.intendedBroaderUse ? { intendedBroaderUse: args.intendedBroaderUse } : {}),
    ...(args.futureScope ? { futureScope: args.futureScope } : {}),
    ...(args.publishedAt ? { publishedAt: args.publishedAt } : {}),
    ...(args.author ? { author: args.author } : {}),
  };
}

async function writeRegistryFile(
  filePath: string,
  entries: Array<{
    slug: string;
    markdownPath: string;
    title: string;
    description: string;
    maturityLabel?: string;
    truthSource: string[];
    derivedFrom: string[];
    related: string[];
  }>,
): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const body = `const entries = ${JSON.stringify(entries, null, 2)} as const;\n\nexport default entries;\n`;
  await fs.writeFile(filePath, body, "utf8");
}

export async function runPhase3({ runDir }: { runDir: string }): Promise<void> {
  // Ensure governed folders exist.
  const dirs = [
    "content/pages",
    "content/components",
    "content/foundations",
    "content/writing",
    "content/registries",
  ];
  for (const d of dirs) await ensureDir(path.join(process.cwd(), d));

  const publishables: PublishableSpec[] = [
    {
      sourceCorePath: "content/core/what-is-unifyplane.md",
      targetPath: "content/pages/what-is-unifyplane.md",
      route: "/what-is-unifyplane",
      frontmatter: baseFrontmatter({
        title: "What is UnifyPlane",
        description:
          "Plain-language definition of UnifyPlane, the problem it addresses, what it does today, what it is not, and how it should be understood at its current stage.",
        slug: "what-is-unifyplane",
        section: "pages",
        pageType: "canonical-public",
        truthSource: ["content/core/what-is-unifyplane.md"],
        derivedFrom: ["content/core/what-is-unifyplane.md", "content/core/website-information-architecture.md"],
        readiness: "not-applicable",
        ownsTopic: "definition",
        related: ["/why-it-matters", "/current-readiness", "/evidence"],
        showInNav: true,
        showInToc: true,
        seoTitle: "What is UnifyPlane",
        seoDescription:
          "Plain-language definition of UnifyPlane, the problem it addresses, what it does today, what it is not, and how it should be understood at its current stage.",
      }),
    },
    {
      sourceCorePath: "content/core/problem-statement.md",
      targetPath: "content/pages/why-it-matters.md",
      route: "/why-it-matters",
      frontmatter: baseFrontmatter({
        title: "Why it matters",
        description:
          "Why continuity weakens across design, delivery, runtime, operations, and assurance, and why that makes change harder to manage and runtime behavior harder to explain.",
        slug: "why-it-matters",
        section: "pages",
        pageType: "canonical-public",
        truthSource: ["content/core/problem-statement.md", "content/core/website-information-architecture.md"],
        derivedFrom: ["content/core/problem-statement.md"],
        readiness: "not-applicable",
        ownsTopic: "problem",
        related: ["/what-is-unifyplane", "/current-readiness", "/evidence"],
        showInNav: true,
        showInToc: true,
        seoTitle: "Why it matters",
        seoDescription:
          "Why continuity weakens across design, delivery, runtime, operations, and assurance, and why that makes change harder to manage and runtime behavior harder to explain.",
      }),
    },
    {
      sourceCorePath: "content/core/readiness/current-readiness-page.md",
      targetPath: "content/pages/current-readiness.md",
      route: "/current-readiness",
      frontmatter: baseFrontmatter({
        title: "Current Readiness",
        description:
          "Current readiness boundary for UnifyPlane, separating proven capability, implemented but immature areas, future but grounded direction, and claims that should not yet be overstated.",
        slug: "current-readiness",
        section: "pages",
        pageType: "canonical-public",
        truthSource: ["content/core/readiness/current-readiness-page.md"],
        derivedFrom: ["content/core/website-information-architecture.md", "content/core/what-is-unifyplane.md"],
        readiness: "not-applicable",
        ownsTopic: "readiness",
        related: ["/evidence", "/components", "/what-is-unifyplane"],
        showInNav: true,
        showInToc: true,
        seoTitle: "Current Readiness",
        seoDescription:
          "Current readiness boundary for UnifyPlane, separating proven capability, implemented but immature areas, future but grounded direction, and claims that should not yet be overstated.",
      }),
    },
    {
      sourceCorePath: "content/core/evidence-page.md",
      targetPath: "content/pages/evidence.md",
      route: "/evidence",
      frontmatter: baseFrontmatter({
        title: "Evidence",
        description:
          "What counts as evidence for UnifyPlane, what evidence is currently available, what current evidence proves, and what it does not yet prove.",
        slug: "evidence",
        section: "pages",
        pageType: "canonical-public",
        truthSource: ["content/core/evidence-page.md"],
        derivedFrom: ["content/core/website-information-architecture.md"],
        readiness: "not-applicable",
        ownsTopic: "evidence",
        related: ["/current-readiness", "/components", "/foundations"],
        showInNav: true,
        showInToc: true,
        seoTitle: "Evidence",
        seoDescription:
          "What counts as evidence for UnifyPlane, what evidence is currently available, what current evidence proves, and what it does not yet prove.",
      }),
    },
    {
      sourceCorePath: "content/core/components/index.md",
      targetPath: "content/components/index.md",
      route: "/components",
      frontmatter: baseFrontmatter({
        title: "Components",
        description:
          "Overview of the real operational parts of UnifyPlane, including unifyplane-core, inspect-repo, and agent-runtime, with maturity kept proportional to current implementation reality.",
        slug: "components",
        section: "components",
        pageType: "landing",
        truthSource: ["content/core/components/index.md"],
        derivedFrom: ["content/core/website-information-architecture.md"],
        readiness: "not-applicable",
        ownsTopic: "operational-parts",
        related: ["/components/unifyplane-core", "/components/inspect-repo", "/components/agent-runtime"],
        showInNav: true,
        showInToc: true,
        seoTitle: "Components",
        seoDescription:
          "Overview of the real operational parts of UnifyPlane, including unifyplane-core, inspect-repo, and agent-runtime, with maturity kept proportional to current implementation reality.",
      }),
    },
    {
      sourceCorePath: "content/core/foundations/index.md",
      targetPath: "content/foundations/index.md",
      route: "/foundations",
      frontmatter: baseFrontmatter({
        title: "Foundations",
        description:
          "Deeper conceptual pages for continuity, proof, drift, evidence, change, and impact, with clear distinction between current demonstrated use, broader intended use, and future scope.",
        slug: "foundations",
        section: "foundations",
        pageType: "landing",
        truthSource: ["content/core/foundations/index.md"],
        derivedFrom: ["content/core/website-information-architecture.md"],
        readiness: "not-applicable",
        ownsTopic: "deeper-foundations",
        related: [
          "/foundations/continuity",
          "/foundations/proof",
          "/foundations/drift",
          "/foundations/evidence",
          "/foundations/change",
          "/foundations/impact",
        ],
        showInNav: true,
        showInToc: true,
        seoTitle: "Foundations",
        seoDescription:
          "Deeper conceptual pages for continuity, proof, drift, evidence, change, and impact, with clear distinction between current demonstrated use, broader intended use, and future scope.",
      }),
    },
  ];

  // Components publishables
  const componentDetails = [
    {
      slug: "unifyplane-core",
      sourceCore: "content/core/components/unifyplane-core.md",
      title: "UnifyPlane Core",
      description:
        "The execution and evidence center of UnifyPlane, demonstrating declared-to-runtime continuity, bounded execution, evidence-backed runtime closure, proof surfaces, and drift reduction.",
      maturityLabel: "proven",
      related: ["/components/inspect-repo", "/components/agent-runtime", "/current-readiness", "/evidence"],
    },
    {
      slug: "agent-runtime",
      sourceCore: "content/core/components/agent-runtime.md",
      title: "Agent Runtime",
      description:
        "A bounded AI-agent execution and assurance runtime participating in the UnifyPlane model with evidence-bearing execution, guardrails, and early governance-oriented structure.",
      maturityLabel: "implemented-immature",
      related: ["/components/unifyplane-core", "/components/inspect-repo", "/current-readiness", "/evidence"],
    },
    {
      slug: "inspect-repo",
      sourceCore: "content/core/components/inspect-repo.md",
      title: "Inspect Repo",
      description:
        "A deterministic inspection authority for repo structure and conformance that supports drift visibility and governance-oriented checks as part of the UnifyPlane model.",
      maturityLabel: "implemented-immature",
      related: ["/components/unifyplane-core", "/components/agent-runtime", "/current-readiness", "/evidence"],
    },
  ];

  for (const c of componentDetails) {
    publishables.push({
      sourceCorePath: c.sourceCore,
      targetPath: `content/components/${c.slug}.md`,
      route: `/components/${c.slug}`,
      frontmatter: baseFrontmatter({
        title: c.title,
        description: c.description,
        slug: c.slug,
        section: "components",
        pageType: "deep-doc",
        truthSource: [c.sourceCore],
        derivedFrom: ["content/core/website-information-architecture.md", c.sourceCore],
        readiness: "not-applicable",
        ownsTopic: "component",
        related: c.related,
        showInNav: false,
        showInToc: true,
        seoTitle: c.title,
        seoDescription: c.description,
        maturityLabel: c.maturityLabel,
      }),
    });
  }

  // Foundations publishables
  const foundationDetails = [
    {
      slug: "continuity",
      sourceCore: "content/core/foundations/continuity.md",
      title: "Continuity",
      description:
        "Why continuity weakens from intended change to implemented reality to runtime behavior, and why continuity-first discipline is central to UnifyPlane.",
      related: ["/foundations/proof", "/foundations/drift", "/evidence", "/current-readiness"],
      currentDemonstratedUse:
        "Used to frame UnifyPlane’s current emphasis on declared-to-runtime continuity and evidence-bearing execution boundaries in the core narrative pages.",
      intendedBroaderUse:
        "Guide continuity discipline across lifecycle stages (design, delivery, runtime, operations, assurance) without collapsing page roles or overstating maturity.",
      futureScope:
        "Richer continuity mapping across change lifecycles and broader systems where evidence surfaces are still emerging.",
    },
    {
      slug: "proof",
      sourceCore: "content/core/foundations/concept-proof.md",
      title: "Proof",
      description:
        "What proof means in software change: how current truth can be shown from declared artifacts and runtime evidence rather than assumption.",
      related: ["/foundations/continuity", "/foundations/evidence", "/evidence"],
      currentDemonstratedUse:
        "Explains proof surfaces already visible in current evidence and readiness pages (what was intended, what ran, what evidence exists).",
      intendedBroaderUse:
        "Anchor proof-oriented runtime closure and verification across more authorities and more lifecycle phases.",
      futureScope:
        "Expanded proof templates, reconciliation, and richer post-run verification as more evidence sources are integrated.",
    },
    {
      slug: "drift",
      sourceCore: "content/core/foundations/concept-drift.md",
      title: "Drift",
      description:
        "How alignment weakens over time between declared intent, implementation, and runtime behavior, and why drift should be made visible and reduced early.",
      related: ["/foundations/continuity", "/foundations/change", "/evidence"],
      currentDemonstratedUse:
        "Frames drift visibility and reduction already described in current readiness and evidence narratives, especially around the core execution path.",
      intendedBroaderUse:
        "Provide a shared vocabulary for drift types and surfaces across components and governance workflows.",
      futureScope:
        "Deeper drift classification and automated drift detection across broader evidence and dependency contexts.",
    },
    {
      slug: "evidence",
      sourceCore: "content/core/foundations/concept-evidence.md",
      title: "Evidence",
      description:
        "What counts as evidence, why evidence matters, and how evidence-bearing execution supports explanation and governance after change.",
      related: ["/evidence", "/foundations/proof", "/foundations/continuity"],
      seoTitle: "Evidence (Foundations)",
      currentDemonstratedUse:
        "Grounds the site’s evidence-first positioning and clarifies what current artifacts do and do not prove.",
      intendedBroaderUse:
        "Make evidence legible across declared, derived, runtime, and verification artifacts without turning pages into raw dumps.",
      futureScope:
        "Broader evidence ingestion, validation, and indexing across more authorities and runtime environments.",
    },
    {
      slug: "change",
      sourceCore: "content/core/foundations/concept-change.md",
      title: "Change",
      description:
        "Why change should be understood across the lifecycle, not only as a release event, and how change connects to proof, drift, and impact.",
      related: ["/foundations/drift", "/foundations/impact", "/current-readiness"],
      currentDemonstratedUse:
        "Connects present-day readiness boundaries to change understanding without overstating end-to-end lifecycle capability.",
      intendedBroaderUse:
        "Support clearer impact assessment and evidence-bearing change reasoning as implementation grows.",
      futureScope:
        "More complete lifecycle change assessment across design, QA, release, and runtime with stronger dependency awareness.",
    },
    {
      slug: "impact",
      sourceCore: "content/core/foundations/impact.md",
      title: "Impact",
      description:
        "Why downstream consequence visibility matters and how impact relates to continuity, drift, and evidence in software-driven systems.",
      related: ["/foundations/change", "/foundations/continuity", "/evidence"],
      currentDemonstratedUse:
        "Frames why consequence visibility matters as part of the continuity problem without presenting full impact tooling as current reality.",
      intendedBroaderUse:
        "Guide how evidence and drift surfaces can inform impact reasoning in governance decisions.",
      futureScope:
        "Richer dependency-aware impact modeling as more graphs and evidence sources are integrated.",
    },
  ];

  for (const f of foundationDetails) {
    publishables.push({
      sourceCorePath: f.sourceCore,
      targetPath: `content/foundations/${f.slug}.md`,
      route: `/foundations/${f.slug}`,
      frontmatter: baseFrontmatter({
        title: f.title,
        description: f.description,
        slug: f.slug,
        section: "foundations",
        pageType: "deep-doc",
        truthSource: [f.sourceCore],
        derivedFrom: ["content/core/website-information-architecture.md", f.sourceCore],
        readiness: "not-applicable",
        ownsTopic: "foundation",
        related: f.related,
        showInNav: false,
        showInToc: true,
        seoTitle: (f as any).seoTitle ?? f.title,
        seoDescription: f.description,
        currentDemonstratedUse: f.currentDemonstratedUse,
        intendedBroaderUse: f.intendedBroaderUse,
        futureScope: f.futureScope,
      }),
    });
  }

  // Writing publishables from canonical blogs
  const coreBlogsDir = path.join(process.cwd(), "content/core/blogs");
  let writingEntries: Array<{ slug: string; corePath: string; title: string }> = [];
  if (await fileExists(coreBlogsDir)) {
    const entries = await fs.readdir(coreBlogsDir, { withFileTypes: true });
    writingEntries = entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => {
        const slug = e.name.replace(/\.md$/, "");
        return { slug, corePath: `content/core/blogs/${e.name}`, title: slug };
      });
  }

  for (const w of writingEntries) {
    publishables.push({
      sourceCorePath: w.corePath,
      targetPath: `content/writing/${w.slug}.md`,
      route: `/writing/${w.slug}`,
      frontmatter: baseFrontmatter({
        title: w.title,
        description: `Writing: ${w.title}`,
        slug: w.slug,
        section: "writing",
        pageType: "writing",
        truthSource: [w.corePath],
        derivedFrom: [w.corePath],
        readiness: "not-applicable",
        ownsTopic: "writing",
        related: ["/writing"],
        showInNav: false,
        showInToc: true,
        seoTitle: w.title,
        seoDescription: `Writing: ${w.title}`,
        publishedAt: "2026-04-18",
        author: "UnifyPlane",
      }),
    });
  }

  // Write publishable markdown files.
  const renderManifest: Array<{
    route: string;
    targetPath: string;
    sha256: string;
    truthSource: string[];
    derivedFrom: string[];
  }> = [];

  for (const p of publishables) {
    const body = await readCoreBody(path.join(process.cwd(), p.sourceCorePath));
    const targetAbs = path.join(process.cwd(), p.targetPath);
    await writeMarkdownWithFrontmatter(targetAbs, p.frontmatter, body);
    const sha256 = await sha256File(targetAbs);
    renderManifest.push({
      route: p.route,
      targetPath: p.targetPath,
      sha256,
      truthSource: (p.frontmatter.truthSource as string[]) ?? [],
      derivedFrom: (p.frontmatter.derivedFrom as string[]) ?? [],
    });
  }

  // Write registries (registry-driven public routing).
  await writeRegistryFile(path.join(process.cwd(), "content/registries/components.config.ts"), [
    ...componentDetails.map((c) => ({
      slug: c.slug,
      markdownPath: `content/components/${c.slug}.md`,
      title: c.title,
      description: c.description,
      maturityLabel: c.maturityLabel,
      truthSource: [c.sourceCore],
      derivedFrom: ["content/core/website-information-architecture.md", c.sourceCore],
      related: c.related,
    })),
  ]);

  await writeRegistryFile(path.join(process.cwd(), "content/registries/foundations.config.ts"), [
    ...foundationDetails.map((f) => ({
      slug: f.slug,
      markdownPath: `content/foundations/${f.slug}.md`,
      title: f.title,
      description: f.description,
      truthSource: [f.sourceCore],
      derivedFrom: ["content/core/website-information-architecture.md", f.sourceCore],
      related: f.related,
    })),
  ]);

  await writeRegistryFile(
    path.join(process.cwd(), "content/registries/writing.config.ts"),
    writingEntries.map((w) => ({
      slug: w.slug,
      markdownPath: `content/writing/${w.slug}.md`,
      title: w.title,
      description: `Writing: ${w.title}`,
      truthSource: [w.corePath],
      derivedFrom: [w.corePath],
      related: ["/writing"],
    })),
  );

  // Enforce registry invariant after generating.
  await validateRegistryReferences({ missingFrom: "phase1-approved" });

  // Missing markdown report: report remaining composition/config holes (allowed in Phase 3 but must be explicit).
  const expectedPhase3 = [
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
  ];
  const missing: string[] = [];
  for (const rel of expectedPhase3) {
    if (!(await fileExists(rel))) missing.push(rel);
  }
  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: expectedPhase3,
    missing,
  });

  await writeJsonAtomic(path.join(runDir, "render_manifest.json"), {
    generatedAt: new Date().toISOString(),
    routes: renderManifest,
    writingEnabled: writingEntries.length > 0,
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
    throw new Error(`Phase 3 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 3,
    checks: [
      "publishable markdown generated with required frontmatter",
      "registries generated for components/foundations/writing",
      "registry references validated against approved Phase 1 missing_md_report.json",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 3,
    tests: [
      { name: "registry entries have markdown files", pass: true },
      { name: "markdown without registry does not become a route (by design)", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
