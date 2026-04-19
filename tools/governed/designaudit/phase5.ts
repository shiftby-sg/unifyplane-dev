import fs from "node:fs/promises";
import path from "node:path";
import { writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

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

function extractRootCssBlock(css: string): string {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  return m ? m[1]! : "";
}

export async function runDesignAuditPhase5(args: Args): Promise<void> {
  const lockedDesign = await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  const designSpec = lockedDesign.spec;

  const colorSystem = (designSpec as any)?.colorSystem;
  const tokenContract = colorSystem?.tokenContract;
  const aliases = tokenContract?.aliases ?? {};

  const globalsAbs = path.join(process.cwd(), "app/globals.css");
  const globalsCss = await fs.readFile(globalsAbs, "utf8");
  const rootBlock = extractRootCssBlock(globalsCss);

  const definedVars: string[] = [];
  const varRe = /--([a-zA-Z0-9-_]+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = varRe.exec(rootBlock))) definedVars.push(`--${m[1]!}`);

  const expectedAliasVars = Object.keys(aliases).map((k) => `--color-${k}`);
  const aliasMissing = expectedAliasVars.filter((v) => !definedVars.includes(v));

  const cssFiles = [
    ...(await walkCss(path.join(process.cwd(), "app"))),
    ...(await walkCss(path.join(process.cwd(), "components"))),
  ];

  const hexViolations: Array<{ file: string; value: string }> = [];
  const rgbaViolations: Array<{ file: string; value: string }> = [];

  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b/g;
  const rgbaRe = /rgba\\([^\\)]*\\)/g;

  for (const abs of cssFiles) {
    const rel = toRepoRel(abs);
    const raw = await fs.readFile(abs, "utf8");

    // Allow hex codes only in the global token definition block.
    const allowHex = rel === "app/globals.css";
    const scanArea = allowHex ? raw.replace(extractRootCssBlock(raw), "") : raw;

    let mh: RegExpExecArray | null;
    while ((mh = hexRe.exec(scanArea))) {
      hexViolations.push({ file: rel, value: `#${mh[1]!}` });
    }

    // Direct rgba usage is treated as ad hoc color usage, except inside the global token definition block.
    const rgbaScanArea = allowHex ? scanArea : raw;
    let mr: RegExpExecArray | null;
    while ((mr = rgbaRe.exec(rgbaScanArea))) {
      const v = mr[0]!;
      if (!v.includes("var(")) rgbaViolations.push({ file: rel, value: v });
    }
  }

  const tokenAudit = {
    generatedAt: new Date().toISOString(),
    tokenContract: {
      expectedAliasVars,
      definedVars,
      aliasMissing,
    },
  };
  const colorUsageMap = {
    generatedAt: new Date().toISOString(),
    hexViolations,
    rgbaViolations,
  };

  await writeJsonAtomic(path.join(args.runDir, "token_audit.json"), tokenAudit);
  await writeJsonAtomic(path.join(args.runDir, "color_usage_map.json"), colorUsageMap);

  const failures: string[] = [];
  if (aliasMissing.length > 0) failures.push(`missing token aliases: ${aliasMissing.join(", ")}`);
  if (hexViolations.length > 0) failures.push(`hex colors used outside tokens: ${hexViolations.length}`);
  if (rgbaViolations.length > 0) failures.push(`rgba literal usage: ${rgbaViolations.length}`);

  const ok = failures.length === 0;
  await writeValidation(args.runDir, ok, { failures });

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      { path: "token_audit.json", description: "Token contract mapping audit.", references: { files: ["app/globals.css", "contracts/specs/unifyplane.design.spec.json"] } },
      { path: "color_usage_map.json", description: "Direct color usage map across CSS.", references: { files: ["app/**/*.css", "components/**/*.css"] } },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  if (!ok) throw new Error(`Design audit Phase 5 failed: ${failures[0] ?? "token/color non-conformance"}`);

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["token_audit.json", "color_usage_map.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
