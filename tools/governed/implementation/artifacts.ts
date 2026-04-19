import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { computeRepoMeta } from "../repo-meta.js";
import type { EvidenceIndex, EvidenceRef, ImplementationStatus } from "./types.js";

export async function writeValidation(runDir: string, ok: boolean, details?: unknown): Promise<void> {
  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    generatedAt: new Date().toISOString(),
    ok,
    details: details ?? null,
  });
}

export async function writeTestResults(
  runDir: string,
  ok: boolean,
  tests: Array<{ id: string; ok: boolean; detail: string }>,
): Promise<void> {
  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    generatedAt: new Date().toISOString(),
    ok,
    tests,
  });
}

export async function writeEvidenceIndex(
  runDir: string,
  args: {
    phase: number;
    runId: string;
    artifacts: Array<{ path: string; description: string; references: EvidenceRef }>;
  },
): Promise<void> {
  const out: EvidenceIndex = {
    generatedAt: new Date().toISOString(),
    track: "implementation",
    phase: args.phase,
    runId: args.runId,
    artifacts: args.artifacts,
  };
  await writeJsonAtomic(path.join(runDir, "evidence_index.json"), out);
}

export async function writeStatus(
  runDir: string,
  args: Omit<ImplementationStatus, "generatedAt" | "repoHeadSha" | "repoTreeSha" | "repoDirty" | "repoMetaMethod">,
): Promise<void> {
  const meta = await computeRepoMeta();
  const out: ImplementationStatus = {
    generatedAt: new Date().toISOString(),
    ...args,
    repoHeadSha: meta.repoHeadSha,
    repoTreeSha: meta.repoTreeSha,
    repoDirty: meta.repoDirty,
    repoMetaMethod: meta.method,
  };
  await writeJsonAtomic(path.join(runDir, "status.json"), out);
}

export async function writeMarkdown(runDir: string, name: string, title: string, body: string) {
  await fs.writeFile(path.join(runDir, name), `# ${title}\n\n${body}\n`, "utf8");
}

