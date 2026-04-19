import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function fileExists(abs: string): Promise<boolean> {
  try {
    await fs.stat(abs);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(absDir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(absDir, e.name);
    if (e.isDirectory()) out.push(...(await listFilesRecursive(abs)));
    else if (e.isFile()) out.push(abs);
  }
  return out;
}

export async function runImplementationPhase10(args: Args): Promise<void> {
  const nextDir = path.join(process.cwd(), ".next");
  const buildIdPath = path.join(nextDir, "BUILD_ID");
  const buildManifestPath = path.join(nextDir, "build-manifest.json");
  const prerenderManifestPath = path.join(nextDir, "prerender-manifest.json");
  const chunksDir = path.join(nextDir, "static", "chunks");

  const buildArtifactsPresent =
    (await fileExists(buildIdPath)) &&
    (await fileExists(buildManifestPath)) &&
    (await fileExists(chunksDir));

  let buildId: string | null = null;
  if (await fileExists(buildIdPath)) buildId = (await fs.readFile(buildIdPath, "utf8")).trim() || null;

  let prerenderedRoutesCount: number | null = null;
  if (await fileExists(prerenderManifestPath)) {
    try {
      const json = JSON.parse(await fs.readFile(prerenderManifestPath, "utf8")) as any;
      const routes = json?.routes;
      if (routes && typeof routes === "object") prerenderedRoutesCount = Object.keys(routes).length;
    } catch {
      prerenderedRoutesCount = null;
    }
  }

  let chunkCount: number | null = null;
  let chunkTotalBytes: number | null = null;
  if (await fileExists(chunksDir)) {
    const files = (await listFilesRecursive(chunksDir)).filter((f) => f.endsWith(".js"));
    chunkCount = files.length;
    const stats = await Promise.all(files.map((f) => fs.stat(f)));
    chunkTotalBytes = stats.reduce((sum, st) => sum + st.size, 0);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    artifacts: {
      nextDir: ".next/",
      buildId,
      buildArtifactsPresent,
      prerenderedRoutesCount,
      chunkCount,
      chunkTotalBytes,
    },
  };
  await writeJsonAtomic(path.join(args.runDir, "performance_validation_report.json"), report);

  const failures: string[] = [];
  if (!buildArtifactsPresent) failures.push("missing required .next build artifacts (run `npm run build` manually, then rerun Phase 10)");

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "build_artifacts_present", ok: buildArtifactsPresent, detail: `present=${buildArtifactsPresent}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "performance_validation_report.json", description: "Performance snapshot based on .next artifacts.", references: { files: [".next/BUILD_ID", ".next/build-manifest.json", ".next/static/chunks/*"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 10 failed: ${failures[0] ?? "performance violations"}`);

  const src = JSON.parse(await fs.readFile(path.join(args.runDir, "designaudit_lock_source.json"), "utf8")) as any;
  await writeStatus(args.runDir, {
    track: "implementation",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    designauditLockSource: { phase: 1, runId: src.runId, runDir: src.runDir },
    evidenceFiles: [
      "performance_validation_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

