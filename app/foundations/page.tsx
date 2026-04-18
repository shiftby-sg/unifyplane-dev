import type { Metadata } from "next";
import path from "node:path";
import { loadMarkdownFile } from "../../lib/content/markdown";
import { pageMetadata } from "../../lib/seo/metadata";
import { JsonLd } from "../../components/JsonLd";
import { pageJsonLd } from "../../lib/seo/jsonld-page";
import { Prose } from "../../components/Prose";
import { PageShell } from "../../components/PageShell";
import { getFoundationsRegistry } from "../../lib/content/registries";
import Link from "next/link";

const mdPath = path.join(process.cwd(), "content/foundations/index.md");

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await loadMarkdownFile(mdPath);
  return pageMetadata({
    title: frontmatter.seoTitle,
    description: frontmatter.seoDescription,
    canonicalPath: "/foundations",
    ogType: "website",
  });
}

export default async function FoundationsPage() {
  const doc = await loadMarkdownFile(mdPath);
  const entries = await getFoundationsRegistry();
  return (
    <PageShell pathname="/foundations">
      <h1>{doc.frontmatter.title}</h1>
      <p>{doc.frontmatter.description}</p>
      <Prose html={doc.html} />
      <section aria-label="Foundation pages" style={{ marginTop: "var(--space-8)" }}>
        <h2>Foundation pages</h2>
        <ul>
          {entries.map((e) => (
            <li key={e.slug}>
              <Link href={`/foundations/${e.slug}`}>{e.title}</Link>
            </li>
          ))}
        </ul>
      </section>
      <JsonLd
        data={pageJsonLd({
          pathname: "/foundations",
          type: "WebPage",
          headline: doc.frontmatter.seoTitle,
          description: doc.frontmatter.seoDescription,
        })}
      />
    </PageShell>
  );
}
