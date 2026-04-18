# Website Design System Spec

## 1. Purpose

This document defines the design system baseline for `unifyplane.dev`.

The design system exists to keep the site:

* consistent
* fast
* mobile-optimized
* SEO-safe
* easy to scan
* trustworthy for the primary audience

It should reinforce the current IA and canonical positioning of UnifyPlane as an evidence-oriented continuity approach, not as a product-marketing site, hype concept, or abstract framework catalog. :contentReference[oaicite:2]{index=2}

---

## 2. Design Intent

The site should feel like:

* a serious technical documentation site
* modern but restrained
* evidence-led
* continuity-first
* implementation-aware
* bounded in tone and claims

It should not feel like:

* a startup landing page
* a dashboard product
* a concept blog
* a broad transformation-marketing site
* an AI-hype site

### Design identity in one sentence

**A fast, mobile-first, evidence-led technical documentation experience with quiet modern polish, strong typography, low visual noise, clear maturity boundaries, and continuity-first information scent.**

---

## 3. Experience Goals

### 3.1 Signal goals

The interface should support:

* hero signal in under 3 seconds
* homepage section-level understanding in under 10 seconds
* foundation-page first-pass comprehension in under 2 minutes

### 3.2 Trust goals

Trust should come from:

* structure
* clarity
* visible maturity boundaries
* low noise
* stable page patterns
* strong typography
* evidence-first presentation

### 3.3 Reading goals

The site is primarily a reading and understanding system.

Design must optimize for:

* scanning
* structured reading
* conceptual clarity
* onward navigation
* semantic hierarchy

Not for:

* entertainment
* highly interactive exploration
* decorative visual spectacle

---

## 4. Audience Fit

The design should be optimized first for:

* enterprise architecture and architecture-governance readers
* assurance, audit, and control-oriented technical readers
* security assurance and security architecture readers
* senior engineering, platform, and technical-governance readers :contentReference[oaicite:3]{index=3}

These readers want to know quickly:

* what problem this site is about
* what kind of thing UnifyPlane is
* whether it is already real
* where evidence exists
* what is mature vs early
* where controls, safety, and security fit

So the UI should feel:

* clear
* bounded
* technically legible
* serious
* evidence-aware
* low-noise

---

## 5. Governing UX Chain

The site structure and page templates must reinforce this chain:

**practical problem recognition → plain-language definition → current readiness → evidence → operational parts → deeper foundations** :contentReference[oaicite:4]{index=4}

Page-to-page reading flow should reinforce:

**problem → definition → current truth → evidence → operational reality → deeper understanding** :contentReference[oaicite:5]{index=5}

This chain should influence:

* navigation order
* homepage section order
* CTA placement
* breadcrumbs
* related-page blocks
* internal linking

---

## 6. Core Design Principles

### 6.1 Problem before abstraction

Readers should meet the practical enterprise problem before deeper conceptual material. :contentReference[oaicite:6]{index=6}

### 6.2 Evidence before expansion

UI should help distinguish:

* what is proven now
* what is implemented but immature
* what is future but grounded :contentReference[oaicite:7]{index=7}

### 6.3 One page, one job

Visual design should preserve page-role clarity.
No page should visually or structurally try to be everything. :contentReference[oaicite:8]{index=8}

### 6.4 Practical before theoretical

UI should privilege enterprise-recognizable language, clear sections, and readable content over abstract visual concepts. :contentReference[oaicite:9]{index=9}

### 6.5 Distinctive, but not doctrinal

The site should feel differentiated without forcing internal doctrine language too early. :contentReference[oaicite:10]{index=10}

---

## 7. Visual Style

## 7.1 Tone

Visual tone should be:

* quiet
* technical
* modern
* confident
* restrained

## 7.2 Avoid

Avoid:

* glossy gradients dominating content
* large decorative hero graphics
* heavy animation
* overdesigned enterprise chrome
* “AI aesthetic” clichés
* dashboard-like framing for narrative pages

## 7.3 Use

Prefer:

* clean geometry
* strong typography
* generous whitespace
* subtle borders
* restrained depth
* calm accent usage
* stable page patterns

---

## 8. Layout System

## 8.1 Page width

