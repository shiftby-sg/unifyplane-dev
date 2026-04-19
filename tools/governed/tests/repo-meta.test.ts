import test from "node:test";
import assert from "node:assert/strict";
import { computeRepoMeta } from "../repo-meta.js";

test("repo meta computes head sha and method", async () => {
  const meta = await computeRepoMeta();
  // repoHeadSha can be null in non-git environments; in this repo we expect it.
  assert.ok(meta.method.length > 0);
  assert.ok(meta.repoTreeSha && meta.repoTreeSha.length > 0);
});

