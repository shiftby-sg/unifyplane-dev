Yes — here is a revised **Website Design System Spec v2** with the missing implementation-level precision added.

It preserves the original intent: evidence-led, continuity-first, documentation-first, restrained, fast, and trustworthy for the primary technical audience. It also tightens the areas that were still underdefined: accessibility, breakpoints, boundary semantics, component states, token completeness, and v1 scope decisions.   

---

# Website Design System Spec v2

## 1. Purpose

This document defines the implementation-ready design system baseline for `unifyplane.dev`.

The design system exists to keep the site:

* consistent
* fast
* mobile-optimized
* SEO-safe
* accessible
* easy to scan
* trustworthy for the primary audience

It must reinforce the IA and canonical positioning of UnifyPlane as an evidence-oriented continuity approach, not as a product-marketing site, hype concept, abstract framework catalog, or dashboard-like application shell.  

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

The design is optimized first for:

* enterprise architecture and architecture-governance readers
* assurance, audit, and control-oriented technical readers
* security assurance and security architecture readers
* senior engineering, platform, and technical-governance readers 

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

**practical problem recognition → plain-language definition → current readiness → evidence → operational parts → deeper foundations** 

Page-to-page reading flow should reinforce:

**problem → definition → current truth → evidence → operational reality → deeper understanding** 

This chain must influence:

* navigation order
* homepage section order
* CTA placement
* breadcrumbs
* related-page blocks
* internal linking

---

## 6. v1 Scope Decisions

These decisions are fixed for v1 unless intentionally changed later.

### 6.1 Theme policy

* **Light mode only in v1**
* dark mode is deferred
* theme toggle is not included in the initial release

### 6.2 Visual identity policy

* use **one restrained accent family only**
* use **border-first surfaces**
* use **minimal shadows**
* avoid decorative brand flourishes

### 6.3 Layout policy

* canonical narrative pages are **single-column reading pages**
* landing pages may use grid for route summaries
* deep reading pages should not use multi-column prose layouts

### 6.4 Interaction policy

* interactivity is limited to:

  * nav
  * mobile drawer
  * TOC
  * anchor links
  * optional search later

---

## 7. Core Design Principles

### 7.1 Problem before abstraction

Readers should meet the practical enterprise problem before deeper conceptual material. 

### 7.2 Evidence before expansion

UI should distinguish:

* what is proven now
* what is implemented but immature
* what is future but grounded 

### 7.3 One page, one job

Visual design must preserve page-role clarity.
No page should visually or structurally try to be everything. 

### 7.4 Practical before theoretical

UI should privilege recognizable enterprise language, clear sections, and readable content over abstract visual concepts. 

### 7.5 Distinctive, but not doctrinal

The site should feel differentiated without forcing internal doctrine language too early. 

---

## 8. Visual Style

### 8.1 Tone

Visual tone should be:

* quiet
* technical
* modern
* confident
* restrained

### 8.2 Avoid

Avoid:

* glossy gradients dominating content
* large decorative hero graphics
* heavy animation
* overdesigned enterprise chrome
* “AI aesthetic” clichés
* dashboard-like framing for narrative pages

### 8.3 Prefer

Prefer:

* clean geometry
* strong typography
* generous whitespace
* subtle borders
* restrained depth
* calm accent usage
* stable page patterns

---

## 9. Layout System

### 9.1 Width rules

#### Long-form canonical pages

* reading width: `48rem–52rem`

#### Landing pages and homepage sections

* outer content width: `72rem–76rem`

#### Mobile

* generous horizontal padding
* no edge-to-edge body copy
* no cramped long-form layouts

### 9.2 Vertical rhythm

Use predictable spacing:

* large section spacing
* moderate heading-to-body spacing
* readable paragraph spacing
* generous separation between section blocks

### 9.3 Grid usage

Use grid for:

* homepage section layouts
* landing-page cards
* explore-next blocks
* component/foundation landing summaries

Use single-column reading layout for:

* What is UnifyPlane
* Why it matters
* Current Readiness
* Evidence
* component pages
* foundation pages

---

## 10. Responsive Breakpoint System

Breakpoint tokens must be defined early and used consistently.

```ts
breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px"
}
```

### 10.1 Behavior by breakpoint

#### `< sm`

* single-column layout only
* mobile nav drawer
* TOC collapses to jump menu
* cards stack vertically

#### `sm–md`

* single-column reading remains default
* 2-column card grids allowed only on landing pages if spacing remains generous

#### `md–lg`

* desktop nav begins
* optional side TOC on long pages
* card grids can expand to 2 columns

#### `lg+`

* side TOC allowed for long-form pages
* landing page grids can expand to 2–3 columns
* header remains restrained, not oversized

---

## 11. Typography System

Typography is the primary visual system.

### 11.1 Character

Typography should feel:

* readable
* structured
* calm
* technical without being code-heavy

### 11.2 Type scale

Recommended baseline:

* `H1`: `2.25rem–3rem`
* `H2`: `1.5rem–2rem`
* `H3`: `1.125rem–1.25rem`
* `Body`: `1rem–1.125rem`
* `Small`: `0.875rem`

### 11.3 Line-height rules

* headlines: tighter, around `1.1–1.2`
* body: comfortable, around `1.6–1.75`
* small text: not cramped, around `1.4–1.5`

### 11.4 Reading constraints

* avoid overly wide paragraphs
* avoid small body text
* avoid dense bullet walls
* preserve scan-friendly hierarchy

### 11.5 Emphasis rules

Use:

* **bold** for high-signal terms
* muted text for secondary explanation
* code style only for file names, route names, identifiers, and component names

Avoid:

* excessive italics
* too many inline status pills
* colorful inline emphasis everywhere

---

## 12. Color System

Color supports structure, not identity theater.

### 12.1 Color roles

Color should support:

* structure
* interaction
* semantic boundaries
* status clarity
* section grouping

Color should not be the main source of site identity.
