# UnifyPlane Design System Spec

This document is the narrative companion to `contracts/specs/unifyplane.design.spec.json`.

It defines the design-system baseline for `unifyplane.dev` as a documentation-first, evidence-led site. The goal is not to create a generic product-marketing surface. The goal is to create a site that feels technically serious, bounded in claims, easy to scan, and trustworthy for readers who care about implementation reality, evidence, readiness, and control.

---

## 1. Purpose

The design system exists to keep the site:

* consistent
* fast
* mobile-first
* accessible
* SEO-safe
* easy to scan
* trustworthy for the primary audience

It must reinforce UnifyPlane as:

* an evidence-oriented continuity approach
* a bounded execution, evidence, and drift-reduction model
* a documentation-first technical narrative

It must not drift into:

* a startup-style landing page
* a generic SaaS product site
* a dashboard shell
* a hype AI site
* a broad enterprise-transformation promise

---

## 2. Audience and Reading Intent

The primary audience is:

* enterprise architecture and architecture-governance readers
* assurance, audit, and control-oriented technical readers
* security assurance and security architecture readers
* senior engineering, platform, and technical-governance readers

These readers need fast answers to:

* What problem is this site about?
* What kind of thing is UnifyPlane?
* Is it already real?
* What evidence exists?
* What is mature versus early?
* Where do controls, safety, and security fit?

The experience should therefore optimize for:

* scanning
* structured reading
* semantic hierarchy
* onward navigation
* visible maturity boundaries

It is not optimized for:

* entertainment
* decorative spectacle
* interaction-heavy exploration

---

## 3. Experience Principles

The design identity in one sentence:

**A fast, mobile-first, evidence-led technical documentation experience with quiet polish, strong typography, low visual noise, clear maturity boundaries, and continuity-first information scent.**

The site must feel like:

* serious technical documentation
* modern but restrained
* evidence-led
* continuity-first
* implementation-aware
* bounded in tone and claims

The site must not feel like:

* a startup landing page
* a dashboard product
* a concept blog
* a transformation-marketing site
* an AI-hype site

Core principles:

* problem before abstraction
* evidence before expansion
* one page, one job
* practical before theoretical
* distinctive but not doctrinal
* documentation, not product marketing

---

## 4. Governing UX Chain

The site structure should reinforce this sequence:

`practical problem recognition -> plain-language definition -> current readiness -> evidence -> operational parts -> deeper foundations`

Page-level reading flow should reinforce:

`problem -> definition -> current truth -> evidence -> operational reality -> deeper understanding`

This chain should shape:

* navigation order
* homepage section order
* CTA placement
* breadcrumbs
* related-page blocks
* internal linking

---

## 5. Information Architecture

Primary navigation:

* Home
* What is UnifyPlane
* Why it matters
* Current Readiness
* Evidence
* Components
* Foundations

Secondary navigation:

* Writing

Canonical components in v1:

* `unifyplane-core`
* `inspect-repo`
* `agent-runtime`

The components layer must not introduce audience lenses, disciplines, or organizational functions as if they were product components.

---

## 6. Layout System

Two page types are defined:

### Reading pages

Use for canonical narrative and long-form technical content.

Rules:

* single-column reading layout
* target reading width: `48rem` to `52rem`
* no multi-column prose
* optional TOC support on larger breakpoints

### Landing pages

Use for route summaries, preview cards, and onward navigation.

Rules:

* target outer width: `72rem` to `76rem`
* grid allowed for cards and summary blocks
* page should summarize and route, not duplicate full reading content

Spacing intent:

* mobile horizontal padding: `1rem`
* tablet horizontal padding: `1.5rem`
* desktop horizontal padding: `2rem`
* section gap: `4rem`
* heading-to-body gap: `0.75rem`
* paragraph gap: `1rem`
* card gap: `1.25rem`

---

## 7. Responsive Behavior

Breakpoint tokens:

```ts
{
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px"
}
```

Behavior by range:

### `< sm`

* single-column layout
* mobile drawer navigation
* TOC becomes jump menu
* cards stack vertically

### `sm` to `md`

* reading pages stay single-column
* landing grids may expand to 2 columns only if spacing remains generous

### `md` to `lg`

* desktop navigation begins
* optional side TOC on long pages
* landing grids may use up to 2 columns

### `lg` and above

* side TOC allowed on long-form pages
* landing grids may use 2 to 3 columns
* header remains restrained

---

## 8. Typography

Typography is the primary visual system.

Character:

* readable
* structured
* calm
* technical without being code-heavy

Font families:

* Sans: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
* Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

Portable weight scale:

* Regular: `400`
* Medium: `500`
* Semibold: `600`
* Bold: `700`

Recommended type scale:

