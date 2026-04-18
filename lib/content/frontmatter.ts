import { z } from "zod";

export const readinessEnum = z.enum([
  "proven",
  "implemented-immature",
  "future-grounded",
  "not-applicable",
]);

export const pageTypeEnum = z.enum([
  "canonical-public",
  "landing",
  "deep-doc",
  "writing",
  "composition",
]);

export const contentSectionEnum = z.enum([
  "pages",
  "components",
  "foundations",
  "writing",
]);

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().min(1),
    section: contentSectionEnum,
    pageType: pageTypeEnum,
    truthSource: z.array(z.string().min(1)).min(1),
    derivedFrom: z.array(z.string().min(1)).min(1),
    audience: z.array(z.string().min(1)).min(1),
    readiness: readinessEnum,
    ownsTopic: z.string().min(1),
    related: z.array(z.string().min(1)).default([]),
    seoTitle: z.string().min(1),
    seoDescription: z.string().min(1),
    showInNav: z.boolean(),
    showInToc: z.boolean(),
    maturityLabel: z.string().optional(),
    // Foundations deep-doc boundary semantics (required by SEO spec for /foundations/[slug])
    currentDemonstratedUse: z.string().optional(),
    intendedBroaderUse: z.string().optional(),
    futureScope: z.string().optional(),
    // Writing page metadata (required by SEO spec for /writing/[slug])
    publishedAt: z.string().optional(),
    author: z.string().optional(),
  })
  .strict();

export const validatedFrontmatterSchema = frontmatterSchema.superRefine((fm, ctx) => {
  if (fm.pageType === "deep-doc" && fm.section === "foundations") {
    if (!fm.currentDemonstratedUse) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentDemonstratedUse"], message: "Required for foundations deep-doc pages." });
    }
    if (!fm.intendedBroaderUse) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["intendedBroaderUse"], message: "Required for foundations deep-doc pages." });
    }
    if (!fm.futureScope) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["futureScope"], message: "Required for foundations deep-doc pages." });
    }
  }
  if (fm.pageType === "writing") {
    if (!fm.publishedAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["publishedAt"], message: "Required for writing pages." });
    }
    if (!fm.author) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["author"], message: "Required for writing pages." });
    }
  }
});

export type Frontmatter = z.infer<typeof validatedFrontmatterSchema>;
