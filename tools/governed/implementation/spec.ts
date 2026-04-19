import fs from "node:fs/promises";
import path from "node:path";
import { sha256File } from "../fs-utils.js";
import type { ImplementationPhase, ImplementationSpec, LockedSpec } from "./types.js";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function requireString(v: unknown, name: string): string {
  if (typeof v !== "string" || v.trim().length === 0) throw new Error(`Invalid or missing '${name}'`);
  return v;
}

function requireBool(v: unknown, name: string): boolean {
  if (typeof v !== "boolean") throw new Error(`Invalid or missing '${name}'`);
  return v;
}

function requireStringArray(v: unknown, name: string, minItems = 1): string[] {
  if (!Array.isArray(v) || v.length < minItems || !v.every((x) => typeof x === "string" && x.trim().length > 0)) {
    throw new Error(`Invalid or missing '${name}'`);
  }
  return v as string[];
}

function requirePhase(raw: unknown): ImplementationPhase {
  if (!isRecord(raw)) throw new Error("Invalid phase object");
  const id = raw.id;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1 || id > 11) throw new Error("Invalid phase.id");
  return {
    id,
    name: requireString(raw.name, "phase.name"),
    objective: requireString(raw.objective, "phase.objective"),
    approvalRequired: requireBool(raw.approvalRequired, "phase.approvalRequired"),
    outputs: requireStringArray(raw.outputs, "phase.outputs"),
    checks: requireStringArray(raw.checks, "phase.checks"),
    validation: requireStringArray(raw.validation, "phase.validation"),
    failureConditions: requireStringArray(raw.failureConditions, "phase.failureConditions"),
    requiredArtifacts: requireStringArray(raw.requiredArtifacts, "phase.requiredArtifacts"),
  };
}

export function validateImplementationSpecStrict(raw: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  try {
    if (!isRecord(raw)) throw new Error("Spec is not an object");
    if (raw.name !== "unifyplane.implementation") throw new Error("name must be 'unifyplane.implementation'");
    requireString(raw.specVersion, "specVersion");
    requireString(raw.authoritativeDesignSpec, "authoritativeDesignSpec");
    requireString(raw.authoritativeAuditSpec, "authoritativeAuditSpec");

    const requiredSuccess = requireStringArray(raw.requiredSuccessArtifacts, "requiredSuccessArtifacts");
    for (const expected of ["validation.json", "evidence_index.json", "status.json", "test_results.json"]) {
      if (!requiredSuccess.includes(expected)) throw new Error(`requiredSuccessArtifacts missing '${expected}'`);
    }
    const requiredFailure = requireStringArray(raw.requiredFailureArtifacts, "requiredFailureArtifacts");
    for (const expected of [
      "implementation_failure_report.json",
      "root_cause.md",
      "remediation.md",
      "status.json",
    ]) {
      if (!requiredFailure.includes(expected)) throw new Error(`requiredFailureArtifacts missing '${expected}'`);
    }

    const phasesRaw = raw.phases;
    if (!Array.isArray(phasesRaw) || phasesRaw.length !== 11) throw new Error("phases must be an array of length 11");
    const phases = phasesRaw.map(requirePhase);
    const ids = phases.map((p) => p.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) throw new Error("phase ids must be unique");
    for (let i = 0; i < ids.length; i++) {
      const expected = i + 1;
      if (ids[i] !== expected) throw new Error(`phase ids must be strictly ordered 1..11 (found ${ids.join(", ")})`);
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Invalid implementation spec");
  }
  return { ok: errors.length === 0, errors };
}

export async function loadImplementationSpecFromRepo(): Promise<ImplementationSpec> {
  const p = path.join(process.cwd(), "contracts/specs/unifyplane.implementation.spec.json");
  const raw = JSON.parse(await fs.readFile(p, "utf8")) as unknown;
  const check = validateImplementationSpecStrict(raw);
  if (!check.ok) throw new Error(`Implementation spec invalid: ${check.errors.join("; ")}`);
  return raw as ImplementationSpec;
}

export async function writeLockedSpec<T>(
  runDir: string,
  lockName: string,
  sourceRelPath: string,
  spec: T,
): Promise<LockedSpec<T>> {
  const abs = path.join(process.cwd(), sourceRelPath);
  const locked: LockedSpec<T> = {
    generatedAt: new Date().toISOString(),
    sourcePath: sourceRelPath,
    sha256: await sha256File(abs),
    spec,
  };
  await fs.writeFile(path.join(runDir, lockName), JSON.stringify(locked, null, 2) + "\n", "utf8");
  return locked;
}

export async function loadLockedSpec<T>(runDir: string, lockName: string): Promise<LockedSpec<T>> {
  const raw = JSON.parse(await fs.readFile(path.join(runDir, lockName), "utf8")) as unknown;
  if (!isRecord(raw)) throw new Error(`Invalid lock file: ${lockName}`);
  if (!("spec" in raw)) throw new Error(`Lock file missing spec: ${lockName}`);
  return raw as LockedSpec<T>;
}

export async function loadImplementationSpecFromRun(runDir: string): Promise<ImplementationSpec> {
  const locked = await loadLockedSpec<ImplementationSpec>(runDir, "implementation_spec.lock.json");
  const check = validateImplementationSpecStrict(locked.spec);
  if (!check.ok) throw new Error(`Locked implementation spec invalid: ${check.errors.join("; ")}`);
  return locked.spec;
}

