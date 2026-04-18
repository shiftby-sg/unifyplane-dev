import type { Metadata } from "next";
import path from "node:path";
import { loadMarkdownFile } from "../../lib/content/markdown";
import { pageMetadata } from "../../lib/seo/metadata";
import { JsonLd } from "../../components/JsonLd";
import { pageJsonLd } from "../../lib/seo/jsonld-page";
import { Prose } from "../../components/Prose";
import { PageShell } from "../../components/PageShell";
import { RelatedLinks } from "../../components/RelatedLinks";

const mdPath = path.join(process.cwd(), "content/pages/why-it-matters.md");

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await loadMarkdownFile(mdPath);
  return pageMetadata({
    title: frontmatter.seoTitle,
    description: frontmatter.seoDescription,
    canonicalPath: "/why-it-matters",
    ogType: "article",
  });
}

export default async function WhyItMattersPage() {
  const doc = await loadMarkdownFile(mdPath);
  return (
    <PageShell pathname="/why-it-matters">
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      <Prose html={doc.html} />
      <RelatedLinks links={doc.frontmatter.related} />
      <JsonLd
        data={pageJsonLd({
          pathname: "/why-it-matters",
          type: "TechArticle",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
