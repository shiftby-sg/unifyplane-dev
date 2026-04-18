import { PageShell } from "../components/PageShell";
import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo/metadata";
import { JsonLd } from "../components/JsonLd";
import { pageJsonLd } from "../lib/seo/jsonld-page";
import { loadHomeComposition } from "../lib/content/compositions";
import { HomeCompositionView } from "../components/HomeComposition";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "UnifyPlane",
    description:
      "UnifyPlane is an evidence-oriented continuity approach for helping organizations keep change manageable and runtime behavior explainable over time.",
    canonicalPath: "/",
    ogType: "website",
  });
}

export default async function HomePage() {
  const composition = await loadHomeComposition();
  return (
    <PageShell pathname="/">
      <HomeCompositionView composition={composition} />
      <JsonLd
        data={pageJsonLd({
          pathname: "/",
          type: "WebPage",
          headline: "UnifyPlane",
          description:
            "UnifyPlane is an evidence-oriented continuity approach for helping organizations keep change manageable and runtime behavior explainable over time.",
        })}
      />
    </PageShell>
  );
}
