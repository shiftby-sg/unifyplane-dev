# concept-lineage.md

## Lineage

Lineage is the visible chain that helps explain how declared change, derived execution, runtime behavior, and emitted evidence remain connected.

This matters because the real problem is not just complexity. Over time, intended change, implemented change, and actual system behavior slowly drift apart.

If that drift is to be understood clearly, it is not enough to know only what ran. It also helps to know how one layer relates to another:

* what declared inputs shaped execution
* what derived surface runtime followed
* what runtime produced
* what evidence later confirmed or challenged that continuity

That is where lineage matters.

---

## Why Lineage Matters

A system can produce outputs and still leave a basic question unanswered:

**How is this result connected to what came before it?**

People often need to understand:

* how intent relates to runtime
* how design relates to derived execution
* how runtime relates to emitted evidence
* where continuity held
* where continuity weakened
* whether the observed result can still be traced back clearly enough to trust

Without lineage, systems can still run, but explanation becomes weaker.
Things may look correct locally while broader continuity is unclear.

That is one reason lineage matters so much in a drift-oriented system.

---

## Lineage in Plain Language

Lineage is the visible connection between stages.

In simple terms, lineage helps answer questions like:

* how did this runtime surface come from earlier declared inputs?
* how does this evidence relate to the execution that produced it?
* what links remain intact across design, execution, and verification?
* where has the chain weakened or broken?

So lineage is not only a historical trail.
It is also a way to see whether alignment is still strong enough to explain the current state.

---

## What UnifyPlane Means by Lineage

In UnifyPlane, lineage is not only about recording relationships.
It is also about making continuity inspectable.

That means lineage should help show whether:

* declared surfaces remain connected to derived surfaces
* derived surfaces remain connected to runtime
* runtime remains connected to emitted evidence
* those connections remain visible enough to support proof and drift understanding

This is one of the reasons lineage is important in the current system.
It makes the path from declared change to runtime evidence easier to inspect rather than leaving it as an assumption.

---

## Lineage Is Not the Same as Traceability

Traceability and lineage are closely related, but they are not identical.

A practical way to distinguish them is:

* **Traceability** helps show whether declared elements are still mapped and covered
* **Lineage** helps show whether continuity through execution and evidence remains visible and intact

So traceability is often more mapping-oriented.
Lineage is often more continuity-oriented.

Both matter.
They strengthen each other.
But they do not mean exactly the same thing.

---

## How Lineage Appears in the Current State

Today, lineage is already one of the meaningful current capabilities in UnifyPlane.

It is especially visible in `unifyplane-core`, where lineage-related evidence already appears in runtime and post-run verification surfaces.

### 1. Declared-to-runtime continuity

The current system already shows lineage between:

* declared contract layers
* derived execution surfaces
* runtime execution
* emitted evidence

This is important because it makes the path from earlier design to later runtime more visible.

### 2. Runtime-provable lineage

The current implementation already distinguishes lineage that is merely declared from lineage that is fulfilled through runtime and evidence.

That makes lineage stronger than a documentation-only relationship.

### 3. Authority boundary lineage

The demonstrated authority paths also show that lineage can extend across bounded authority invocation, not only inside one local runtime center.

That is important because it shows the current model can preserve continuity across different execution participants.

---

## Why Lineage Matters for Drift

Lineage is one of the places where drift becomes visible.

If expected continuity no longer holds between:

* declared surfaces
* derived execution
* runtime behavior
* emitted evidence

then drift is already present.

This means lineage is not only explanatory.
It is also a drift surface.

In simple terms:

* if continuity stays intact, drift is resisted
* if continuity weakens, drift becomes easier to expose

That is why lineage should be treated as part of drift visibility, not only as historical documentation.

---

## Why Lineage Matters for Proof

Proof is stronger when continuity is stronger.

A system can emit evidence, but if the chain between declared design, derived execution, runtime, and evidence is weak, proof also becomes weaker.

That is why lineage supports proof.

It helps answer:

* how this result is connected to earlier declared surfaces
* whether the current result still belongs to the execution path people think it does

So lineage is not separate from proof.
It is one of the things that makes proof more trustworthy.

---

## Lineage and the Other Concepts

Lineage should be read together with the other concepts.

* **Traceability** helps show declared mapping and coverage
* **Lineage** helps show continuity through execution and evidence
* **Proof** depends on lineage to strengthen trust in current truth
* **Drift** becomes visible when lineage weakens
* **Change** becomes easier to understand when lineage remains visible
* **Impact** later depends on understanding what continuity paths are touched by change

So lineage sits at an important junction between declared structure and runtime reality.

---

## What Lineage Does Not Mean

Lineage does not mean:

* every relationship is perfectly known forever
* one chain alone explains every consequence
* continuity automatically guarantees correctness
* documenting a link is the same as proving it in runtime

Lineage is strongest when it is supported by real runtime and evidence surfaces, not only static relationship claims.

That is why the distinction between declared lineage and runtime-fulfilled lineage matters.

---

## Current Honest Summary

Today, lineage is already a meaningful and real part of UnifyPlane.

The current system already shows:

* continuity between declared surfaces and runtime
* continuity between runtime and evidence
* lineage conformance checks
* runtime-provable lineage in key execution areas
* authority-bound continuity across more than one execution shape

This makes lineage one of the stronger current foundations for both proof and drift visibility.

So the honest current position is:

**Lineage is already real and useful in UnifyPlane today, especially as a continuity and drift-visibility surface.**

---

## Short Version

Lineage is the visible chain that helps explain how declared change, derived execution, runtime behavior, and emitted evidence remain connected.

In UnifyPlane, lineage already plays a real role in both proof and drift visibility.
