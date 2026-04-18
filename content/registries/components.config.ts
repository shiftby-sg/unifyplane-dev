const entries = [
  {
    "slug": "unifyplane-core",
    "markdownPath": "content/components/unifyplane-core.md",
    "title": "UnifyPlane Core",
    "description": "The execution and evidence center of UnifyPlane, demonstrating declared-to-runtime continuity, bounded execution, evidence-backed runtime closure, proof surfaces, and drift reduction.",
    "maturityLabel": "proven",
    "truthSource": [
      "content/core/components/unifyplane-core.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/components/unifyplane-core.md"
    ],
    "related": [
      "/components/inspect-repo",
      "/components/agent-runtime",
      "/current-readiness",
      "/evidence"
    ]
  },
  {
    "slug": "agent-runtime",
    "markdownPath": "content/components/agent-runtime.md",
    "title": "Agent Runtime",
    "description": "A bounded AI-agent execution and assurance runtime participating in the UnifyPlane model with evidence-bearing execution, guardrails, and early governance-oriented structure.",
    "maturityLabel": "implemented-immature",
    "truthSource": [
      "content/core/components/agent-runtime.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/components/agent-runtime.md"
    ],
    "related": [
      "/components/unifyplane-core",
      "/components/inspect-repo",
      "/current-readiness",
      "/evidence"
    ]
  },
  {
    "slug": "inspect-repo",
    "markdownPath": "content/components/inspect-repo.md",
    "title": "Inspect Repo",
    "description": "A deterministic inspection authority for repo structure and conformance that supports drift visibility and governance-oriented checks as part of the UnifyPlane model.",
    "maturityLabel": "implemented-immature",
    "truthSource": [
      "content/core/components/inspect-repo.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/components/inspect-repo.md"
    ],
    "related": [
      "/components/unifyplane-core",
      "/components/agent-runtime",
      "/current-readiness",
      "/evidence"
    ]
  }
] as const;

export default entries;
