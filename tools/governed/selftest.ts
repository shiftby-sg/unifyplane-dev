import { validateDesignAuditSpec } from "./designaudit/validate-spec.js";
import { validateImplementationSpec } from "./implementation/validate-spec.js";
import { computeRepoMeta } from "./repo-meta.js";

async function main() {
  const results: Array<{ id: string; ok: boolean; detail: string }> = [];

  try {
    await validateDesignAuditSpec();
    results.push({ id: "validate-design-audit-spec", ok: true, detail: "ok" });
  } catch (e) {
    results.push({ id: "validate-design-audit-spec", ok: false, detail: String(e instanceof Error ? e.message : e) });
  }

  try {
    await validateImplementationSpec();
    results.push({ id: "validate-implementation-spec", ok: true, detail: "ok" });
  } catch (e) {
    results.push({ id: "validate-implementation-spec", ok: false, detail: String(e instanceof Error ? e.message : e) });
  }

  try {
    const meta = await computeRepoMeta();
    results.push({
      id: "repo-meta",
      ok: meta.repoTreeSha !== null,
      detail: `head=${meta.repoHeadSha ?? "null"} dirty=${meta.repoDirty}`,
    });
  } catch (e) {
    results.push({ id: "repo-meta", ok: false, detail: String(e instanceof Error ? e.message : e) });
  }

  const ok = results.every((r) => r.ok);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok, results }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

