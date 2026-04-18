import type { Metadata } from "next";
import "./globals.css";
import { siteJsonLd } from "../lib/seo/jsonld";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://unifyplane.dev"),
  title: {
    default: "UnifyPlane",
    template: "%s | UnifyPlane",
  },
  description:
    "UnifyPlane is an evidence-oriented continuity approach for helping organizations keep change manageable and runtime behavior explainable over time.",
  alternates: {
    canonical: "https://unifyplane.dev",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skipLink">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">
          <div
            style={{
              maxWidth: "var(--layout-content)",
              margin: "0 auto",
              padding: "var(--space-8) var(--space-4)",
            }}
          >
            {children}
          </div>
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
      </body>
    </html>
  );
}
