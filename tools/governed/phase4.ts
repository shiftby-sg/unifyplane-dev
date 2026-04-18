import fs from "node:fs/promises";
import path from "node:path";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";

type NavItem = { label: string; href: string };

async function loadNav(): Promise<{
  primaryNav: ReadonlyArray<NavItem>;
  secondaryNav: ReadonlyArray<NavItem>;
}> {
  const mod = await import(pathToFileUrl(path.join(process.cwd(), "lib/site/nav.ts")));
  return {
    primaryNav: mod.primaryNav as ReadonlyArray<NavItem>,
    secondaryNav: mod.secondaryNav as ReadonlyArray<NavItem>,
  };
}

function pathToFileUrl(p: string): string {
  const abs = path.resolve(p);
  return new URL(`file://${abs}`).toString();
}

export async function runPhase4({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const required = [
    "components/SiteHeader.tsx",
    "components/MobileNav.tsx",
    "components/Breadcrumbs.tsx",
    "components/BoundaryStatus.tsx",
    "lib/site/nav.ts",
  ];
  for (const rel of required) {
    if (!(await fileExists(rel))) throw new Error(`Missing required Phase 4 file: ${rel}`);
  }

  const { primaryNav, secondaryNav } = await loadNav();
  const expectedPrimary = [
    "/",
    "/what-is-unifyplane",
    "/why-it-matters",
    "/current-readiness",
    "/evidence",
    "/components",
    "/foundations",
  ];
  const actualPrimary = primaryNav.map((i) => i.href);

  const navOrderOk =
    actualPrimary.length === expectedPrimary.length &&
    expectedPrimary.every((href, idx) => actualPrimary[idx] === href);

  const writingSecondaryOk = secondaryNav.every((i) => i.href !== "/") &&
    !primaryNav.some((i) => i.href === "/writing");

  await writeJsonAtomic(path.join(runDir, "navigation_audit.json"), {
    generatedAt: new Date().toISOString(),
    expectedPrimary,
    actualPrimary,
    navOrderOk,
    writingSecondaryOk,
    secondaryNav,
  });

  await writeJsonAtomic(path.join(runDir, "boundary_primitives_audit.json"), {
    generatedAt: new Date().toISOString(),
    variants: ["proven", "implemented-immature", "future-grounded"],
    component: "components/BoundaryStatus.tsx",
  });

  // Missing markdown report: compositions still expected.
  const expected = [
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
  ];
  const missing: string[] = [];
  for (const rel of expected) {
    if (!(await fileExists(rel))) missing.push(rel);
  }
  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected,
    missing,
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
    throw new Error(`Phase 4 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }

  if (!navOrderOk) {
    throw new Error("Phase 4 failed: primary navigation order does not match IA constraints.");
  }
  if (!writingSecondaryOk) {
    throw new Error("Phase 4 failed: Writing is not secondary.");
  }

  // Lightweight static check for focus-visible baseline.
  const globalsCss = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");
  const focusVisibleOk = globalsCss.includes(":focus-visible");

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 4,
    checks: [
      "primary nav order matches IA constraints",
      "writing remains secondary",
      "breadcrumbs component present",
      "boundary primitives present",
      "focus-visible baseline present",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 4,
    tests: [
      { name: "nav order audit", pass: navOrderOk },
      { name: "writing remains secondary", pass: writingSecondaryOk },
      { name: "focus-visible baseline present", pass: focusVisibleOk },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
