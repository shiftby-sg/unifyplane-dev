import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo/metadata";
import { getWritingRegistry } from "../../lib/content/registries";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { pageJsonLd } from "../../lib/seo/jsonld-page";
import { PageShell } from "../../components/PageShell";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Writing",
    description: "Focused interpretations and explanations related to UnifyPlane.",
    canonicalPath: "/writing",
    ogType: "website",
  });
}

export default async function WritingPage() {
  const entries = await getWritingRegistry();
  return (
    <PageShell pathname="/writing">
      <h1>Writing</h1>
      {entries.length === 0 ? (
        <p>No writing published yet.</p>
      ) : (
        <ul>
          {entries.map((e) => (
            <li key={e.slug}>
              <Link href={`/writing/${e.slug}`}>{e.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <JsonLd
        data={pageJsonLd({
          pathname: "/writing",
          type: "WebPage",
          headline: "Writing",
          description: "Focused interpretations and explanations related to UnifyPlane.",
        })}
      />
    </PageShell>
  );
}
