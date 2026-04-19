import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeMarkdown, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec, loadImplementationSpecFromRun, validateImplementationSpecStrict } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function readJson(abs: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(abs, "utf8")) as unknown;
}

export async function runImplementationPhase1(args: Args): Promise<void> {
  const designLock = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const auditLock = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_audit_spec.lock.json");

  const implLockAbs = path.join(args.runDir, "implementation_spec.lock.json");
  const implLockRaw = await readJson(implLockAbs);
  if (!isRecord(implLockRaw) || !("spec" in implLockRaw)) {
    throw new Error("implementation_spec.lock.json missing or invalid");
  }
  const implSpecCheck = validateImplementationSpecStrict((implLockRaw as any).spec);
  if (!implSpecCheck.ok) {
    throw new Error(`implementation_spec.lock.json invalid: ${implSpecCheck.errors.join("; ")}`);
  }

  // Ensure the locked implementation spec is loadable via our loader.
  await loadImplementationSpecFromRun(args.runDir);

  const lockSourceAbs = path.join(args.runDir, "designaudit_lock_source.json");
  const lockSource = (await readJson(lockSourceAbs)) as any;
  if (!isRecord(lockSource) || typeof lockSource.runId !== "string" || typeof lockSource.runDir !== "string") {
    throw new Error("designaudit_lock_source.json missing or invalid");
  }

  const lockedSpecVerified = {
    generatedAt: new Date().toISOString(),
    ok: true,
    locks: {
      designSpec: { sourcePath: designLock.sourcePath, sha256: designLock.sha256 },
      auditSpec: { sourcePath: auditLock.sourcePath, sha256: auditLock.sha256 },
      implementationSpec: {
        sourcePath: (implLockRaw as any).sourcePath ?? "contracts/specs/unifyplane.implementation.spec.json",
        sha256: (implLockRaw as any).sha256 ?? null,
      },
    },
    designauditLockSource: {
      phase: 1,
      runId: lockSource.runId,
      runDir: lockSource.runDir,
    },
  };

  const implementationContext = {
    generatedAt: new Date().toISOString(),
    track: "implementation",
    designauditLockSource: lockedSpecVerified.designauditLockSource,
    authoritativeLocks: {
      designSpecLock: "design_spec.lock.json",
      auditSpecLock: "design_audit_spec.lock.json",
      implementationSpecLock: "implementation_spec.lock.json",
    },
    lockHashes: {
      designSpecSha256: designLock.sha256,
      auditSpecSha256: auditLock.sha256,
      implementationSpecSha256: (implLockRaw as any).sha256 ?? null,
    },
  };

  await writeJsonAtomic(path.join(args.runDir, "locked_spec_verified.json"), lockedSpecVerified);
  await writeJsonAtomic(path.join(args.runDir, "implementation_context.json"), implementationContext);

  const tests = [
    { id: "locks_present", ok: true, detail: "Lock files present and readable." },
    { id: "impl_spec_valid", ok: true, detail: "Locked implementation spec validated." },
  ];

  await writeTestResults(args.runDir, true, tests);
  await writeValidation(args.runDir, true, { tests });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "implementation_context.json", description: "Implementation chain binding context.", references: { files: ["design_spec.lock.json", "design_audit_spec.lock.json", "implementation_spec.lock.json", "designaudit_lock_source.json"] } },
      { path: "locked_spec_verified.json", description: "Locked spec verification report.", references: { files: ["design_spec.lock.json", "design_audit_spec.lock.json", "implementation_spec.lock.json"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  await writeMarkdown(args.runDir, "notes.md", "Notes", "Phase 1 binds implementation execution to audited locks.");

  await writeStatus(args.runDir, {
    track: "implementation",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    designauditLockSource: { phase: 1, runId: lockSource.runId, runDir: lockSource.runDir },
    evidenceFiles: [
      "implementation_context.json",
      "locked_spec_verified.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

