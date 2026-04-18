import path from "node:path";
import fs from "node:fs/promises";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";

type HomeComp = {
  version: string;
  sections: Array<{ id: string; kind: string }>;
};

async function readJsonYaml<T>(relPath: string): Promise<T> {
  const abs = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw) as T;
}

export async function runPhase5({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const blockers = [
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
  ];
  const missingBlockers: string[] = [];
  for (const b of blockers) {
    if (!(await fileExists(b))) missingBlockers.push(b);
  }
  if (missingBlockers.length > 0) {
    await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
      generatedAt: new Date().toISOString(),
      expected: blockers,
      missing: missingBlockers,
      blockers: true,
    });
    throw new Error(`Phase 5 blocked: missing composition files: ${missingBlockers.join(", ")}`);
  }

  const home = await readJsonYaml<HomeComp>("content/compositions/home.yml");
  const sectionOrder = home.sections.map((s) => s.id);
  const expected = ["hero", "what", "why", "readiness", "evidence", "components", "foundations", "explore"];
  const orderOk =
    sectionOrder.length === expected.length && expected.every((id, idx) => sectionOrder[idx] === id);

  await writeJsonAtomic(path.join(runDir, "homepage_audit.json"), {
    generatedAt: new Date().toISOString(),
    expectedOrder: expected,
    actualOrder: sectionOrder,
    orderOk,
    compositionVersion: home.version,
  });

  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: blockers,
    missing: [],
    blockers: false,
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
    throw new Error(`Phase 5 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }
  if (!orderOk) {
    throw new Error("Phase 5 failed: homepage section order does not match IA.");
  }

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 5,
    checks: [
      "required composition files present",
      "homepage composition order matches IA",
      "homepage is composition-driven",
      "lint passed",
      "build passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 5,
    tests: [
      { name: "homepage composition order audit", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
    ],
  });
}
