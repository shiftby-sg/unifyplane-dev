import fs from "node:fs/promises";
import path from "node:path";
import { sha256File, writeJsonAtomic } from "../fs-utils.js";
import { writeEvidenceIndex, writeStatus, writeValidation } from "./artifacts.js";
import { loadLockedSpec } from "./spec.js";
import type { LockedSpec } from "./types.js";

type Args = { phase: number; runDir: string; runId: string; prevApprovedRunDir: string | null };

async function walkFiles(rootAbs: string, filter: (abs: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(rootAbs, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(rootAbs, e.name);
    if (e.isDirectory()) out.push(...(await walkFiles(p, filter)));
    else if (e.isFile() && filter(p)) out.push(p);
  }
  return out.sort();
}

function toRepoRel(abs: string): string {
  const rel = path.relative(process.cwd(), abs);
  return rel.split(path.sep).join("/");
}

function deriveRouteFromPageAbs(pageAbs: string): string {
  const rel = toRepoRel(pageAbs);
  const parts = rel.split("/");
  const appIndex = parts.indexOf("app");
  if (appIndex === -1) return "unknown";
  const routeParts = parts.slice(appIndex + 1);
  if (routeParts.length === 1 && routeParts[0] === "page.tsx") return "/";
  // drop trailing page.tsx
  if (routeParts[routeParts.length - 1] === "page.tsx") routeParts.pop();
  return `/${routeParts.join("/")}`;
}

function parseCssVars(globalsCss: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rootMatch = globalsCss.match(/:root\s*\{([\s\S]*?)\}/);
  const root = rootMatch?.[1];
  if (!root) {
    // Phase 2 extracts a deterministic token snapshot; missing :root means we cannot
    // reliably map tokens and must fail-closed (runner will emit failure artifacts).
    throw new Error("globals.css is missing a parseable `:root { ... }` block for CSS variables.");
  }
  const re = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(root))) {
    vars[`--${m[1]}`] = m[2]!.trim();
  }
  return vars;
}

function parseNavItems(navTs: string): { primary: Array<{ label: string; href: string }>; secondary: Array<{ label: string; href: string }> } {
  const itemRe = /\{\s*label:\s*"([^"]+)",\s*href:\s*"([^"]+)"\s*\}/g;
  const primaryBlock = navTs.match(/export const primaryNav[\s\S]*?=\s*\[([\s\S]*?)\];/);
  const secondaryBlock = navTs.match(/export const secondaryNav[\s\S]*?=\s*\[([\s\S]*?)\];/);
  const parseBlock = (block: string | null) => {
    const out: Array<{ label: string; href: string }> = [];
    if (!block) return out;
    itemRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(block))) out.push({ label: m[1]!, href: m[2]! });
    return out;
  };
  return { primary: parseBlock(primaryBlock?.[1] ?? null), secondary: parseBlock(secondaryBlock?.[1] ?? null) };
}

function extractHomeBandOrder(homeTsx: string): string[] {
  const out: string[] = [];
  const re = /data-home-band="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(homeTsx))) out.push(m[1]!);
  return out;
}

function detectPageShellWidth(pageTsx: string): "content" | "wide" | "unknown" {
  const m = pageTsx.match(/<PageShell[\s\S]*?>/);
  if (!m) return "unknown";
  if (m[0].includes('width="wide"')) return "wide";
  if (m[0].includes('width="content"')) return "content";
  return "content";
}

export async function runDesignAuditPhase2(args: Args): Promise<void> {
  // Ensure lock files exist and are parseable (phase gate contract).
  await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_spec.lock.json");
  await loadLockedSpec<Record<string, unknown>>(args.runDir, "design_audit_spec.lock.json");

  const appRoot = path.join(process.cwd(), "app");
  const pageFiles = await walkFiles(appRoot, (p) => p.endsWith(`${path.sep}page.tsx`));
  const routes = [];
  for (const abs of pageFiles) {
    const route = deriveRouteFromPageAbs(abs);
    const raw = await fs.readFile(abs, "utf8");
    routes.push({
      route,
      file: toRepoRel(abs),
      dynamic: route.includes("[") && route.includes("]"),
      pageShellWidth: detectPageShellWidth(raw),
    });
  }

  const navRaw = await fs.readFile(path.join(process.cwd(), "lib/site/nav.ts"), "utf8");
  const nav = parseNavItems(navRaw);

  const globalsCssPath = path.join(process.cwd(), "app/globals.css");
  const globalsCss = await fs.readFile(globalsCssPath, "utf8");
  const cssVars = parseCssVars(globalsCss);

  const pageShellCss = await fs.readFile(
    path.join(process.cwd(), "components/PageShell.module.css"),
    "utf8",
  );

  const componentsDir = path.join(process.cwd(), "components");
  const componentFiles = (await walkFiles(componentsDir, (p) => p.endsWith(".tsx") || p.endsWith(".css"))).map(toRepoRel);

  const homeCompositionRaw = await fs.readFile(
    path.join(process.cwd(), "content/compositions/home.yml"),
    "utf8",
  );
  const homeBands = extractHomeBandOrder(
    await fs.readFile(path.join(process.cwd(), "components/HomeComposition.tsx"), "utf8"),
  );

  const snapshot = {
    generatedAt: new Date().toISOString(),
    routes,
    nav,
    tokens: {
      cssVars,
      globalsCss: "app/globals.css",
    },
    layout: {
      pageShell: {
        file: "components/PageShell.tsx",
        css: "components/PageShell.module.css",
        cssTextSnippet: pageShellCss.includes("--layout-") ? "uses layout tokens" : "no layout token usage detected",
      },
    },
    components: {
      files: componentFiles,
    },
    homepage: {
      compositionFile: "content/compositions/home.yml",
      compositionFormat: "YAML-JSON subset",
      compositionRawSha256: await sha256File(path.join(process.cwd(), "content/compositions/home.yml")),
      bandsInRenderOrder: homeBands,
    },
  };

  await writeJsonAtomic(path.join(args.runDir, "site_snapshot.json"), snapshot);

  await writeEvidenceIndex(args.runDir, {
    phase: args.phase,
    runId: args.runId,
    artifacts: [
      {
        path: "site_snapshot.json",
        description: "Deterministic snapshot of current routes, nav, layout patterns, tokens, and homepage composition behavior.",
        references: {
          files: [
            "app/**/page.tsx",
            "lib/site/nav.ts",
            "app/globals.css",
            "components/PageShell.tsx",
            "components/PageShell.module.css",
            "components/HomeComposition.tsx",
            "content/compositions/home.yml",
          ],
        },
      },
      { path: "validation.json", description: "Phase pass/fail summary", references: {} },
      { path: "evidence_index.json", description: "Phase evidence index", references: {} },
      { path: "status.json", description: "Run status (pass)", references: {} },
    ],
  });

  await writeValidation(args.runDir, true, { counts: { routes: routes.length, components: componentFiles.length } });

  await writeStatus(args.runDir, {
    track: "designaudit",
    phase: args.phase,
    runId: args.runId,
    result: "pass",
    approved: false,
    authoritativeDesignSpec: "contracts/specs/unifyplane.design.spec.json",
    authoritativeAuditSpec: "contracts/specs/unifyplane.design.audit.spec.json",
    evidenceFiles: ["site_snapshot.json", "validation.json", "evidence_index.json", "status.json"],
  });
}
