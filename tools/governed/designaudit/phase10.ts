import path from "node:path";
import fs from "node:fs/promises";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";

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

export async function runDesignAuditPhase10(args: Args): Promise<void> {
  // Accessibility: repo-local static checks.
  const layout = await fs.readFile(path.join(process.cwd(), "app/layout.tsx"), "utf8");
  const globals = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");

  const a11y = {
    generatedAt: new Date().toISOString(),
    skipLinkPresent: layout.includes("Skip to content"),
    mainIdPresent: layout.includes('id="main"') || layout.includes("id='main'"),
    focusVisiblePresent: globals.includes(":focus-visible"),
    reducedMotionPresent: globals.includes("prefers-reduced-motion"),
  };

  const a11yFailures: string[] = [];
  if (!a11y.skipLinkPresent) a11yFailures.push("skip link missing");
  if (!a11y.mainIdPresent) a11yFailures.push("main id missing");
  if (!a11y.focusVisiblePresent) a11yFailures.push("focus-visible styles missing");
  if (!a11y.reducedMotionPresent) a11yFailures.push("prefers-reduced-motion handling missing");

  await writeJsonAtomic(path.join(args.runDir, "a11y_report.json"), a11y);

  // Performance: use repo-local build artifacts (fail-closed if absent).
  // Rationale: in some Windows environments (including Codex sandboxes) child-process
  // spawning can be blocked (EPERM). The contract requirement is repo-local and non-mutating;
  // a production build artifact snapshot satisfies that, and absence fails closed.
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
  if (await fileExists(buildIdPath)) {
    buildId = (await fs.readFile(buildIdPath, "utf8")).trim() || null;
  }

  let pagesCount: number | null = null;
  if (await fileExists(buildManifestPath)) {
    try {
      const raw = await fs.readFile(buildManifestPath, "utf8");
      const json = JSON.parse(raw) as { pages?: Record<string, unknown> };
      if (json && typeof json === "object" && json.pages && typeof json.pages === "object") {
        pagesCount = Object.keys(json.pages).length;
      }
    } catch {
      pagesCount = null;
    }
  }

  let prerenderedRoutesCount: number | null = null;
  if (await fileExists(prerenderManifestPath)) {
    try {
      const raw = await fs.readFile(prerenderManifestPath, "utf8");
      const json = JSON.parse(raw) as { routes?: Record<string, unknown> };
      if (json && typeof json === "object" && json.routes && typeof json.routes === "object") {
        prerenderedRoutesCount = Object.keys(json.routes).length;
      }
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

  const performance = {
    generatedAt: new Date().toISOString(),
    artifacts: {
      nextDir: ".next/",
      buildId,
      buildArtifactsPresent,
      pagesCount,
      prerenderedRoutesCount,
      chunkCount,
      chunkTotalBytes,
    },
  };
  await writeJsonAtomic(path.join(args.runDir, "performance_report.json"), performance);

  const failures: string[] = [];
  failures.push(...a11yFailures.map((x) => `a11y: ${x}`));
  if (!buildArtifactsPresent) {
    failures.push("missing required .next build artifacts (run `npm run build` manually, then rerun Phase 10)");
  }

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });
  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "a11y_report.json", description: "Accessibility baseline report (static).", references: { files: ["app/layout.tsx", "app/globals.css"] } },
      { path: "performance_report.json", description: "Performance baseline report (build output).", references: { files: ["package.json", "next.config.mjs"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 10 failed: ${failures[0] ?? "a11y/perf violations"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["a11y_report.json", "performance_report.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
