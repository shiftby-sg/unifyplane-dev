import path from "node:path";

export const REPO_ROOT = process.cwd();

export const DOCS_CANONICAL_ROOT = path.join(REPO_ROOT, "docs", "canonical");
export const CONTENT_ROOT = path.join(REPO_ROOT, "content");
export const CONTENT_CORE_ROOT = path.join(CONTENT_ROOT, "core");
export const CONTENT_REGISTRIES_ROOT = path.join(CONTENT_ROOT, "registries");

export const EVIDENCE_ROOT = path.join(
  REPO_ROOT,
  "evidence",
  "reports",
  "implementationplan",
);

export function phaseRoot(phase: number): string {
  return path.join(EVIDENCE_ROOT, `phase${phase}`);
}

