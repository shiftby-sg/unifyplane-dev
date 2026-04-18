import type { MetadataRoute } from "next";
import { getComponentsRegistry, getFoundationsRegistry, getWritingRegistry } from "../lib/content/registries";

function url(pathname: string): string {
  return `https://unifyplane.dev${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const components = await getComponentsRegistry();
  const foundations = await getFoundationsRegistry();
  const writing = await getWritingRegistry();

  const staticRoutes = [
    "/",
    "/what-is-unifyplane",
    "/why-it-matters",
    "/current-readiness",
    "/evidence",
    "/components",
    "/foundations",
    "/writing",
  ];

  const routes = [
    ...staticRoutes,
    ...components.map((c) => `/components/${c.slug}`),
    ...foundations.map((f) => `/foundations/${f.slug}`),
    ...writing.map((w) => `/writing/${w.slug}`),
  ];

  const now = new Date();
  return routes.map((r) => ({
    url: url(r),
    lastModified: now,
  }));
}

