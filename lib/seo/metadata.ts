import type { Metadata } from "next";

export function pageMetadata(args: {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: "website" | "article";
}): Metadata {
  const siteUrl = "https://unifyplane.dev";
  const canonical = `${siteUrl}${args.canonicalPath}`;
  return {
    title: args.title,
    description: args.description,
    alternates: { canonical },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      type: args.ogType,
      siteName: "UnifyPlane",
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
    },
  };
}

