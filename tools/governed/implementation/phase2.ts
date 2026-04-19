import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeTestResults, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

function extractRootCssBlock(css: string): string {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) return "";
  return m[1]!;
}

function parseCssVars(globalsCss: string): Record<string, string> {
  const root = extractRootCssBlock(globalsCss);
  if (!root) throw new Error("globals.css is missing a parseable `:root { ... }` block for CSS variables.");
  const vars: Record<string, string> = {};
  const re = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(root))) vars[`--${m[1]}`] = m[2]!.trim();
  return vars;
}

async function walkCss(rootAbs: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(rootAbs, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(rootAbs, e.name);
    if (e.isDirectory()) out.push(...(await walkCss(p)));
    else if (e.isFile() && p.endsWith(".css")) out.push(p);
  }
  return out.sort();
}

function toRepoRel(abs: string): string {
  return path.relative(process.cwd(), abs).split(path.sep).join("/");
}

export async function runImplementationPhase2(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const spec = lockedDesign.spec as any;
  const aliases = spec?.colorSystem?.tokenContract?.aliases ?? {};
  const aliasKeys = Object.keys(aliases);

  const globalsAbs = path.join(process.cwd(), "app/globals.css");
  const globalsCss = await fs.readFile(globalsAbs, "utf8");
  const cssVars = parseCssVars(globalsCss);

  const expectedAliasVars = aliasKeys.map((k) => `--color-${k}`);
  const aliasMissing = expectedAliasVars.filter((v) => !(v in cssVars));

  const cssFiles = [
    ...(await walkCss(path.join(process.cwd(), "app"))),
    ...(await walkCss(path.join(process.cwd(), "components"))),
  ];

  const hexViolations: Array<{ file: string; value: string }> = [];
  const rgbaViolations: Array<{ file: string; value: string }> = [];

  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const rgbaRe = /rgba\([^\)]*\)/g;

  for (const abs of cssFiles) {
    const rel = toRepoRel(abs);
    const raw = await fs.readFile(abs, "utf8");
    const allowLiteralInTokens = rel === "app/globals.css";
    const tokenStripped = allowLiteralInTokens ? raw.replace(extractRootCssBlock(raw), "") : raw;

    let mh: RegExpExecArray | null;
    while ((mh = hexRe.exec(tokenStripped))) hexViolations.push({ file: rel, value: `#${mh[1]!}` });

    let mr: RegExpExecArray | null;
    while ((mr = rgbaRe.exec(tokenStripped))) {
      const v = mr[0]!;
      if (!v.includes("var(")) rgbaViolations.push({ file: rel, value: v });
    }
  }

  const tokenMap = {
    generatedAt: new Date().toISOString(),
    globalsCss: "app/globals.css",
    cssVars,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    expectedAliasVars,
    aliasMissing,
    hardcodedColors: { hexViolations, rgbaViolations },
  };

  await writeJsonAtomic(path.join(args.runDir, "token_map.json"), tokenMap);
  await writeJsonAtomic(path.join(args.runDir, "token_alignment_report.json"), report);

  const failures: string[] = [];
  if (aliasMissing.length > 0) failures.push(`missing token aliases: ${aliasMissing.join(", ")}`);
  if (hexViolations.length > 0) failures.push(`hex colors used outside tokens: ${hexViolations.length}`);
  if (rgbaViolations.length > 0) failures.push(`rgba literal usage: ${rgbaViolations.length}`);

  const ok = failures.length === 0;
  await writeTestResults(args.runDir, ok, [
    { id: "token_aliases_present", ok: aliasMissing.length === 0, detail: `missing: ${aliasMissing.length}` },
    { id: "no_hex_outside_tokens", ok: hexViolations.length === 0, detail: `violations: ${hexViolations.length}` },
    { id: "no_rgba_outside_tokens", ok: rgbaViolations.length === 0, detail: `violations: ${rgbaViolations.length}` },
  ]);
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "token_map.json", description: "Extracted token map from globals.css :root.", references: { files: ["app/globals.css"] } },
      { path: "token_alignment_report.json", description: "Token alignment report vs locked spec.", references: { files: ["design_spec.lock.json", "app/globals.css", "app/**/*.css", "components/**/*.css"] } },
      { path: "test_results.json", description: "Phase test execution results.", references: {} },
      { path: "validation.json", description: "Phase pass/fail summary.", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index.", references: {} },
      { path: "status.json", description: "Run status.", references: {} },
    ],
  });

  if (!ok) throw new Error(`Implementation Phase 2 failed: ${failures[0] ?? "token non-conformance"}`);

  const src = JSON.parse(await fs.readFile(path.join(args.runDir, "designaudit_lock_source.json"), "utf8")) as any;
  await writeStatus(args.runDir, {
    track: "implementation",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    designauditLockSource: { phase: 1, runId: src.runId, runDir: src.runDir },
    evidenceFiles: [
      "token_map.json",
      "token_alignment_report.json",
      "test_results.json",
      "validation.json",
      "evidence_index.json",
      "status.json",
    ],
  });
}

