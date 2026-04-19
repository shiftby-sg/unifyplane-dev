import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

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

const HomeHeroSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("hero"),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  primaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1).startsWith("/")
  }),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1).startsWith("/")
    })
    .optional()
});

const HomeSummarySectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("summary"),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1).startsWith("/")
});

const HomeLinksSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("links"),
  title: z.string().min(1),
  links: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1).startsWith("/")
    })
  )
});

const REQUIRED_SUMMARY_IDS = [
  "what",
  "why",
  "readiness",
  "evidence",
  "components",
  "foundations"
] as const;

const HomeCompositionSchema = z
  .object({
    version: z.string().min(1),
    sections: z.array(
      z.union([
        HomeHeroSectionSchema,
        HomeSummarySectionSchema,
        HomeLinksSectionSchema
      ])
    )
  })
  .superRefine((value, ctx) => {
    const heroCount = value.sections.filter((section) => section.kind === "hero").length;
    const linksCount = value.sections.filter((section) => section.kind === "links").length;

    if (heroCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Home composition must contain exactly one hero section; received ${heroCount}.`,
        path: ["sections"]
      });
    }

    if (linksCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Home composition must contain exactly one links section; received ${linksCount}.`,
        path: ["sections"]
      });
    }

    const seen = new Set<string>();
    for (const [i, section] of value.sections.entries()) {
      if (seen.has(section.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate home section id: ${section.id}`,
          path: ["sections", i, "id"]
        });
      } else {
        seen.add(section.id);
      }
    }

    for (const id of REQUIRED_SUMMARY_IDS) {
      const section = value.sections.find((s) => s.kind === "summary" && s.id === id);
      if (!section) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing required summary section: ${id}`,
          path: ["sections"]
        });
      }
    }
  });

async function loadJsonYaml<T>(relPath: string): Promise<T> {
  const abs = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(abs, "utf8");
  // Policy: our .yml compositions are YAML-JSON subset; fail closed if not parseable as JSON.
  return JSON.parse(raw) as T;
}

export async function loadHomeComposition(): Promise<HomeComposition> {
  const parsed = await loadJsonYaml<unknown>("content/compositions/home.yml");
  return HomeCompositionSchema.parse(parsed) as HomeComposition;
}

