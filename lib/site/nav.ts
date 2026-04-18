export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: ReadonlyArray<NavItem> = [
  { label: "Home", href: "/" },
  { label: "What is UnifyPlane", href: "/what-is-unifyplane" },
  { label: "Why it matters", href: "/why-it-matters" },
  { label: "Current Readiness", href: "/current-readiness" },
  { label: "Evidence", href: "/evidence" },
  { label: "Components", href: "/components" },
  { label: "Foundations", href: "/foundations" },
];

export const secondaryNav: ReadonlyArray<NavItem> = [{ label: "Writing", href: "/writing" }];

