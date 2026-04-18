# concept-authority.md

## Authority

Authority is about what an execution participant is allowed to do, within what boundaries, and under what declared conditions.

This matters because the real problem is not just complexity. Over time, intended change, implemented change, and actual system behavior slowly drift apart.

When that happens, one of the hardest questions is not only:

* what happened?

It is also:

* who or what was allowed to do it?
* under what declared boundary?
* did execution stay inside that role?
* did runtime act within the shape it was supposed to have?

That is where authority matters.

---

## Why Authority Matters

Many systems can execute.
Far fewer can explain clearly:

* what execution role was active
* what that role was allowed to do
* what it was not allowed to do
* how that role was bound before execution
* whether runtime stayed inside that boundary

Without enough authority clarity, systems may still run, but explanation becomes weaker.

Things may work technically while becoming harder to trust because:

* execution scope was too implicit
* different roles were blurred together
* runtime expanded beyond what was clearly declared
* responsibility became harder to locate

Authority matters because it helps reduce that ambiguity.

---

## Authority in Plain Language

Authority is the answer to questions like:

* what role is this system or component playing?
* what is it allowed to do here?
* what is outside its role?
* what boundary was declared before it ran?
* what later evidence can show whether it stayed inside that boundary?

In simple terms:

**authority is the bounded role an execution participant is allowed to play.**

That role may be small or large.
But if it is unclear, drift grows faster.

---

## What UnifyPlane Means by Authority

In UnifyPlane, authority is not just a permissions list and not just a runtime convenience.

It is one of the main ways intended change stays bounded as it moves toward execution.

That means authority should help make clear:

* what execution participant exists
* what kind of role it has
* what declared surfaces bind that role
* what runtime it may participate in
* what evidence should exist afterward

This is important because UnifyPlane is not built around one flat execution model.
It already shows different authority types operating under one broader discipline.

---

## Authority Is Not the Same as Execution

Execution is what ran.

Authority is the bounded role that says what that participant was supposed to be doing there.

That distinction matters.

A system may execute successfully and still leave authority questions unclear if people cannot tell:

* whether the runtime role was declared clearly enough
* whether scope was bounded enough
* whether execution crossed into another role silently

So authority is not a synonym for “it ran.”
It is part of the answer to “was this the right participant, in the right role, under the right boundary?”

---

## Authority Is Not the Same as Ownership

Ownership is often organizational.

Authority here is structural.

A team may own a system.
A repo may contain many components.
A runtime may involve several participants.

Authority asks something narrower:

* what role does this participant play in this execution context?
* what is its boundary?
* what evidence should show that it stayed there?

That is why authority is useful even when organizational ownership is already known.

---

## How Authority Appears in the Current State

Today, authority is already a real and practical part of UnifyPlane.

It is especially visible through:

* bounded runtime roles in `unifyplane-core`
* authority invocation plans
* distinct authority paths such as `agent-runtime` and `inspect-repo`
* runtime checks around authority binding and execution shape
* authority-side evidence surfaces

This matters because it shows the current system is not only executing work.
It is already distinguishing different execution participants and bounding them differently.

---

## Current Authority Shapes

### 1. UnifyPlane Core

This is the strongest and most mature current authority surface.

It acts as the bounded execution center that connects declared surfaces, derived execution form, runtime behavior, and evidence-backed verification.

### 2. Content Agents

This is a bounded agentic authority path.

It matters because it shows that agentic execution can be placed inside a declared authority structure rather than treated as uncontrolled behavior.

### 3. Inspect Repo

This is a bounded inspection authority path.

It matters because it shows that inspection can operate as its own authority type with structured outputs and evidence, not only as an internal helper.

These paths are different, but they already participate under the same broader discipline.

---

## Why Authority Matters for Drift

Authority is one of the places where drift can begin or be reduced.

Drift grows when:

* execution roles are unclear
* runtime scope expands without visibility
* participants perform work outside their declared boundary
* one role quietly absorbs another role’s function

That is why bounded authority matters.

It helps reduce:

* scope drift
* role drift
* hidden expansion of execution behavior

In simple terms:
if the system cannot keep roles clear, it becomes easier for runtime reality to drift away from what was intended.

---

## Why Authority Matters for Proof

Proof is stronger when people can show not only what ran, but also:

* what role was active
* what that role was bound to
* what runtime surface it followed
* what evidence it emitted

This means authority supports proof by making execution easier to interpret.

A successful outcome is more trustworthy when the role that produced it was also bounded and visible.

---

## Why Authority Matters for Agents

This is especially important for future agentic systems.

If agentic participants are allowed to:

* expand scope silently
* redefine meaning
* act beyond bounded surfaces
* continue through weak evidence or unclear execution shape

then decision drift and behavior drift become much harder to reduce.

That is why authority is so important for bounded agent participation.

In UnifyPlane, agents should not become mysterious runtime centers.
They should remain bounded execution participants whose role is visible and inspectable.

The current `agent-runtime` direction already points toward that pattern, even though it is still early in maturity.

---

## Authority and the Other Concepts

Authority should be read together with the other core concepts.

* **DEC** helps bind runtime form
* **Evidence** helps show what actually happened
* **Traceability** helps show declared mappings
* **Lineage** helps show continuity through execution and evidence
* **Proof** helps show what is true now
* **Drift** becomes visible when bounded roles weaken or expand
* **Change** becomes harder to assess when role boundaries are unclear
* **Impact** later depends in part on understanding which participant’s role is affected

So authority is not isolated.
It is one of the structural anchors that helps keep the whole model coherent.

---

## What Authority Does Not Mean

Authority does not mean:

* total control over all downstream consequence
* organizational hierarchy
* generic permission flags alone
* a guarantee that drift can never happen
* that one participant should do everything

Authority is strongest when it is narrow enough to be clear and bounded enough to be checked later.

It reduces ambiguity.
It does not eliminate complexity.

---

## Current Honest Summary

Today, authority is already a meaningful and practical part of UnifyPlane.

The current system already shows:

* distinct execution participants under one broader model
* bounded authority paths
* authority invocation surfaces
* authority-side evidence
* runtime checks that strengthen role boundaries

This makes authority one of the real current foundations for proof and drift reduction.

So the honest current position is:

**Authority is already real and structurally important in UnifyPlane today, especially as a way of keeping different execution roles bounded and visible.**

---

## Short Version

Authority is about what an execution participant is allowed to do, within what boundaries, and under what declared conditions.

In UnifyPlane, authority already plays a real role in keeping execution participants bounded, visible, and easier to verify.
