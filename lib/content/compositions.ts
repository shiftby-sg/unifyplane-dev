import fs from "node:fs/promises";
import path from "node:path";

export type HomeComposition = {
  version: string;
  sections: Array<
    | {
        id: string;
        kind: "hero";
        headline: string;
        subhead: string;
        primaryCta: { label: string; href: string };
        secondaryCta?: { label: string; href: string };
      }
    | {
        id: string;
        kind: "summary";
        title: string;
        description: string;
        href: string;
      }
    | {
        id: string;
        kind: "links";
        title: string;
        links: Array<{ label: string; href: string }>;
      }
  >;
};

async function loadJsonYaml<T>(relPath: string): Promise<T> {
  const abs = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(abs, "utf8");
  // Policy: our .yml compositions are YAML-JSON subset; fail closed if not parseable as JSON.
  return JSON.parse(raw) as T;
}

export async function loadHomeComposition(): Promise<HomeComposition> {
  return await loadJsonYaml<HomeComposition>("content/compositions/home.yml");
}

