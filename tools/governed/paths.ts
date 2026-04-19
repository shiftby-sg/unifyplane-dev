import path from "node:path";

export const REPO_ROOT = process.cwd();

export type GovernedTrack = "implementationplan" | "designaudit" | "implementation";

export const DEFAULT_TRACK: GovernedTrack = "implementationplan";

export const DOCS_CANONICAL_ROOT = path.join(REPO_ROOT, "docs", "canonical");
export const CONTENT_ROOT = path.join(REPO_ROOT, "content");
export const CONTENT_CORE_ROOT = path.join(CONTENT_ROOT, "core");
export const CONTENT_REGISTRIES_ROOT = path.join(CONTENT_ROOT, "registries");

export function evidenceRoot(track: GovernedTrack = DEFAULT_TRACK): string {
  return path.join(REPO_ROOT, "evidence", "reports", track);
}

// Back-compat: existing code assumes this constant points at the legacy evidence root.
export const EVIDENCE_ROOT = evidenceRoot(DEFAULT_TRACK);

export function phaseRoot(phase: number, track: GovernedTrack = DEFAULT_TRACK): string {
  return path.join(evidenceRoot(track), `phase${phase}`);
}

