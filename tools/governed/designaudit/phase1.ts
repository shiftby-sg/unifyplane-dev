import fs from "node:fs/promises";
import path from "node:path";
import { sha256File, writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadAuditSpecFromRepo, validateAuditSpecStrict, writeLockedSpec } from "./spec.js";
import type { DesignAuditSpec } from "./types.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function runDesignAuditPhase1(args: Args): Promise<void> {
  const designSpecRel = "contracts/specs/unifyplane.design.spec.json";
  const auditSpecRel = "contracts/specs/unifyplane.design.audit.spec.json";
  const auditSchemaRel = "contracts/schemas/design-audit.schema.json";

  const designSpecAbs = path.join(process.cwd(), designSpecRel);
  const auditSpecAbs = path.join(process.cwd(), auditSpecRel);
  const auditSchemaAbs = path.join(process.cwd(), auditSchemaRel);

  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredDesignSections = [
    "informationArchitecture",
    "layoutSystem",
    "typography",
    "colorSystem",
    "components",
    "readinessSemantics",
    "v1Decisions",
  ] as const;

  let designSpec: Record<string, unknown> | null = null;
  let auditSpec: DesignAuditSpec | null = null;

  try {
    await fs.stat(designSpecAbs);
  } catch {
    errors.push(`Design spec missing: ${designSpecRel}`);
  }
  try {
    await fs.stat(auditSpecAbs);
  } catch {
    errors.push(`Audit spec missing: ${auditSpecRel}`);
  }
  try {
    await fs.stat(auditSchemaAbs);
  } catch {
    errors.push(`Audit schema missing: ${auditSchemaRel}`);
  }

  if (errors.length === 0) {
    try {
      const raw = JSON.parse(await fs.readFile(designSpecAbs, "utf8")) as unknown;
      if (!isRecord(raw)) throw new Error("Design spec is not a JSON object");
      designSpec = raw;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Design spec parse failed");
    }

    try {
      auditSpec = await loadAuditSpecFromRepo();
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Audit spec load failed");
    }
  }

  const present: string[] = [];
  const missing: string[] = [];
  if (designSpec) {
    for (const k of requiredDesignSections) {
      if (k in designSpec) present.push(k);
      else missing.push(k);
    }
    if (missing.length > 0) {
      errors.push(`Design spec missing required sections: ${missing.join(", ")}`);
    }
  }

  // Validate the audit spec against strict rules (schema file must exist; strict rules live in code).
  if (auditSpec) {
    const strict = validateAuditSpecStrict(auditSpec as unknown);
    if (!strict.ok) errors.push(...strict.errors);
    if (auditSpec.authoritativeDesignSpec !== designSpecRel) {
      errors.push(
        `Audit spec authoritativeDesignSpec must be '${designSpecRel}' (got '${auditSpec.authoritativeDesignSpec}')`,
      );
    }
  }

  const ok = errors.length === 0;

  await writeJsonAtomic(path.join(args.runDir, "spec_validation.json"), {
    generatedAt: new Date().toISOString(),
    ok,
    authoritativeDesignSpec: designSpecRel,
    authoritativeAuditSpec: auditSpecRel,
    auditSchema: auditSchemaRel,
    designSpecSha256: (await fs.stat(designSpecAbs).then(() => sha256File(designSpecAbs)).catch(() => null)),
    auditSpecSha256: (await fs.stat(auditSpecAbs).then(() => sha256File(auditSpecAbs)).catch(() => null)),
    errors,
    warnings,
  });

  await writeJsonAtomic(path.join(args.runDir, "completeness_report.json"), {
    generatedAt: new Date().toISOString(),
    required: requiredDesignSections,
    present,
    missing,
  });

  // Always write lock files when parsing succeeded; later phases must only consume locks.
  if (designSpec) {
    await writeLockedSpec(args.runDir, "design_spec.lock.json", designSpecRel, designSpec);
  }
  if (auditSpec) {
    await writeLockedSpec(args.runDir, "design_audit_spec.lock.json", auditSpecRel, auditSpec);
  }

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      {
        path: "spec_validation.json",
        description: "Phase 1 spec validation report",
        references: { files: [designSpecRel, auditSpecRel, auditSchemaRel] },
      },
      {
        path: "completeness_report.json",
        description: "Required-section completeness report for the design spec",
        references: { files: [designSpecRel] },
      },
      {
        path: "design_spec.lock.json",
        description: "Pinned design spec used by later phases",
        references: { files: [designSpecRel] },
      },
      {
        path: "design_audit_spec.lock.json",
        description: "Pinned audit spec used by later phases",
        references: { files: [auditSpecRel] },
      },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  await writeValidation(args.runDir, ok, { errors, warnings, missingSections: missing });

  if (!ok) {
    throw new Error(`Design audit Phase 1 failed: ${errors[0] ?? "Unknown error"}`);
  }

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: designSpecRel,
    authoritativeAuditSpec: auditSpecRel,
    evidenceFiles: [
      "spec_validation.json",
      "completeness_report.json",
      "design_spec.lock.json",
      "design_audit_spec.lock.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

