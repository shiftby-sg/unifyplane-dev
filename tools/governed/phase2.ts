import fs from "node:fs/promises";
import path from "node:path";
import { fileExists, writeJsonAtomic } from "./fs-utils.js";
import { execCmd } from "./exec.js";
import { validateRegistryReferences } from "./validate-registry.js";

async function mustExist(p: string): Promise<void> {
  if (!(await fileExists(p))) {
    throw new Error(`Required path missing: ${p}`);
  }
}

export async function runPhase2({ runDir }: { runDir: string }): Promise<void> {
  // Contract authorities must exist.
  await mustExist("contracts/specs/unfiplane.page.seo.spec.json");
  await mustExist("contracts/specs/unifyplane.design.spec.json");
  await mustExist("contracts/specs/unifyplane.design.spec.md");

  // Registry invariant: if any registry points to missing markdown not predeclared in Phase 1 missing report → fail.
  await validateRegistryReferences({ missingFrom: "phase1-approved" });

  // Missing markdown report for this phase: report current missing publishables (non-blocking for Phase 2).
  const phase2Expected = [
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
    "content/registries/components.config.ts",
    "content/registries/foundations.config.ts",
    "content/registries/writing.config.ts",
  ];

  const missing: string[] = [];
  for (const rel of phase2Expected) {
    if (!(await fileExists(rel))) missing.push(rel);
  }

  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: phase2Expected,
    missing,
    note: "Phase 2 does not require publishable markdown to exist unless route shells depend on it.",
  });

  // Validate build + lint (fail closed).
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

  const ok = lint.exitCode === 0 && build.exitCode === 0;
  if (!ok) {
    throw new Error(
      `Phase 2 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`,
    );
  }

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 2,
    checks: [
      "contract specs present",
      "registry references validated against approved Phase 1 missing_md_report.json",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 2,
    tests: [
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}

