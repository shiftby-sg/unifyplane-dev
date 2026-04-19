import fs from "node:fs/promises";
import path from "node:path";
import { validateImplementationSpecStrict } from "./spec.js";

export async function validateImplementationSpec(): Promise<void> {
  const specPath = path.join(process.cwd(), "contracts/specs/unifyplane.implementation.spec.json");
  const schemaPath = path.join(process.cwd(), "contracts/schemas/implementation.schema.json");

  // Existence checks (schema is required even though we validate strictly in code).
  await fs.stat(specPath);
  await fs.stat(schemaPath);

  const raw = JSON.parse(await fs.readFile(specPath, "utf8")) as unknown;
  const check = validateImplementationSpecStrict(raw);
  if (!check.ok) {
    throw new Error(`Implementation spec validation failed: ${check.errors.join("; ")}`);
  }
}