### Long-form canonical pages
Recommended reading width:
* `max-width: 48rem to 52rem`

### Landing pages and homepage sections
Recommended outer content width:
* `max-width: 72rem to 76rem`

### Mobile
* horizontal padding should remain generous enough for reading
* no cramped edge-to-edge body copy

## 8.2 Vertical rhythm

Use strong, predictable spacing.

Recommended rhythm:
* large section spacing
* moderate heading-to-body spacing
* readable paragraph spacing
* generous breathing room between section blocks

## 8.3 Grid usage

Use grid for:

* homepage section layouts
* landing-page cards
* explore-next blocks
* component/foundation landing summaries

Use single-column reading layout for:

* Why it matters
* What is UnifyPlane
* Current Readiness
* Evidence
* component pages
* foundation pages

---

## 9. Typography System

Typography is the main design system.

## 9.1 Character

Typography should feel:

* readable
* structured
* calm
* technical without being code-heavy

## 9.2 Type scale

Recommended baseline:

* `H1`: 2.25rem to 3rem
* `H2`: 1.5rem to 2rem
* `H3`: 1.125rem to 1.25rem
* `Body`: 1rem to 1.125rem
* `Small`: 0.875rem

Use tighter headline line-height and comfortable body line-height.

## 9.3 Reading constraints

* avoid overly wide paragraphs
* avoid small body text
* avoid dense walls of bullet points
* preserve scan-friendly hierarchy

## 9.4 Emphasis rules

Use:

* **bold** for high-signal terms
* muted text for secondary explanation
* code style only for file names, route names, or component identifiers

Avoid:

* excessive italics
* too many inline status pills
* colorful inline emphasis everywhere

---

## 10. Color System

## 10.1 Color role

Color should support:

* structure
* interaction
* semantic boundaries
* status clarity
* section grouping

Color should not be the main source of site identity.

## 10.2 Palette character

Recommended palette direction:

* neutral foundation
* one restrained primary accent
* one subtle secondary accent
* limited semantic state colors

Suggested tone:
* slate / stone / zinc-like neutral base
* muted blue or deep cyan accent
* warm gray support tones

## 10.3 Semantic colors

Need restrained status colors for:

* Proven Now
* Implemented but Immature
* Future but Grounded
* informational notes
* caution / boundary notes

These should be visible but not loud.

---

## 11. Spacing Tokens

Recommended spacing scale:

* `space-1`: 4px
* `space-2`: 8px
* `space-3`: 12px
* `space-4`: 16px
* `space-5`: 20px
* `space-6`: 24px
* `space-8`: 32px
* `space-10`: 40px
* `space-12`: 48px
* `space-16`: 64px
* `space-20`: 80px

Use spacing consistently across:
* sections
* headings
* cards
* nav
* TOC
* CTA blocks

---

## 12. Radius, Border, and Shadow Tokens

### Radius
Recommended:
* small surfaces: `8px`
* cards / panels: `12px`
* large feature sections: `16px`

### Borders
Use borders more than shadows.

Recommended border behavior:
* subtle neutral border for cards and status blocks
* slightly stronger border for active nav or highlighted callouts

### Shadows
Use minimal shadows.

Recommended:
* small shadow only where needed for separation
* avoid large floating-card shadows
* long-form pages should rely mostly on spacing and borders

---

## 13. Core Reusable Components

## 13.1 Site Header

Must include:
* brand / site title
* primary nav
* mobile nav trigger
* optional theme toggle later

Behavior:
* lightweight
* readable
* no oversized sticky chrome

## 13.2 Site Footer

Must include:
* section links
* Writing link as secondary
* optional source/about links later

## 13.3 Hero Block

Used on Home.

Must include:
* one high-signal H1
* one clarifying subhead
* one short support sentence
* 2 to 3 CTAs max

Should not include:
* rotating content
* large decorative media
* long stacked paragraphs

## 13.4 Section Summary Block

Used on homepage.

Pattern:
* heading
* 1 short lead
* compact supporting bullets or list
* one onward CTA

## 13.5 Section Card

Used on:
* Components landing
* Foundations landing
* Explore deeper blocks

Style:
* subtle border
* restrained radius
* low/no shadow
* strong heading
* short explanation

