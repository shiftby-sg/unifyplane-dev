export type GlobalRule = {
  id: string;
  title: string;
  rules: string[];
};

export type ImplementationPhase = {
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

export type ImplementationSpec = {
  specVersion: string;
  name: "unifyplane.implementation";
  authoritativeDesignSpec: string;
  authoritativeAuditSpec: string;
  globalRules: GlobalRule[];
  requiredFailureArtifacts: string[];
  requiredSuccessArtifacts: string[];
  phases: ImplementationPhase[];
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
  track: "implementation";
  phase: number;
  runId: string;
  artifacts: Array<{
    path: string;
    description: string;
    references: EvidenceRef;
  }>;
};

export type ImplementationStatus = {
  generatedAt: string;
  track: "implementation";
  phase: number;
  runId: string;
  result: "pass" | "fail";
  approved: boolean;
  authoritativeDesignSpec: string;
  authoritativeAuditSpec: string;
  repoHeadSha: string | null;
  repoTreeSha: string | null;
  repoDirty: boolean;
  repoMetaMethod: string;
  designauditLockSource: { phase: 1; runId: string; runDir: string };
  evidenceFiles: string[];
};

