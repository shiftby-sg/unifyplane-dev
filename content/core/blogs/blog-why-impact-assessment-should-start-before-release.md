# blog-why-impact-assessment-should-start-before-release.md

## Why Impact Assessment Should Start Before Release

Many organizations treat impact assessment as something that happens late.

A change is designed.
Code is written.
Tests are run.
A release is prepared.
Then, close to deployment or CAB, people begin asking:

* what else does this affect?
* what is the blast radius?
* what should we be worried about?
* what needs to be rechecked before this goes live?

Those are the right questions.

They are just being asked too late.

---

## The Problem with Late Impact Thinking

By the time a release is close, much of the shape of change is already set.

At that point:

* designs have already shifted
* code paths have already moved
* tests may already reflect the wrong assumptions
* downstream dependencies may already be exposed
* release pressure is already high
* rollback options may already be narrower than people think

So when impact assessment starts only near release, it often becomes a compressed risk discussion rather than a true understanding of consequence.

People end up trying to answer large questions under time pressure:

* What changed?
* What else was touched?
* What might fail?
* What was never tested properly?
* What is the real blast radius?

That is not a strong position from which to make decisions.

---

## Impact Starts When Change Starts

Impact should not begin when deployment is near.

It should begin when change begins.

That can be much earlier than release:

* when business intent changes
* when design changes
* when constraints change
* when execution shape changes
* when code changes
* when tests change
* when integrations change
* when runtime fixes are introduced

At each of those stages, the same basic question already exists:

**What else does this touch?**

That is already impact thinking.

So the real issue is not whether organizations need impact assessment.
They already do.

The issue is whether it happens early enough and clearly enough to guide the next step.

---

## Why Release-Time Impact Assessment Is Not Enough

Release-time assessment often suffers from four problems.

### 1. It sees change too late

By release time, the system may already have absorbed several layers of drift:

* intended change vs design
* design vs implementation
* implementation vs test scope
* test scope vs runtime reality

If impact is only assessed at the end, those earlier separations are harder to reverse.

### 2. It compresses uncertainty

Late impact assessment tends to turn broad uncertainty into a short approval conversation.

That makes it harder to distinguish:

* what is local
* what is systemic
* what is well understood
* what is still only assumed

### 3. It weakens testing

If impact is not assessed early, then testing often answers the wrong question.

The team may test what they changed directly, but not what the change may affect indirectly.

That creates false confidence.

### 4. It makes CAB weaker than it needs to be

CAB is often expected to provide confidence about blast radius and readiness.

But CAB can only work well if consequence has already been made visible earlier.

If not, CAB becomes a last-minute reconstruction exercise.

---

## Impact Assessment Across the Lifecycle

A stronger model is to treat impact as a recurring assessment, not a late event.

### During design

Ask:

* what else must change if this design changes?
* what contracts, processes, tests, or downstream systems are affected?
* what assumptions does this design alter?

### During development

Ask:

* what code paths, modules, repos, tests, or integrations are touched?
* what else must be revalidated because of this change?
* what performance or security consequences might now exist?

### During testing

Ask:

* what should be tested because of this change?
* what downstream behavior is now at risk?
* what has drifted between what changed and what is being validated?

### During release readiness

Ask:

* what is the blast radius if this proceeds?
* what changed since earlier checkpoints?
* what is still uncertain?
* what must be checked before promotion?

### During runtime

Ask:

* what is the real consequence of what is happening now?
* what else is being affected?
* what needs reassessment immediately?

That is a stronger impact model than waiting until release and hoping the right questions appear in time.

---

## Why This Matters for Drift

The real problem is not just complexity. Over time, intended change, implemented change, and actual system behavior slowly drift apart.

Impact matters because drift rarely stays in one place.

A design drift today can become a testing gap later.
A code change today can become a runtime incident later.
A local release decision today can become a cross-system consequence later.

So impact assessment is one of the main ways to keep drift from spreading silently.

It helps ask:

* if something has already moved, where will that movement show up next?

That is why impact belongs earlier in the lifecycle.

---

## Why This Matters for Testing

One of the strongest reasons to start impact assessment earlier is testing.

Many test failures are not caused only by bad execution.
They are caused by bad test focus.

Teams test what they touched directly.
But if impact was never made visible, they may miss:

* downstream integrations
* changed assumptions
* affected contracts
* changed runtime paths
* affected process behavior

So impact assessment is not only a governance or CAB concern.

It helps answer a very practical question:

**What should actually be tested because of this change?**

That makes it useful to engineers, testers, architects, and release owners alike.

---

## Why This Matters for CAB

CAB-like thinking is still useful.

People do need to ask before major transitions:

* what is changing?
* what else does it affect?
* what is the blast radius?
* are we ready?

But CAB becomes much stronger when it is not the first place consequence is discussed.

A stronger model is:

* impact assessment begins when change begins
* it is refined through design, development, and testing
* CAB receives a clearer consequence picture rather than inventing it late

That changes CAB from emergency interpretation into better-informed decision support.

---

## What This Means for UnifyPlane

In the current UnifyPlane direction, impact is not yet the strongest demonstrated capability.

Proof is stronger.
Drift is already substantial.
Impact is still earlier.

But the direction is clear:

impact should not be treated as one late-stage report.
It should become a lifecycle capability that helps assess consequence before major transitions and after observed drift.

That will depend on stronger foundations such as:

* proof
* drift visibility
* change visibility
* dependency relationships
* stronger consequence reasoning

So the practical message is simple:

**Impact assessment should start before release because consequence starts before release.**

---

## Closing Thought

By the time impact is discussed only at the end, much of the real effect is already on its way.

The better question is not:

**When should we do one impact assessment?**

It is:

**How early can we begin understanding consequence, and how often should we refine it before the next transition?**

That is the direction stronger systems will eventually need.
