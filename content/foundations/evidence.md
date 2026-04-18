---
{
  "title": "Evidence",
  "description": "What counts as evidence, why evidence matters, and how evidence-bearing execution supports explanation and governance after change.",
  "slug": "evidence",
  "section": "foundations",
  "pageType": "deep-doc",
  "truthSource": [
    "content/core/foundations/concept-evidence.md"
  ],
  "derivedFrom": [
    "content/core/website-information-architecture.md",
    "content/core/foundations/concept-evidence.md"
  ],
  "audience": [
    "primary"
  ],
  "readiness": "not-applicable",
  "ownsTopic": "foundation",
  "related": [
    "/evidence",
    "/foundations/proof",
    "/foundations/continuity"
  ],
  "seoTitle": "Evidence (Foundations)",
  "seoDescription": "What counts as evidence, why evidence matters, and how evidence-bearing execution supports explanation and governance after change.",
  "showInNav": false,
  "showInToc": true,
  "currentDemonstratedUse": "Grounds the site’s evidence-first positioning and clarifies what current artifacts do and do not prove.",
  "intendedBroaderUse": "Make evidence legible across declared, derived, runtime, and verification artifacts without turning pages into raw dumps.",
  "futureScope": "Broader evidence ingestion, validation, and indexing across more authorities and runtime environments."
}
---

# evidence.md

## Evidence

Evidence is what helps show what actually happened, not just what was expected, claimed, or assumed.

This matters because the problem is not just complexity. In software-driven systems, continuity between intended change, what was actually built, configured, and deployed, and how systems behave in production often weakens over time.

If that is the problem, then evidence matters because it helps answer basic questions:

* what was supposed to happen?
* what was actually built, configured, and deployed for execution?
* what actually ran?
* what was produced?
* what can be shown now?
* where did continuity hold?
* where did it weaken?

Without enough evidence, those questions are often answered through memory, interpretation, scattered tooling, or after-the-fact reconstruction.

---

## Why Evidence Matters

A system can run successfully and still leave people uncertain.

A change can be approved, built, tested, released, and run, yet people may still struggle to explain:

* what execution surface was actually used
* what happened during runtime
* whether important boundaries held
* whether the system stayed aligned to what was intended
* whether the emitted outputs and logs are enough to trust the result

That is why evidence matters.

Evidence is what makes runtime easier to inspect, explain, and verify.

---

## Evidence in Plain Language

Evidence is the material left behind that helps show what really happened.

In simple terms, evidence can include things like:

* declared runtime inputs
* derived execution artifacts
* logs
* task results
* gate results
* emitted artifacts
* verification reports
* hashes and integrity bindings
* summaries of what ran and what passed

Not every artifact has the same meaning.

Some describe what was declared.  
Some describe what was derived.  
Some describe what runtime did.  
Some help verify whether those stayed aligned.

What matters is not just having many files.
What matters is whether the evidence is strong enough to explain the run clearly.

---

## What UnifyPlane Means by Evidence

In UnifyPlane, evidence is not just observability noise and not just a debugging record.

It is part of how intended change, what was actually built, configured, and deployed, and runtime behavior are kept connected and explainable.

That means evidence is expected to help answer questions such as:

* what inputs and declared surfaces was runtime bound to?
* what execution path was actually taken?
* what artifacts were emitted?
* what checks were performed afterward?
* what can now be shown without relying only on trust?

So evidence in UnifyPlane is not optional decoration.
It is one of the reasons the system is structured the way it is.

---

## Evidence Is More Than Logs

Logs matter, but logs alone are not enough.

A log can show that something happened.
A status can show that something passed.
An output can show that something was produced.

But evidence in the stronger sense needs more than one signal.

It usually needs a combination of:

* declared artifacts
* derived artifacts
* execution records
* emitted outputs
* integrity surfaces
* verification results

This is why UnifyPlane uses layered evidence rather than one single runtime trace.

---

## What Evidence Looks Like in the Current State

Today, evidence is already one of the strongest current parts of UnifyPlane, especially in `unifyplane-core`.

The current system already emits and verifies multiple evidence surfaces around execution.

### 1. Declared and derived execution artifacts

Evidence begins before runtime.

It includes:

* declared artifacts such as intent, specifications, constraints, plans, and registries
* derived artifacts such as execution artifacts and frozen invocation surfaces

These help show what runtime was supposed to be bound to.

### 2. Runtime execution evidence

During runtime, evidence already includes:

* request artifacts
* gate verdicts
* task results
* summaries
* emitted outputs
* component invocation outputs
* logs and trace references

These help show what actually happened during execution.

### 3. Post-run verification evidence

After runtime, evidence already includes checks such as:

* traceability summaries
* lineage conformance
* execution reconciliation
* provenance reconciliation
* evidence conformance
* boundary verification
* execution-shape verification
* log integrity

These help show whether execution remained aligned to what was declared and what evidence was expected.

---

## Evidence Across the Current Component Paths

The current component paths also help show that evidence is not only local to one execution center.

### In `unifyplane-core`

Evidence is strongest and most complete.
It already shows declared-to-runtime continuity, emitted runtime artifacts, and post-run verification layers.

### In `agent-runtime`

There is already runtime-side execution evidence, including summaries, bounded execution results, and runtime-side evidence bundles.

### In `inspect-repo`

There is already inspection-side evidence, including multi-tool inspection outputs, jurisdiction summaries, and inspection-side run summaries.

This is important because it means evidence already exists across more than one component shape.

---

## Evidence and the Other Foundations

Evidence should be read together with the other foundations.

* **Proof** depends on evidence to show what is true now
* **Drift** depends on evidence to show what is separating over time
* **Change** depends on evidence to show what moved and what now needs attention
* **Impact** will eventually depend on evidence to support consequence reasoning

Without enough evidence, all of those become weaker.

That is why evidence is a foundational idea rather than a supporting afterthought.

---

## Evidence and Integrity

Evidence is stronger when it is not easy to tamper with or reinterpret casually.

That is why integrity-related surfaces matter, such as:

* hashes
* reconciliation checks
* provenance links
* log integrity chains
* expected artifact verification

These do not make evidence magically perfect.
But they help reduce uncertainty about whether important runtime and post-run surfaces stayed aligned.

In the current state of UnifyPlane, this is already one of the stronger implemented areas.

---

## What Evidence Does Not Mean

Evidence does not mean:

* every possible truth is known
* one artifact explains everything
* a large number of files automatically creates trust
* logs by themselves are enough
* runtime success alone proves alignment

A mature evidence model is not just about quantity.
It is about whether different layers together are strong enough to explain what happened clearly.

---

## Current Honest Summary

Today, evidence is already one of the strongest current capabilities in UnifyPlane.

The current system already has meaningful evidence surfaces for:

* declared and derived runtime inputs
* runtime execution results
* component invocation results
* logs and trace references
* verification and reconciliation outputs
* integrity and boundary checks

This makes evidence one of the main reasons UnifyPlane can already speak strongly about proof and drift control.

What is less mature is not evidence itself, but the broader lifecycle change and impact reasoning that should build on that evidence later.

So the honest current position is:

**Evidence is already real, layered, and substantial in UnifyPlane today.**

---

## Short Version

Evidence is what helps show what actually happened, not just what was expected or claimed.

In UnifyPlane, evidence is already one of the strongest current capabilities and one of the main foundations for proof and drift control.
