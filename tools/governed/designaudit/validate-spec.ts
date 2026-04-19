import fs from "node:fs/promises";
import path from "node:path";
import { validateAuditSpecStrict } from "./spec.js";

export async function validateDesignAuditSpec(): Promise<void> {
  const specPath = path.join(process.cwd(), "contracts/specs/unifyplane.design.audit.spec.json");
  const schemaPath = path.join(process.cwd(), "contracts/schemas/design-audit.schema.json");

  // Existence checks (schema is required even though we validate strictly in code).
  await fs.stat(specPath);
  await fs.stat(schemaPath);

  const raw = JSON.parse(await fs.readFile(specPath, "utf8")) as unknown;
  const check = validateAuditSpecStrict(raw);
  if (!check.ok) {
    throw new Error(`Design audit spec validation failed: ${check.errors.join("; ")}`);
  }
}

