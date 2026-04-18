import type { Metadata } from "next";
import path from "node:path";
import { notFound } from "next/navigation";
import { getFoundationsRegistry } from "../../../lib/content/registries";
import { loadMarkdownFile } from "../../../lib/content/markdown";
import { pageMetadata } from "../../../lib/seo/metadata";
import { Prose } from "../../../components/Prose";
import { JsonLd } from "../../../components/JsonLd";
import { pageJsonLd } from "../../../lib/seo/jsonld-page";
import { PageShell } from "../../../components/PageShell";

export async function generateStaticParams() {
  const entries = await getFoundationsRegistry();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entries = await getFoundationsRegistry();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) return {};
  const doc = await loadMarkdownFile(path.join(process.cwd(), entry.markdownPath));
  return pageMetadata({
    title: doc.frontmatter.seoTitle,
    description: doc.frontmatter.seoDescription,
    canonicalPath: `/foundations/${slug}`,
    ogType: "article",
  });
}

export default async function FoundationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entries = await getFoundationsRegistry();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) notFound();
  const doc = await loadMarkdownFile(path.join(process.cwd(), entry.markdownPath));
  return (
    <PageShell pathname={`/foundations/${slug}`}>
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      <Prose html={doc.html} />
      <JsonLd
        data={pageJsonLd({
          pathname: `/foundations/${slug}`,
          type: "TechArticle",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
