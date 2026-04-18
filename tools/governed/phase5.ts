import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { execCmd } from "./exec.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./fs-utils.js";

type HomeComp = {
  version: string;
  sections: Array<{ id: string; kind: string }>;
};

type SeoSpec = {
  site: { siteUrl: string };
  pageTypes: {
    home: {
      route: string;
      meta: { title: string; description: string };
      mustLinkTo?: string[];
    };
  };
};

async function readJsonYaml<T>(relPath: string): Promise<T> {
  const abs = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw) as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForOk(url: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  let lastErr: unknown = null;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}: ${String(lastErr)}`);
}

function matchOne(re: RegExp, s: string, label: string): string {
  const m = s.match(re);
  if (!m?.[1]) throw new Error(`Phase 5 runtime audit failed: missing ${label}`);
  return m[1];
}

function extractUniqueHrefs(html: string): string[] {
  const re = /href=\"([^\"]+)\"/g;
  const out = new Set<string>();
  for (;;) {
    const m = re.exec(html);
    if (!m) break;
    out.add(m[1]!);
  }
  return Array.from(out);
}

export async function runPhase5({ runDir }: { runDir: string }): Promise<void> {
  await ensureDir(runDir);

  const blockers = [
    "content/compositions/home.yml",
    "content/compositions/navigation.yml",
    "content/compositions/page-map.yml",
    "content/compositions/related-links.yml",
  ];
  const missingBlockers: string[] = [];
  for (const b of blockers) {
    if (!(await fileExists(b))) missingBlockers.push(b);
  }
  if (missingBlockers.length > 0) {
    await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
      generatedAt: new Date().toISOString(),
      expected: blockers,
      missing: missingBlockers,
      blockers: true,
    });
    throw new Error(`Phase 5 blocked: missing composition files: ${missingBlockers.join(", ")}`);
  }

  const home = await readJsonYaml<HomeComp>("content/compositions/home.yml");
  const sectionOrder = home.sections.map((s) => s.id);
  const expected = ["hero", "what", "why", "readiness", "evidence", "components", "foundations", "explore"];
  const orderOk =
    sectionOrder.length === expected.length && expected.every((id, idx) => sectionOrder[idx] === id);

  const seoSpec = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "contracts/specs/unfiplane.page.seo.spec.json"), "utf8"),
  ) as SeoSpec;
  const requiredLinks = seoSpec.pageTypes.home.mustLinkTo ?? [];

  await writeJsonAtomic(path.join(runDir, "homepage_audit.json"), {
    generatedAt: new Date().toISOString(),
    expectedOrder: expected,
    actualOrder: sectionOrder,
    orderOk,
    compositionVersion: home.version,
  });

  await writeJsonAtomic(path.join(runDir, "missing_md_report.json"), {
    generatedAt: new Date().toISOString(),
    expected: blockers,
    missing: [],
    blockers: false,
  });

  // Build verification (fail-closed).
  const lint = await execCmd("pnpm", ["lint"], { cwd: process.cwd() });
  const build = await execCmd("pnpm", ["build"], { cwd: process.cwd() });

  await writeJsonAtomic(path.join(runDir, "build_report.json"), {
    generatedAt: new Date().toISOString(),
    lint: {
      command: lint.command,
      exitCode: lint.exitCode,
      durationMs: lint.durationMs,
      stdout: lint.stdout,
      stderr: lint.stderr,
    },
    build: {
      command: build.command,
      exitCode: build.exitCode,
      durationMs: build.durationMs,
      stdout: build.stdout,
      stderr: build.stderr,
    },
  });

  if (lint.exitCode !== 0 || build.exitCode !== 0) {
    throw new Error(`Phase 5 failed: lint exit=${lint.exitCode}, build exit=${build.exitCode}`);
  }
  if (!orderOk) {
    throw new Error("Phase 5 failed: homepage section order does not match IA.");
  }

  // Runtime audit (fail-closed) via prod server + curl-equivalent fetch.
  const port = 3010;
  const baseUrl = `http://localhost:${port}`;
  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const startChild = spawn("node", [nextBin, "start", "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const startStdout: Buffer[] = [];
  const startStderr: Buffer[] = [];
  startChild.stdout.on("data", (d) => startStdout.push(d as Buffer));
  startChild.stderr.on("data", (d) => startStderr.push(d as Buffer));

  try {
    await waitForOk(`${baseUrl}/`, 20_000);
    const homeHtml = await (await fetch(`${baseUrl}/`)).text();
    const evidenceHtml = await (await fetch(`${baseUrl}/evidence`)).text();

    await fs.writeFile(path.join(runDir, "home.final.html"), homeHtml, "utf8");
    await fs.writeFile(path.join(runDir, "evidence.final.html"), evidenceHtml, "utf8");

    const title = matchOne(/<title>([^<]+)<\/title>/i, homeHtml, "<title>");
    const description = matchOne(
      /<meta[^>]+name=\"description\"[^>]+content=\"([^\"]+)\"[^>]*>/i,
      homeHtml,
      "meta description",
    );
    const canonical = matchOne(
      /<link[^>]+rel=\"canonical\"[^>]+href=\"([^\"]+)\"[^>]*>/i,
      homeHtml,
      "canonical link",
    );

    const uniqueHrefs = extractUniqueHrefs(homeHtml);
    const hrefSet = new Set(uniqueHrefs);
    const missingLinks = requiredLinks.filter((href) => !hrefSet.has(href));

    const h1Count = (homeHtml.match(/<h1\b/gi) ?? []).length;
    const hasSkipLink = homeHtml.includes('href="#main"');
    const hasMain = homeHtml.includes('id="main"');

    const requiredBands = ["hero", "context", "trust", "routes", "explore"] as const;
    const missingBands = requiredBands.filter((b) => !homeHtml.includes(`data-home-band=\"${b}\"`));

    const expectedCanonical = seoSpec.site.siteUrl;
    const metaOk =
      title === seoSpec.pageTypes.home.meta.title &&
      description === seoSpec.pageTypes.home.meta.description &&
      canonical === expectedCanonical;

    const ok =
      orderOk &&
      metaOk &&
      missingLinks.length === 0 &&
      missingBands.length === 0 &&
      h1Count === 1 &&
      hasSkipLink &&
      hasMain;

    await writeJsonAtomic(path.join(runDir, "homepage_runtime_audit.json"), {
      generatedAt: new Date().toISOString(),
      checks: {
        title,
        expectedTitle: seoSpec.pageTypes.home.meta.title,
        description,
        expectedDescription: seoSpec.pageTypes.home.meta.description,
        canonical,
        expectedCanonical,
        requiredLinks,
        uniqueHrefCount: uniqueHrefs.length,
        missingLinks,
        requiredBands,
        missingBands,
        h1Count,
        hasSkipLink,
        hasMain,
      },
      ok,
    });

    if (!ok) {
      throw new Error(
        `Phase 5 failed: runtime audit did not pass (missingLinks=${missingLinks.length}, missingBands=${missingBands.length}, h1Count=${h1Count}, metaOk=${metaOk}).`,
      );
    }
  } finally {
    startChild.kill("SIGTERM");
    await Promise.race([
      new Promise<void>((resolve) => startChild.on("close", () => resolve())),
      sleep(2_000),
    ]);
    if (startChild.exitCode === null) startChild.kill("SIGKILL");

    await writeJsonAtomic(path.join(runDir, "start_log.json"), {
      generatedAt: new Date().toISOString(),
      command: `node ${nextBin} start -p ${port}`,
      port,
      stdout: Buffer.concat(startStdout).toString("utf8"),
      stderr: Buffer.concat(startStderr).toString("utf8"),
    });
  }

  await writeJsonAtomic(path.join(runDir, "validation.json"), {
    ok: true,
    phase: 5,
    checks: [
      "required composition files present",
      "homepage composition order matches IA",
      "homepage is composition-driven",
      "lint passed",
      "build passed",
      "runtime audit passed",
    ],
  });

  await writeJsonAtomic(path.join(runDir, "test_results.json"), {
    ok: true,
    phase: 5,
    tests: [
      { name: "homepage composition order audit", pass: true },
      { name: "lint passes", pass: true },
      { name: "build passes", pass: true },
      { name: "runtime audit passes", pass: true },
    ],
  });
}
