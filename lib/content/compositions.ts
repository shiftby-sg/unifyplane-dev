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
        coreSignal: string;
        identity: string;
        primaryCta: { label: string; href: string };
        secondaryCta?: { label: string; href: string };
      }
    | {
        id: string;
        kind: "recognition";
        title: string;
        groups: Array<{ lead: string; body?: string; list?: string[]; emphasis?: "anchor" }>;
      }
    | {
        id: "what";
        kind: "summary";
        title: string;
        blocks: string[];
        href: string;
      }
    | {
        id: "why" | "readiness" | "evidence" | "components" | "foundations";
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
  coreSignal: z.string().min(1),
  identity: z.string().min(1),
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

const HomeRecognitionSectionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("recognition"),
  title: z.string().min(1),
  groups: z
    .array(
      z
        .object({
          lead: z.string().min(1),
          body: z.string().min(1).optional(),
          list: z.array(z.string().min(1)).min(1).optional(),
          emphasis: z.literal("anchor").optional()
        })
        .superRefine((value, ctx) => {
          if (!value.body && !value.list) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Recognition group must include body or list."
            });
          }
        })
    )
    .length(5)
});

const HomeDefinitionSummarySectionSchema = z.object({
  id: z.literal("what"),
  kind: z.literal("summary"),
  title: z.string().min(1),
  blocks: z.array(z.string().min(1)).min(2).max(4),
  href: z.string().min(1).startsWith("/")
});

const HomeSummarySectionSchema = z.object({
  id: z.enum(["why", "readiness", "evidence", "components", "foundations"]),
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

const jsonCache = new Map<string, Promise<unknown>>();

const HomeCompositionSchema = z
  .object({
    version: z.string().min(1),
    sections: z.array(
      z.union([
        HomeHeroSectionSchema,
        HomeRecognitionSectionSchema,
        HomeDefinitionSummarySectionSchema,
        HomeSummarySectionSchema,
        HomeLinksSectionSchema
      ])
    )
  })
  .superRefine((value, ctx) => {
    const heroCount = value.sections.filter((section) => section.kind === "hero").length;
    const linksCount = value.sections.filter((section) => section.kind === "links").length;
    const recognitionCount = value.sections.filter((section) => section.kind === "recognition").length;

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

    if (recognitionCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Home composition must contain exactly one recognition section; received ${recognitionCount}.`,
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
  const cached = jsonCache.get(relPath);
  if (cached) {
    return cached as Promise<T>;
  }

  const abs = path.join(process.cwd(), relPath);
  const promise = fs
    .readFile(abs, "utf8")
    .then((raw) => {
      // Policy: our .yml compositions are YAML-JSON subset; fail closed if not parseable as JSON.
      const normalized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
      return JSON.parse(normalized) as T;
    })
    .catch((error) => {
      jsonCache.delete(relPath);
      throw error;
    });

  jsonCache.set(relPath, promise);
  return promise;
}

export async function loadHomeComposition(): Promise<HomeComposition> {
  const parsed = await loadJsonYaml<unknown>("content/compositions/home.yml");
  return HomeCompositionSchema.parse(parsed) as HomeComposition;
}

