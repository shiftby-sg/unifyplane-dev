import type { Metadata } from "next";
import path from "node:path";
import { loadMarkdownFile } from "../../lib/content/markdown";
import { pageMetadata } from "../../lib/seo/metadata";
import { JsonLd } from "../../components/JsonLd";
import { pageJsonLd } from "../../lib/seo/jsonld-page";
import { Prose } from "../../components/Prose";
import { PageShell } from "../../components/PageShell";
import { BoundaryStatus } from "../../components/BoundaryStatus";
import { RelatedLinks } from "../../components/RelatedLinks";

const mdPath = path.join(process.cwd(), "content/pages/current-readiness.md");

function addReadinessAnchors(html: string) {
  return html
    .replace(
      /<h2>Proven Now<\/h2>/,
      '<h2 id="proven-now">Proven Now</h2>',
    )
    .replace(
      /<h2>Implemented but Immature<\/h2>/,
      '<h2 id="implemented-but-immature">Implemented but Immature</h2>',
    )
    .replace(
      /<h2>Future but Grounded<\/h2>/,
      '<h2 id="future-but-grounded">Future but Grounded</h2>',
    );
}

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await loadMarkdownFile(mdPath);
  return pageMetadata({
    title: frontmatter.seoTitle,
    description: frontmatter.seoDescription,
    canonicalPath: "/current-readiness",
    ogType: "article",
  });
}

export default async function CurrentReadinessPage() {
  const doc = await loadMarkdownFile(mdPath);
  const html = addReadinessAnchors(doc.html);
  return (
    <PageShell pathname="/current-readiness">
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      <BoundaryStatus
        variant="proven"
        note="Readiness is presented as boundaries: proven now, implemented but immature, and future but grounded."
      />
      <Prose html={html} />
      <RelatedLinks links={doc.frontmatter.related} />
      <JsonLd
        data={pageJsonLd({
          pathname: "/current-readiness",
          type: "TechArticle",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
