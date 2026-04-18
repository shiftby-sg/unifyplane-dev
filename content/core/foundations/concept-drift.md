# drift.md

## Drift

Drift is what happens when continuity between intended change, what was actually built, configured, and deployed, and how systems behave in production weakens over time.

This is one of the central ideas in UnifyPlane because many enterprise problems do not begin with a single dramatic failure. They begin with small separations that grow quietly across design, development, testing, release, runtime, operations, and assurance.

A change starts with one purpose.
It is designed, built, configured, deployed, and operated.
Over time, those layers stop matching as closely as people assume.

That is drift.

---

## Why Drift Matters

Complexity makes systems hard to understand.

Drift makes them hard to trust.

When drift grows, organizations begin losing confidence in simple questions:

* Is the system still doing what this change was meant to achieve?
* Did what was built, configured, and deployed stay aligned to intended change?
* Did runtime behavior remain inside expected boundaries?
* Are tests, evidence, and downstream assumptions still valid?
* Has something quietly changed without being clearly recognized?

Drift matters because many expensive problems are only recognized after that separation has already spread.

---

## Drift Is Not Only a Runtime Problem

Drift is often noticed during runtime, but it does not begin there.

It can appear earlier:

* when intended change begins to separate from design
* when design begins to separate from implementation or configuration
* when code, tests, controls, and constraints stop moving together
* when release assumptions no longer match what is actually being promoted
* when runtime behavior no longer matches what people think is true
* when assurance depends more on documents or assumptions than on evidence of what actually happened

That is why drift should be understood as a lifecycle problem, not only an operations problem.

---

## Drift in Plain Language

Drift is when:

* what was asked for is no longer what is being delivered
* what was designed is no longer what is being built or configured
* what was tested is no longer what matters most in production
* what people believe is running is no longer what the system is actually doing
* what used to be aligned has slowly separated

This is why drift often feels familiar even when teams use different language for it.

People may describe it as:

* things changed more than expected
* the system no longer matches the process
* nobody knows what really changed
* the release looked fine, but behavior is different
* the architecture says one thing, production shows another

These are all drift symptoms.

---

## Types of Drift

In the broader UnifyPlane direction, drift can appear in multiple forms, including:

* design drift
* contract drift
* implementation drift
* structural drift
* execution drift
* evidence drift
* assumption drift
* authority or agent drift

These categories are useful because they are close to what current implementation and evidence can already show.

They also help explain why drift is not one narrow technical issue. It can appear in declared structure, runtime behavior, emitted evidence, and the assumptions people continue to make after change.

---

## What UnifyPlane Means by Drift

In UnifyPlane, drift is not just an abstract label.

It is something that should be:

* detectable
* visible
* explainable
* reducible over time

That is why drift is not treated as a side topic. It is one of the main reasons the discipline exists.

If proof helps show what is true now, drift helps show what is separating over time.

---

## What Drift Looks Like in the Current State

Today, drift in UnifyPlane is already more than a concept.

There are real checks and controls that already behave as drift-detection or drift-reduction surfaces.

### 1. Pre-run traceability validation

Pre-run traceability and its validation already help detect whether declared design surfaces still line up before execution begins.

### 2. Contract and structural inspection

The current `inspect-repo` path already behaves like a contract and repo-surface drift inspection chain.

### 3. Execution-shape verification

Current execution and verification surfaces already help detect whether runtime remained inside its expected shape.

### 4. Evidence conformance and boundaries

Evidence completeness, evidence conformance, provenance-oriented reconciliation, and evidence-boundary checks already help detect drift between what execution was supposed to emit and what it actually emitted.

### 5. Lineage conformance

Lineage checks already help show whether declared relationships still hold through runtime and evidence.

### 6. Fail-closed runtime behavior

Fail-closed behavior does not only block invalid execution. It also reduces later silent divergence by refusing certain kinds of undeclared or misaligned behavior.

This means drift in the current system is already being addressed at multiple layers, especially in `unifyplane-core`.

---

## Drift Detection and Drift Reduction

It is useful to separate two things.

### Drift detection

These are checks that help expose misalignment.

Examples include:

* traceability validation
* contract inspection
* lineage conformance
* execution-shape verification
* evidence conformance

### Drift reduction

These are controls that reduce the chance of silent divergence spreading further.

Examples include:

* fail-closed execution boundaries
* bounded component invocation
* stricter runtime-shape controls
* bounded AI-agent execution constraints
* stronger evidence and boundary discipline

Some mechanisms do both, but the distinction is useful.

Not everything that detects drift reduces it.
Not everything that reduces drift explains it well.
A mature system needs both.

---

## Drift and the Other Foundations

Drift should be read together with Proof and Impact.

* **Proof** helps show what is true now
* **Drift** helps show what is separating over time
* **Impact** helps explain what that separation may affect next

So drift sits in the middle.
It is the point where alignment starts to weaken and where later consequence begins to matter.

---

## What Drift Does Not Mean

Drift does not automatically mean failure.

Drift is a signal that something needs to be re-examined, not necessarily proof that everything is broken.

Drift also does not mean every small difference is equally important.
Some drift is local and manageable.
Some drift grows into a wider problem.

The important thing is whether it is visible early enough and explainable clearly enough.

---

## Current Honest Summary

Today, UnifyPlane is already strongest where drift needs to be detected and reduced.

It already has meaningful drift controls across:

* pre-run traceability
* contract inspection
* execution verification
* evidence verification
* lineage conformance
* bounded fail-closed runtime behavior

What is less mature is broader lifecycle drift assessment across every stage and stronger cross-repo or cross-system consequence reasoning after drift is found.

So the honest current position is:

**Drift is not only a future concept in UnifyPlane. It is already a real and active part of the current system.**

---

## Short Version

Drift is what happens when continuity between intended change, what was actually built, configured, and deployed, and how systems behave in production weakens over time.

UnifyPlane treats drift as something that should be detected early, made visible, explained clearly, and reduced wherever possible.