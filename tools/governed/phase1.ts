import fs from "node:fs/promises";
import path from "node:path";
import { DOCS_CANONICAL_ROOT } from "./paths.js";
import { ensureDir, fileExists, sha256File, writeJsonAtomic } from "./fs-utils.js";

type CanonicalFile = {
  path: string; // repo-relative
  sha256: string;
};

async function walkFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(root, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(p)));
    } else if (e.isFile()) {
      out.push(p);
    }
  }
  return out.sort();
}

function toRepoRelative(absPath: string): string {
  const rel = path.relative(process.cwd(), absPath);
  return rel.split(path.sep).join("/");
}

function toCoreTargetFromCanonicalAbs(absCanonical: string): string {
  const relFromCanonicalRoot = path.relative(DOCS_CANONICAL_ROOT, absCanonical);
  const rel = relFromCanonicalRoot.split(path.sep).join("/");
  return `content/core/${rel}`;
}

async function copyFileEnsuringDir(srcAbs: string, destAbs: string): Promise<void> {
  await ensureDir(path.dirname(destAbs));
  await fs.copyFile(srcAbs, destAbs);
}

export async function runPhase1({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  // 1) Discover canonical inputs (repo scan is the only source of canonical-path resolution).
  const canonicalFilesAbs = await walkFiles(DOCS_CANONICAL_ROOT);
  const canonicalFiles: CanonicalFile[] = [];
  for (const abs of canonicalFilesAbs) {
    canonicalFiles.push({ path: toRepoRelative(abs), sha256: await sha256File(abs) });
  }

  const canonicalInventory = {
    generatedAt: new Date().toISOString(),
    root: "docs/canonical",
    files: canonicalFiles,
  };

  await writeJsonAtomic(
    path.join(runDir, "canonical_inventory.json"),
    canonicalInventory,
  );
  await writeJsonAtomic(
    path.join(runDir, "canonical_doc_registry.json"),
    canonicalInventory,
  );

  // 2) Create governed content structure + copy canonical docs into content/core (repo-local truth boundary).
  const contentDirs = [
    "content/core",
    "content/pages",
    "content/components",
    "content/foundations",
    "content/writing",
    "content/compositions",
    "content/registries",
  ];
  for (const d of contentDirs) {
    await ensureDir(path.join(process.cwd(), d));
  }

  const copyRecords: Array<{
    source: string;
    target: string;
    sourceSha256: string;
    targetSha256: string;
    ok: boolean;
    kind: "direct-copy" | "alias-copy";
  }> = [];

  for (const abs of canonicalFilesAbs) {
    const sourceRel = toRepoRelative(abs);
    const targetRel = toCoreTargetFromCanonicalAbs(abs);
    const targetAbs = path.join(process.cwd(), targetRel);
    await copyFileEnsuringDir(abs, targetAbs);
    const sourceSha256 = await sha256File(abs);
    const targetSha256 = await sha256File(targetAbs);
    copyRecords.push({
      source: sourceRel,
      target: targetRel,
      sourceSha256,
      targetSha256,
      ok: sourceSha256 === targetSha256,
      kind: "direct-copy",
    });
  }

  // 3) Required normalized alias copies (byte-identical) with explicit tracing.
  const requiredAliases: Array<{
    aliasTarget: string;
    canonicalSource: string;
    rationale: string;
  }> = [
    {
      aliasTarget: "content/core/website-information-architecture.md",
      canonicalSource: "docs/canonical/website-information-architecture.v2.md",
      rationale: "Normalized IA canonical filename for stable truthSource references.",
    },
    {
      aliasTarget: "content/core/problem-statement.md",
      canonicalSource: "docs/canonical/why-unfiyplane-matters.md",
      rationale: "Canonical problem narrative source normalized for downstream mapping.",
    },
    {
      aliasTarget: "content/core/why-unifyplane-exists.md",
      canonicalSource: "docs/canonical/why-unfiyplane-matters.md",
      rationale: "Legacy/contract compatibility alias; byte-identical to canonical problem narrative.",
    },
  ];

  const truthAliasRegistry: Array<{
    aliasTarget: string;
    canonicalSource: string;
    rationale: string;
    sourceSha256: string;
    targetSha256: string;
    ok: boolean;
  }> = [];

  for (const a of requiredAliases) {
    const srcAbs = path.join(process.cwd(), a.canonicalSource);
    const destAbs = path.join(process.cwd(), a.aliasTarget);
    if (!(await fileExists(srcAbs))) {
      throw new Error(`Required canonical source missing for alias: ${a.canonicalSource}`);
    }
    await copyFileEnsuringDir(srcAbs, destAbs);
    const sourceSha256 = await sha256File(srcAbs);
    const targetSha256 = await sha256File(destAbs);
    const ok = sourceSha256 === targetSha256;
    truthAliasRegistry.push({
      aliasTarget: a.aliasTarget,
      canonicalSource: a.canonicalSource,
      rationale: a.rationale,
      sourceSha256,
      targetSha256,
      ok,
    });
    copyRecords.push({
      source: a.canonicalSource,
      target: a.aliasTarget,
      sourceSha256,
      targetSha256,
      ok,
      kind: "alias-copy",
    });
  }

  await writeJsonAtomic(path.join(runDir, "canonical_copy_report.json"), {
    generatedAt: new Date().toISOString(),
    records: copyRecords,
    ok: copyRecords.every((r) => r.ok),
  });

  await writeJsonAtomic(path.join(runDir, "truth_alias_registry.json"), {
    generatedAt: new Date().toISOString(),
    aliases: truthAliasRegistry,
    ok: truthAliasRegistry.every((a) => a.ok),
  });

  // 2) Missing publishable markdown inventory (Phase 1: report only; do not create content yet).
  // Keep this list aligned to docs/plans/unifyplane-website-implementation-plan.json phase1 missing expectations.
  const expectedPublishable = [
    "content/pages/current-readiness.md",
    "content/pages/evidence.md",
    "content/pages/what-is-unifyplane.md",
    "content/pages/why-it-matters.md",
    "content/components/index.md",
    "content/components/unifyplane-core.md",
    "content/components/agent-runtime.md",
    "content/components/inspect-repo.md",
    "content/foundations/index.md",
    "content/foundations/continuity.md",
    "content/foundations/proof.md",
    "content/foundations/drift.md",
    "content/foundations/evidence.md",
    "content/foundations/change.md",
    "content/foundations/impact.md",
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
    "content/registries/components.config.ts",
    "content/registries/foundations.config.ts",
    "content/registries/writing.config.ts",
  ];

  const missing: string[] = [];
  for (const p of expectedPublishable) {
    try {
      await fs.stat(path.join(process.cwd(), p));
    } catch {
      missing.push(p);
    }
  }

  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: expectedPublishable,
    missing,
  });

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: copyRecords.every((r) => r.ok) && truthAliasRegistry.every((a) => a.ok),
    phase: 1,
    checks: [
      "canonical inventory discovered by repo scan",
      "canonical inventory written to evidence",
      "canonical docs copied into content/core",
      "required canonical aliases created and traced",
      "missing publishable inventory reported",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: copyRecords.every((r) => r.ok) && truthAliasRegistry.every((a) => a.ok),
    phase: 1,
    tests: [
      {
        name: "all canonical files discoverable under docs/canonical",
        pass: canonicalFiles.length > 0,
        details: { count: canonicalFiles.length },
      },
      {
        name: "canonical copies match source content (sha256)",
        pass: copyRecords.every((r) => r.ok),
        details: { total: copyRecords.length, failed: copyRecords.filter((r) => !r.ok).length },
      },
      {
        name: "alias copies traced and byte-identical",
        pass: truthAliasRegistry.every((a) => a.ok),
        details: {
          total: truthAliasRegistry.length,
          failed: truthAliasRegistry.filter((a) => !a.ok).length,
        },
      },
      {
        name: "missing publishable markdown reported",
        pass: true,
        details: { missingCount: missing.length },
      },
    ],
  });
}
