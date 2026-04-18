const entries = [
  {
    "slug": "continuity",
    "markdownPath": "content/foundations/continuity.md",
    "title": "Continuity",
    "description": "Why continuity weakens from intended change to implemented reality to runtime behavior, and why continuity-first discipline is central to UnifyPlane.",
    "truthSource": [
      "content/core/foundations/continuity.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/continuity.md"
    ],
    "related": [
      "/foundations/proof",
      "/foundations/drift",
      "/evidence",
      "/current-readiness"
    ]
  },
  {
    "slug": "proof",
    "markdownPath": "content/foundations/proof.md",
    "title": "Proof",
    "description": "What proof means in software change: how current truth can be shown from declared artifacts and runtime evidence rather than assumption.",
    "truthSource": [
      "content/core/foundations/concept-proof.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/concept-proof.md"
    ],
    "related": [
      "/foundations/continuity",
      "/foundations/evidence",
      "/evidence"
    ]
  },
  {
    "slug": "drift",
    "markdownPath": "content/foundations/drift.md",
    "title": "Drift",
    "description": "How alignment weakens over time between declared intent, implementation, and runtime behavior, and why drift should be made visible and reduced early.",
    "truthSource": [
      "content/core/foundations/concept-drift.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/concept-drift.md"
    ],
    "related": [
      "/foundations/continuity",
      "/foundations/change",
      "/evidence"
    ]
  },
  {
    "slug": "evidence",
    "markdownPath": "content/foundations/evidence.md",
    "title": "Evidence",
    "description": "What counts as evidence, why evidence matters, and how evidence-bearing execution supports explanation and governance after change.",
    "truthSource": [
      "content/core/foundations/concept-evidence.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/concept-evidence.md"
    ],
    "related": [
      "/evidence",
      "/foundations/proof",
      "/foundations/continuity"
    ]
  },
  {
    "slug": "change",
    "markdownPath": "content/foundations/change.md",
    "title": "Change",
    "description": "Why change should be understood across the lifecycle, not only as a release event, and how change connects to proof, drift, and impact.",
    "truthSource": [
      "content/core/foundations/concept-change.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/concept-change.md"
    ],
    "related": [
      "/foundations/drift",
      "/foundations/impact",
      "/current-readiness"
    ]
  },
  {
    "slug": "impact",
    "markdownPath": "content/foundations/impact.md",
    "title": "Impact",
    "description": "Why downstream consequence visibility matters and how impact relates to continuity, drift, and evidence in software-driven systems.",
    "truthSource": [
      "content/core/foundations/impact.md"
    ],
    "derivedFrom": [
      "content/core/website-information-architecture.md",
      "content/core/foundations/impact.md"
    ],
    "related": [
      "/foundations/change",
      "/foundations/continuity",
      "/evidence"
    ]
  }
] as const;

export default entries;
