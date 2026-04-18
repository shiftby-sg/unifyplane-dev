import { PageShell } from "../components/PageShell";
import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo/metadata";
import { JsonLd } from "../components/JsonLd";
import { pageJsonLd } from "../lib/seo/jsonld-page";
import { loadHomeComposition } from "../lib/content/compositions";
import { HomeCompositionView } from "../components/HomeComposition";
import { HOME_DESCRIPTION, HOME_JSONLD_HEADLINE, HOME_TITLE } from "../lib/seo/home";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonicalPath: "/",
    ogType: "website",
  });
}

export default async function HomePage() {
  const composition = await loadHomeComposition();
  return (
    <PageShell pathname="/" width="wide">
      <HomeCompositionView composition={composition} />
      <JsonLd
        data={pageJsonLd({
          pathname: "/",
          type: "WebPage",
          headline: HOME_JSONLD_HEADLINE,
          description: HOME_DESCRIPTION,
        })}
      />
    </PageShell>
  );
}