## 13.6 Boundary / Status Block

This is a key component.

Used for:
* current maturity notes
* evidence limitations
* “do not overstate” notes
* readiness buckets
* current-vs-future distinctions

Style:
* tinted neutral or semantic background
* clear label
* compact content
* visually distinct from body paragraphs

## 13.7 Table of Contents

Used for:
* long-form pages
* component pages
* foundation pages

Desktop:
* side TOC or floating TOC region

Mobile:
* condensed jump menu or collapsible TOC

TOC should remain quiet and useful.

## 13.8 Related Pages / Read Next

Used at page bottom.

Should reinforce:
* next logical page in chain
* parent landing page
* closely related page

---

## 14. Page Template Rules

## 14.1 Home Template

Section order should follow IA:

1. Hero
2. Why this matters in practice
3. What UnifyPlane is
4. Current Readiness
5. Evidence first
6. Components
7. Explore deeper 

Rule:
Home summarizes and routes.
It should not fully own deep readiness, evidence, or foundation content. :contentReference[oaicite:12]{index=12}

## 14.2 Canonical Narrative Template

Use for:
* What is UnifyPlane
* Why it matters
* Current Readiness
* Evidence

Structure:
* H1
* short lead
* section hierarchy
* status/boundary notes where needed
* related-page footer

## 14.3 Component Template

Use for:
* UnifyPlane Core
* Agent Runtime
* Inspect Repo

Structure:
* what it is
* what role it plays
* what is already real
* current strengths
* current boundaries
* short version

## 14.4 Foundation Template

Use for:
* Continuity
* Proof
* Drift
* Evidence
* Change
* Impact

Structure:
* definition
* why it matters
* plain-language explanation
* current-state grounding
* honest boundary
* short version

---

## 15. Mobile Rules

## 15.1 Mobile priorities

Mobile must optimize for:

* immediate recognition
* clear first screen
* readable copy
* clean section stacking
* easy tap navigation
* fast route access

## 15.2 Mobile layout rules

* no side-by-side text columns
* no horizontal overflow
* cards stack vertically
* TOC collapses cleanly
* nav opens in simple drawer/sheet
* CTA targets remain thumb-friendly

## 15.3 Mobile reading rules

* preserve line length
* maintain generous line-height
* avoid giant padding that wastes vertical space
* avoid sticky UI that consumes too much screen height

---

## 16. Performance Rules

The design system must help performance, not fight it.

## 16.1 Required

* text-first above the fold
* minimal image dependence
* minimal client JS
* limited interaction islands
* no decorative heavy animation
* stable typography loading
* static page rendering by default

## 16.2 Avoid

* client-rendered content pages
* image-heavy heroes
* animated landing-page gimmicks
* oversized icon systems
* unnecessary script dependencies

---

## 17. SEO-Safe UI Rules

## 17.1 Semantic page structure

Each page should have:
* one H1
* strong H2/H3 hierarchy
* readable lead paragraph
* visible related-page links

## 17.2 Discoverability

The UI should make it obvious:
* what page the user is on
* what the page is about
* what comes next
* how the page relates to the broader site

## 17.3 Avoid hidden primary content

Avoid hiding primary page content behind:
* tabs
* accordions
* client-only views

unless there is a strong usability reason

---

## 18. Content and UI Alignment Rules

The writing voice is:
* serious
* evidence-led
* technically legible
* bounded
* non-hype

So the UI must not feel:
* playful
* salesy
* flashy
* over-animated
* decorative-first

Design and writing should feel like one system.

---

## 19. Design Tokens to Define in Code Early

Before implementation proceeds deeply, define:

* color tokens
* spacing tokens
* typography tokens
* radius tokens
* border tokens
* shadow tokens
* layout width tokens
* semantic status tokens
* z-index policy
* breakpoint tokens

---

## 20. Suggested Token Model

```ts
export const tokens = {
  colors: {
    bg: "...",
    fg: "...",
    muted: "...",
    border: "...",
    primary: "...",
    secondary: "...",
    proven: "...",
    immature: "...",
    future: "...",
    info: "...",
    caution: "..."
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px"
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px"
  },
  layout: {
    content: "52rem",
    wide: "76rem"
  }
}