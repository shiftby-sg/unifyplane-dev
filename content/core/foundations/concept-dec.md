# concept-dec.md

## DEC

DEC is the derived execution surface that turns declared design inputs into a bounded runtime form.

That matters because the real problem is not just complexity. Over time, intended change, implemented change, and actual system behavior slowly drift apart.

If runtime is allowed to invent too much for itself, that separation grows faster.
If runtime is tightly bound to declared inputs, the path from intention to execution becomes easier to explain and verify.

This is where DEC matters.

---

## Why DEC Matters

Most systems have some gap between design and runtime.

People write intent, specifications, constraints, plans, or configuration.
Then runtime begins.
But what exactly carries those declared inputs into execution is often unclear, scattered, or too implicit.

That is one of the places where drift begins.

DEC matters because it gives runtime a clearer bounded surface.

In simple terms, DEC helps answer:

* what execution surface was derived from declared inputs?
* what was runtime actually supposed to follow?
* what was frozen before execution started?
* what can be checked later to see whether runtime stayed aligned?

Without something like that, the connection between declared change and runtime behavior becomes harder to prove.

---

## DEC in Plain Language

DEC is the execution form derived from declared artifacts before runtime proceeds.

It is not just an idea and not just an informal plan.
It is the surface that says, in effect:

* these are the declared inputs
* this is the execution structure derived from them
* this is what runtime is allowed to follow
* this is what later evidence and verification can be checked against

So DEC helps reduce ambiguity between:

* what people said should happen
* what runtime was actually allowed to do

---

## What UnifyPlane Means by DEC

In UnifyPlane, DEC is not treated as a creative runtime layer.
It is treated as a bounded derived surface.

The older governance direction already makes this clear:
declared artifacts come first, DEC is derived from them, and runtime is expected to remain compliant with that derived execution form. 

This is important because DEC is not supposed to invent new authority or redefine the meaning of the declared inputs.

Its role is narrower and stronger:
to make runtime execution more explicit, more bounded, and easier to verify afterward.

---

## DEC Is Not Just One Thing

In the current state of UnifyPlane, DEC appears in more than one form.

### Planner DEC

This is the semantic-freeze form.
It captures declared execution meaning and ordering, but does not itself act as runtime authority.

### Runtime or orchestrator DEC

This is the runtime-bound form that actual execution follows.

This distinction matters because it keeps semantic planning separate from runtime authority.

That is one of the ways the current system reduces ambiguity.

---

## Why the Separation Matters

If semantic planning and runtime authority are blurred together, it becomes harder to answer questions like:

* what was only planned?
* what was actually authorized for runtime?
* what changed between template form and run-bound form?
* what later evidence should be reconciled against?

The current separation helps keep these stages clearer.

In plain language:

* one surface freezes meaning
* another surface binds runtime

That is stronger than one vague execution artifact trying to do both.

---

## How DEC Appears in the Current State

Today, DEC is already a real and important part of UnifyPlane, especially in `unifyplane-core`.

The current evidence already shows:

* declared contract layers
* planner DEC
* run-bound or runtime DEC
* reconciliation between DEC and runtime evidence
* comparison between template and run-bound forms
* provenance checks around DEC inputs and outputs

This means DEC in the current system is not theoretical.
It is already part of the real execution and verification path.

---

## What DEC Already Supports

### 1. Declared-to-runtime continuity

DEC helps connect declared inputs to runtime in a bounded way.

### 2. Runtime verification

Because runtime is checked against derived execution surfaces, later proof becomes stronger.

### 3. Drift detection

Differences between expected and actual execution surfaces can already be detected through reconciliation and purity checks.

### 4. Evidence interpretation

DEC gives later evidence and verification reports something concrete to compare runtime against.

That is why DEC matters not only before execution, but also afterward.

---

## DEC and Drift

DEC is closely tied to drift because one common form of drift is:

**runtime no longer behaving in the way the declared execution surface was meant to constrain.**

That is why the current system already uses DEC-related checks such as:

* projection purity
* runtime binding purity
* template-to-run-bound comparison
* execution reconciliation
* provenance reconciliation

These are not all “about DEC” in name alone.
They are also drift controls around derived execution.

So DEC is one of the places where declared intent and bounded runtime stay connected strongly enough to detect later separation.

---

## DEC and the Other Concepts

DEC should be read together with the other concepts.

* **Evidence** shows what actually happened
* **Proof** shows what can be trusted now
* **Drift** shows where separation is growing
* **Change** shows what moved
* **Impact** later depends on understanding what execution surfaces changed and what they affect

DEC sits near the center of this because it helps connect declared structure to runtime structure.

Without that connection, the rest becomes harder to reason about.

---

## What DEC Does Not Mean

DEC does not mean:

* runtime becomes perfect
* drift becomes impossible
* one artifact alone explains everything
* design and runtime are automatically identical forever

DEC is not magic.
It is a bounded derived execution surface that makes runtime easier to constrain and easier to verify.

Its strength depends on the declared inputs above it and the evidence and verification below it.

---

## Current Honest Summary

Today, DEC is already a real and important part of the current UnifyPlane implementation.

The current system already shows:

* semantic-freeze DEC surfaces
* runtime-bound DEC surfaces
* bounded runtime execution against derived execution form
* reconciliation and purity checks around DEC behavior
* evidence and provenance tied back to DEC-related structures

This makes DEC one of the core current mechanisms for reducing ambiguity between declared change and runtime behavior.

So the honest current position is:

**DEC is already real, central, and practically important in UnifyPlane today.**

---

## Short Version

DEC is the derived execution surface that turns declared design inputs into a bounded runtime form.

In UnifyPlane, it is one of the main ways declared change stays connected to actual execution.
