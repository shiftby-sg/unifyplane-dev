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

const mdPath = path.join(process.cwd(), "content/pages/evidence.md");

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await loadMarkdownFile(mdPath);
  return pageMetadata({
    title: frontmatter.seoTitle,
    description: frontmatter.seoDescription,
    canonicalPath: "/evidence",
    ogType: "article",
  });
}

export default async function EvidencePage() {
  const doc = await loadMarkdownFile(mdPath);
  return (
    <PageShell pathname="/evidence">
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      <BoundaryStatus
        variant="implemented-immature"
        note="Evidence is shown as current artifacts and what they prove. Do not treat evidence claims as maturity claims."
      />
      <Prose html={doc.html} />
      <RelatedLinks links={doc.frontmatter.related} />
      <JsonLd
        data={pageJsonLd({
          pathname: "/evidence",
          type: "TechArticle",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
