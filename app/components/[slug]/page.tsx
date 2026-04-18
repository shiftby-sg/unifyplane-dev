import type { Metadata } from "next";
import path from "node:path";
import { notFound } from "next/navigation";
import { getComponentsRegistry } from "../../../lib/content/registries";
import { loadMarkdownFile } from "../../../lib/content/markdown";
import { pageMetadata } from "../../../lib/seo/metadata";
import { Prose } from "../../../components/Prose";
import { JsonLd } from "../../../components/JsonLd";
import { pageJsonLd } from "../../../lib/seo/jsonld-page";
import { PageShell } from "../../../components/PageShell";
import { BoundaryStatus, type BoundaryVariant } from "../../../components/BoundaryStatus";

function maturityToVariant(maturityLabel?: string): BoundaryVariant | null {
  if (!maturityLabel) return null;
  if (maturityLabel === "proven") return "proven";
  if (maturityLabel === "implemented-immature") return "implemented-immature";
  if (maturityLabel === "future-grounded") return "future-grounded";
  return null;
}

export async function generateStaticParams() {
  const entries = await getComponentsRegistry();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entries = await getComponentsRegistry();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) return {};
  const doc = await loadMarkdownFile(path.join(process.cwd(), entry.markdownPath));
  return pageMetadata({
    title: doc.frontmatter.seoTitle,
    description: doc.frontmatter.seoDescription,
    canonicalPath: `/components/${slug}`,
    ogType: "article",
  });
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entries = await getComponentsRegistry();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) notFound();
  const doc = await loadMarkdownFile(path.join(process.cwd(), entry.markdownPath));
  const maturityVariant = maturityToVariant(doc.frontmatter.maturityLabel);
  return (
    <PageShell pathname={`/components/${slug}`}>
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      {maturityVariant ? (
        <BoundaryStatus
          variant={maturityVariant}
          note="Component maturity is shown as a boundary. Do not overstate scope beyond demonstrated implementation and evidence."
        />
      ) : null}
      <Prose html={doc.html} />
      <JsonLd
        data={pageJsonLd({
          pathname: `/components/${slug}`,
          type: "TechArticle",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
