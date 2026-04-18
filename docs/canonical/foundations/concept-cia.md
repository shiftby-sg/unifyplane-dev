# concept-cia.md

## CIA

CIA stands for **Change Impact Assessment**.

In UnifyPlane, CIA is about understanding what a change, a drift, or a runtime difference may affect next, and how serious that consequence may be.

This matters because the real problem is not just complexity. Over time, intended change, implemented change, and actual system behavior slowly drift apart.

When that happens, one of the hardest questions is no longer only:

* what changed?

It becomes:

* what else is touched?
* what else now needs attention?
* where can the effect spread?
* how serious is the consequence if this continues?

That is where CIA matters.

---

## Why CIA Matters

Organizations often discover consequence too late.

A change is approved.
Development finishes.
Tests pass.
A release moves forward.

Only later does the organization realize:

* another integration was affected
* a downstream process was relying on older behavior
* the real blast radius was larger than expected
* what should have been tested was not clearly visible
* the issue was not local, even though the change looked local

This is why CIA matters.

CIA is meant to make consequence easier to see before damage spreads further.

---

## CIA in Plain Language

CIA is a structured way of asking:

* what did this change affect?
* what else may now be exposed?
* where could the consequence spread next?
* how serious is that?
* what should be reassessed before moving forward?

That is the practical meaning.

CIA is not just a document for governance meetings.
It is not only a release checklist.
And it is not only a runtime incident analysis.

It is a recurring need wherever change moves through connected systems.

---

## What UnifyPlane Means by CIA

In the broader UnifyPlane direction, CIA is not meant to be a loose opinion or a manual guess.

It is meant to become a more structured consequence-assessment capability built on top of:

* declared change surfaces
* evidence
* traceability
* lineage
* dependency relationships
* observed drift
* bounded interpretation layers

The older system direction already places CIA in the path after execution, evidence, lineage, and derived intelligence.   

That matters because CIA becomes stronger when it is fed by structured inputs rather than only human memory and scattered tooling.

---

## CIA Is Not Only for Runtime

CIA should not be thought of as only a post-production activity.

It can matter across multiple phases.

### 1. Design phase

* If this intended change proceeds, what contracts, plans, processes, or systems are affected?
* What else must change to stay aligned?

### 2. Development phase

* What modules, repos, tests, interfaces, security assumptions, or performance expectations are touched?
* What should now be revalidated?

### 3. Testing and release-readiness phase

* What must be tested because of this change?
* What integrations and downstream consumers may now be exposed?
* What is the likely blast radius if this moves forward?

### 4. Runtime phase

* What actual systems, processes, or outputs are showing the consequence now?
* How far is the effect spreading?
* What needs reassessment immediately?

So CIA should be understood as a lifecycle capability, not only a late release ritual.

---

## CIA and CAB-Like Thinking

A practical way to understand CIA is to compare it to the questions people try to ask before major transition points.

Before a release, a promotion, or a major runtime response, people often want to know:

* what is changing?
* what else does it affect?
* are we ready for the consequence?
* what is the blast radius?
* what should be checked first?
* what happens if this behaves differently than expected?

CIA is the more structured version of that instinct.

So CIA is not alien to enterprise practice.
It is a stronger way of making that consequence thinking clearer and more repeatable.

---

## CIA Depends on Other Capabilities

CIA is not usually a first capability.
It depends on other things being strong enough first.

It becomes stronger when there is enough:

* **Proof** to show what is true now
* **Drift visibility** to show what is separating
* **Change visibility** to show what moved
* **Dependency relationship visibility** to show where consequence may travel
* **Evidence** to support the assessment

Without those, CIA becomes too speculative.

That is why CIA in UnifyPlane belongs later in the maturity path than proof and drift.

---

## CIA and Dependency Graphs

Dependency graph capability is especially important for CIA.

Why?

Because CIA becomes much more useful when the system can answer:

* what depends on this artifact?
* what consumes this output?
* what repo or system is downstream from this?
* what path can the consequence travel through?
* how broad is the likely blast radius?

Without dependency graph intelligence, CIA stays partial and more manual.

With stronger dependency graph intelligence, CIA can become more systematic.

That is why dependency graph capability and CIA are closely connected in the future direction of UnifyPlane.

---

## How CIA Appears in the Current State

Today, CIA is still early in UnifyPlane.

This is an important honesty boundary.

### What is already present

There are already some useful foundations for future CIA, including:

* traceability
* lineage
* structural change visibility
* drift-oriented checks
* bounded execution surfaces
* authority-side visibility
* inspection paths that reveal structural misalignment

These already help answer parts of:

* where change happened
* where alignment weakened
* what surfaces are connected enough to inspect

### What is not yet clearly realized

What is still missing or early includes:

* strong dependency graph intelligence
* broader cross-repo consequence visibility
* stable derived intelligence outputs
* clearer severity classification
* full lifecycle change-to-impact outputs before major transitions

So today, CIA is more grounded as direction than realized as a strong outward capability.

---

## CIA and Severity

A mature CIA capability would not only ask what is affected.
It would also help ask:

* how serious is this?
* how likely is the consequence to spread?
* what kind of reassessment is needed now?
* what is local, and what is broader?

That is important because impact is not only about visibility.
It is also about proportion.

A useful CIA capability should help distinguish:

* minor local change
* meaningful downstream exposure
* broad cross-system risk

That part is still future-facing in the current state.

---

## What CIA Does Not Mean

CIA does not mean:

* every consequence can be predicted perfectly
* one model can know every business impact fully
* one graph or report eliminates uncertainty
* every change should be treated as equally serious

CIA is about making consequence more visible and more discussable.
It is not about pretending uncertainty disappears.

A mature CIA capability improves judgment.
It does not replace it entirely.

---

## Current Honest Summary

Today, CIA in UnifyPlane is still early.

It is clearly grounded in the broader direction of the model, and it is an important future capability for lifecycle-wide consequence assessment.

But it is not yet one of the strongest demonstrated current capabilities because key supporting areas — especially dependency graph intelligence and broader consequence visibility — are not yet strongly realized.

So the honest current position is:

**CIA is an important future-facing capability in UnifyPlane, but it is not yet a strong current capability.**

---

## Short Version

CIA is Change Impact Assessment.

It helps answer what a change, a drift, or a runtime difference may affect next, and how serious that consequence may be.

In UnifyPlane, CIA is a grounded direction, but still an early capability rather than a strong current one.
