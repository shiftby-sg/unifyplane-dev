import { breadcrumbsForPath } from "./breadcrumbs";

export function breadcrumbJsonLd(pathname: string): unknown {
  const siteUrl = "https://unifyplane.dev";
  const crumbs = breadcrumbsForPath(pathname);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs
      .filter((c) => c.path !== "/")
      .map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: c.name,
        item: `${siteUrl}${c.path}`,
      })),
  };
}

export function pageJsonLd(args: {
  pathname: string;
  type: "WebPage" | "TechArticle" | "Article";
  headline: string;
  description: string;
}): unknown[] {
  const siteUrl = "https://unifyplane.dev";
  return [
    {
      "@context": "https://schema.org",
      "@type": args.type,
      headline: args.headline,
      description: args.description,
      url: `${siteUrl}${args.pathname}`,
    },
    args.pathname === "/" ? null : breadcrumbJsonLd(args.pathname),
  ].filter(Boolean) as unknown[];
}

