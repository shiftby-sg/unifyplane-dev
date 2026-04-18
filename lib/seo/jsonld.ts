export function siteJsonLd(): unknown[] {
  const siteUrl = "https://unifyplane.dev";
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "UnifyPlane",
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "UnifyPlane",
      url: siteUrl,
    },
  ];
}