* `H1`: `2.25rem` to `3rem`, line-height `1.1` to `1.2`, weight `700`
* `H2`: `1.5rem` to `2rem`, line-height `1.15` to `1.25`, weight `600`
* `H3`: `1.125rem` to `1.25rem`, line-height `1.2` to `1.3`, weight `600`
* `Body`: `1rem` to `1.125rem`, line-height `1.6` to `1.75`, weight `400`
* `Small`: `0.875rem`, line-height `1.4` to `1.5`, weight `400`

Emphasis rules:

* use bold for high-signal terms
* use muted text for secondary explanation
* use mono only for file names, route names, identifiers, and component names

Avoid:

* excessive italics
* dense bullet walls
* too many inline status pills
* colorful inline emphasis everywhere

---

## 9. Color and Token Contract

Color supports structure and semantics. It is not the main source of brand identity.

Theme policy for v1:

* light mode only
* dark mode deferred
* no theme toggle

Palette groups:

* neutral
* accent
* semantic readiness states

Token contract:

* palette keys are the source of truth
* CSS variable aliases must be derived from the token contract, not invented ad hoc
* surface and border tokens must resolve to named palette entries
* semantic readiness colors may only be used where readiness meaning is also visible in text or labels

Core alias mapping:

* `bg` -> `neutral.background`
* `surface` -> `neutral.surface`
* `surface-subtle` -> `neutral.surfaceSubtle`
* `border` -> `neutral.border`
* `text` -> `neutral.text`
* `text-muted` -> `neutral.textMuted`
* `accent` -> `accent.primary`
* `accent-hover` -> `accent.primaryHover`
* `accent-subtle` -> `accent.primarySubtle`
* `accent-text` -> `accent.primaryText`

Usage rules:

* one restrained accent family only
* border-first surfaces
* minimal shadows
* avoid decorative flourishes
* use semantic color mainly for readiness and boundary states

---

## 10. Surfaces

Surface style:

* border-first
* minimal shadow
* restrained radius

Radius tokens:

* card: `12px`
* button: `10px`
* input: `10px`
* pill: `999px`

Border tokens should be described structurally, not as inline CSS strings:

* default border -> `1px solid neutral.border`
* strong border -> `1px solid neutral.textMuted`

This keeps the design contract implementation-friendly across CSS, tokens, and future tooling.

---

## 11. Components

Global components:

* `site-header`
* `site-footer`
* `mobile-nav-drawer`
* `breadcrumbs`
* `side-toc`
* `jump-menu`

Content components:

* `hero`
* `section-intro`
* `evidence-card`
* `readiness-band`
* `boundary-note`
* `route-card`
* `component-card`
* `foundation-card`
* `related-pages`
* `quote-callout`

Interaction scope for v1 is intentionally small:

* navigation
* mobile drawer
* TOC
* anchor links

Deferred:

* site search

---

## 12. Readiness Semantics

Readiness semantics are required across the site.

Categories:

* `Proven Now`: supported by current evidence and implementation reality
* `Implemented but Immature`: real implementation exists, but maturity is uneven or early
* `Future but Grounded`: direction is grounded, but not mature enough to overstate

Rules:

* every major claim should map implicitly or explicitly to a readiness boundary
* future direction must not be blended with current truth
* evidence pages must distinguish what is proved from what is not yet proved

Color must not be the sole carrier of readiness meaning.

---

## 13. Accessibility and Performance

Accessibility baseline:

* target WCAG 2.2 AA
* semantic heading hierarchy required
* visible keyboard focus required
* all nav and TOC interactions keyboard accessible
* minimum body contrast must meet AA
* tap targets should be at least `44x44` CSS pixels
* skip link required
* reduced-motion preference respected

Performance rules:

* prefer static rendering
* keep JS minimal on reading pages
* defer non-essential interactivity
* avoid heavy animation
* avoid oversized hero media
* prioritize typography and content over decorative assets

---

## 14. Content Rules

Homepage must:

* summarize and route
* signal that UnifyPlane is already real but bounded in maturity
* show that controls, safety, and security matter
* keep AI as an urgency amplifier rather than the core identity

Homepage must not:

* fully own detailed readiness interpretation
* fully own component detail
* fully own deep foundations

Components page must include only:

* `unifyplane-core`
* `inspect-repo`
* `agent-runtime`

Foundations v1 priorities:

* Continuity
* Proof
* Drift
* Evidence
* Change
* Impact

---

## 15. V1 Fixed Decisions

The following are fixed for v1 unless intentionally changed:

* light mode only
* one restrained accent family
* border-first surfaces
* minimal shadows
* single-column canonical reading pages
* limited interactivity
* Writing remains optional and secondary
