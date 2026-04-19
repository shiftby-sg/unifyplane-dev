export type ConformanceClassification = "APPLIED" | "PARTIAL" | "MISSING" | "CONFLICT";

export type GlobalRule = {
  id: string;
  title: string;
  rules: string[];
};

export type DesignAuditPhase = {
  id: number;
  name: string;
  objective: string;
  approvalRequired: boolean;
  outputs: string[];
  checks: string[];
  validation: string[];
  failureConditions: string[];
  requiredArtifacts: string[];
};

export type DesignAuditSpec = {
  specVersion: string;
  name: "unifyplane.design.audit";
  authoritativeDesignSpec: string;
  globalRules: GlobalRule[];
  classifications: ConformanceClassification[];
  requiredFailureArtifacts: string[];
  requiredSuccessArtifacts: string[];
  phases: DesignAuditPhase[];
};

export type LockedSpec<T> = {
  generatedAt: string;
  sourcePath: string;
  sha256: string;
  spec: T;
};

export type EvidenceRef = {
  files?: string[];
  routes?: string[];
  components?: string[];
};

export type EvidenceIndex = {
  generatedAt: string;
  track: "designaudit";
  phase: number;
  runId: string;
  artifacts: Array<{
    path: string;
    description: string;
    references: EvidenceRef;
  }>;
};

export type DesignAuditStatus = {
  generatedAt: string;
  track: "designaudit";
  phase: number;
  runId: string;
  result: "pass" | "fail";
  approved: boolean;
  authoritativeDesignSpec: string;
  authoritativeAuditSpec: string;
  repoHeadSha?: string | null;
  // Deterministic fingerprint (not necessarily a git tree object id).
  repoTreeSha?: string | null;
  repoDirty?: boolean;
  repoMetaMethod?: string;
  evidenceFiles: string[];
};
