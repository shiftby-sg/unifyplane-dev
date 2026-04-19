import test from "node:test";
import assert from "node:assert/strict";
import { validateImplementationSpecStrict } from "../implementation/spec.js";
import fs from "node:fs/promises";
import path from "node:path";

test("implementation spec validates strictly", async () => {
  const specPath = path.join(process.cwd(), "contracts/specs/unifyplane.implementation.spec.json");
  const raw = JSON.parse(await fs.readFile(specPath, "utf8")) as unknown;
  const check = validateImplementationSpecStrict(raw);
  assert.equal(check.ok, true, `errors: ${check.errors.join("; ")}`);
});

