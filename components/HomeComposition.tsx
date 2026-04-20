import Link from "next/link";
import styles from "./HomeComposition.module.css";
import type { HomeComposition } from "../lib/content/compositions";

function renderBlock(block: string, className: string) {
  return (
    <p className={className}>
      {block.split("\n").map((line, idx, arr) => (
        <span key={`${idx}-${line}`}>
          {line}
          {idx < arr.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}
export function HomeCompositionView({ composition }: { composition: HomeComposition }) {
  const hero = composition.sections.find((s) => s.kind === "hero");
  const recognition = composition.sections.find((s) => s.kind === "recognition");
  const summaries = new Map(
    composition.sections
      .filter((s) => s.kind === "summary")
      .map((s) => [s.id, s]),
  );

  const what = summaries.get("what");
  const components = summaries.get("components");
  const foundations = summaries.get("foundations");
  const readinessRows = [
    {
      href: "/current-readiness#proven-now",
      title: "Proven now",
      sentence: "Already working with real execution and supporting evidence.",
      meta: "Intent-to-runtime continuity · bounded execution · drift visibility · proof",
      accentClass: styles.readinessRowProven,
      emphasisClass: styles.readinessRowStrong,
    },
    {
      href: "/current-readiness#implemented-but-immature",
      title: "Implemented but immature",
      sentence: "Real capabilities, but still uneven in depth and coverage.",
      meta: "Emerging authorities · broader drift handling · early change assessment",
      accentClass: styles.readinessRowImmature,
      emphasisClass: styles.readinessRowMedium,
    },
    {
      href: "/current-readiness#future-but-grounded",
      title: "Future but grounded",
      sentence: "Valid direction, but not yet current capability.",
      meta: "Lifecycle assessment · impact visibility · assurance development",
      accentClass: styles.readinessRowFuture,
      emphasisClass: styles.readinessRowSoft,
    },
  ];
  const componentLinks = [
    {
      href: "/components/unifyplane-core",
      title: "UnifyPlane Core",
      meta: "Coordinates system-wide execution, evidence, control, and closure across the system.",
      accentClass: styles.componentTileCore,
    },
    {
      href: "/components/agent-runtime",
      title: "Agent Runtime",
      meta: "Runs within runtime boundaries, keeping behavior observable.",
      accentClass: styles.componentTileAgent,
    },
    {
      href: "/components/inspect-repo",
      title: "Inspect Repo",
      meta: "Inspects code and config to detect drift, intent gaps, and behavior changes.",
      accentClass: styles.componentTileInspect,
    },
  ];
  const foundationLinks = [
    {
      href: "/foundations/continuity",
      title: "Intent",
      meta: "",
      more: "What was intended",
      accentClass: styles.foundationNodeContinuity,
      areaClass: styles.foundationAnchor,
    },
    {
      href: "/foundations/proof",
      title: "Proof",
      meta: "What can be proven",
      more: "Backed by evidence",
      accentClass: styles.foundationNodeProof,
      areaClass: styles.foundationSupportNode,
    },
    {
      href: "/foundations/drift",
      title: "Drift",
      meta: "Behavior diverges",
      more: "Where intended and actual behavior diverge",
      accentClass: styles.foundationNodeDrift,
      areaClass: styles.foundationChainNode,
    },
    {
      href: "/foundations/evidence",
      title: "Evidence",
      meta: "What happened",
      more: "What actually happened",
      accentClass: styles.foundationNodeEvidence,
      areaClass: styles.foundationSupportNode,
    },
    {
      href: "/foundations/change",
      title: "Change",
      meta: "Introduced into the system",
      more: "A change is introduced",
      accentClass: styles.foundationNodeChange,
      areaClass: styles.foundationChainNode,
    },
    {
      href: "/foundations/impact",
      title: "Impact",
      meta: "Downstream effect",
      more: "What it causes next",
      accentClass: styles.foundationNodeImpact,
      areaClass: styles.foundationChainNode,
    },
  ];

  return (
    <>
      {hero && hero.kind === "hero" ? (
        <section className={styles.heroBand} data-home-band="hero">
          <div className={styles.bandInner}>
            <div className={styles.hero}>
              <h1 className={styles.headline}>{hero.headline}</h1>
              <h2 className={styles.coreSignal}>{hero.coreSignal}</h2>
              <p className={styles.identity}>{hero.identity}</p>
              <div className={styles.ctaRow}>
                <Link className={styles.ctaPrimary} href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Link>
                {hero.secondaryCta ? (
                  <Link className={styles.ctaSecondary} href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {recognition && recognition.kind === "recognition" ? (
        <section
          className={styles.recognitionBand}
          data-home-band="recognition"
          aria-label="Why this matters in practice"
        >
          <div className={styles.bandInner}>
            <div className={styles.recognitionContent}>
              <h2 className={styles.bandTitle}>{recognition.title}</h2>
              <div className={styles.recognitionBlocks}>
                {recognition.groups.map((group, i) => (
                  <div
                    key={i}
                    className={`${styles.recognitionGroup} ${
                      i === 2 ? styles.recognitionGroupCompact : ""
                    }`}
                  >
                    <p className={styles.recognitionLead}>{group.lead}</p>
                    {group.body ? renderBlock(group.body, styles.recognitionBody) : null}
                    {group.list?.length ? (
                      <ul className={styles.recognitionList}>
                        {group.list.map((item) => (
                          <li className={styles.recognitionListItem} key={item}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {what && what.kind === "summary" && "blocks" in what ? (
        <section className={styles.definitionBand} data-home-band="definition" aria-label="What is UnifyPlane">
          <div className={styles.bandInner}>
            <div className={styles.definitionContent}>
              <div className={styles.definitionCopy}>
                <h2 className={styles.bandTitle}>{what.title}</h2>
                <div className={styles.definitionBlocks}>
                  {what.blocks.map((block, i) => (
                    <div key={i}>{renderBlock(block, styles.definitionBlock)}</div>
                  ))}
                </div>
                <Link className={styles.cardLink} href={what.href}>
                  Read definition
                </Link>
              </div>
              <div className={styles.continuityModel} aria-label="Continuity model">
                <div className={styles.modelNode}>
                  <span className={styles.modelLabel}>Intended</span>
                  <span className={styles.modelDetail}>planned change</span>
                </div>
                <div className={styles.modelConnector} aria-hidden="true">→</div>
                <div className={styles.modelNode}>
                  <span className={styles.modelLabel}>Built</span>
                  <span className={styles.modelDetail}>implemented reality</span>
                </div>
                <div className={styles.modelConnector} aria-hidden="true">→</div>
                <div className={styles.modelNode}>
                  <span className={styles.modelLabel}>Running</span>
                  <span className={styles.modelDetail}>production behavior</span>
                </div>
                <p className={styles.modelEvidence}>Evidence keeps the connection visible.</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.readinessBand} data-home-band="readiness" aria-label="Current readiness">
        <div className={styles.bandInner}>
          <div className={styles.readinessContent}>
            <h2 className={styles.bandTitle}>Current readiness</h2>
            <p className={styles.bandIntro}>What can be claimed now depends on maturity — choose a level to explore.</p>
            <div className={styles.readinessList} aria-label="Readiness buckets">
              {readinessRows.map((row) => (
                <Link
                  key={row.href}
                  href={row.href}
                  className={`${styles.readinessRow} ${row.accentClass} ${row.emphasisClass}`}
                >
                  <span className={styles.readinessRowText}>
                    <span className={styles.readinessRowTitle}>{row.title}</span>
                    <span className={styles.readinessRowSentence}>{row.sentence}</span>
                    <span className={styles.readinessRowMeta}>{row.meta}</span>
                  </span>
                  <span className={styles.readinessRowArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
            <Link className={`${styles.cardLink} ${styles.readinessFooterLink}`} href="/current-readiness">
              See full readiness boundary
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.routeBand} data-home-band="routes" aria-label="Onward routes">
        <div className={styles.bandInner}>
          <div className={styles.routeStack}>
            <section className={styles.routeSection} aria-label="Components">
              <p className={styles.bandIntro}>
                From proof to execution - where evidence is produced.
              </p>
              {components && components.kind === "summary" ? (
                <article className={styles.signalPanel}>
                  <h3 className={styles.sectionTitle}>Components</h3>
                  <p className={styles.signalText}>The components that run the system, enforce execution boundaries, and make evidence visible.</p>
                  <div className={styles.componentGrid} aria-label="Operational components">
                    {componentLinks.map((component) => (
                      <Link
                        key={component.href}
                        href={component.href}
                        className={`${styles.componentTile} ${component.accentClass}`}
                      >
                        <span className={styles.componentTileTitle}>{component.title}</span>
                        <span className={styles.componentTileMeta}>{component.meta}</span>
                      </Link>
                    ))}
                  </div>
                  <Link className={styles.cardLink} href={components.href}>
                    Explore components
                  </Link>
                </article>
              ) : null}
            </section>

            {foundations && foundations.kind === "summary" ? (
              <section className={styles.routeSection} aria-label="Foundations">
                <p className={styles.bandIntro}>These components make change, drift, and evidence visible in the model below.</p>
                <h3 className={styles.sectionTitle}>How change moves through execution</h3>
                <p className={styles.signalText}>This model shows how change moves through the system, where it diverges, and how outcomes become visible.</p>
                <div className={styles.foundationMap} aria-label="Foundation topics">
                  <div className={styles.foundationFrame}>
                    <div className={`${styles.foundationBand} ${styles.foundationContextBand}`} aria-label="Context">
                      <Link
                        href={foundationLinks[0].href}
                        className={`${styles.foundationNode} ${foundationLinks[0].accentClass} ${foundationLinks[0].areaClass}`}
                      >
                        <span className={styles.foundationContextLine}>
                          <strong>{foundationLinks[0].title}</strong>
                          {foundationLinks[0].meta ? <span> - {foundationLinks[0].meta}</span> : null}
                        </span>
                        <span className={styles.foundationNodeMore}>{foundationLinks[0].more}</span>
                      </Link>
                    </div>

                    <span
                      className={`${styles.foundationBandConnector} ${styles.foundationContextConnector}`}
                      aria-hidden="true"
                    />

                    <div className={styles.foundationBand} aria-label="Process">
                      <div className={styles.foundationChainRow} aria-label="Primary foundation chain">
                        <Link
                          href={foundationLinks[4].href}
                          className={`${styles.foundationNode} ${foundationLinks[4].accentClass} ${foundationLinks[4].areaClass}`}
                        >
                          <span className={styles.foundationNodeTitle}>{foundationLinks[4].title}</span>
                          <span className={styles.foundationNodeMeta}>{foundationLinks[4].meta}</span>
                          <span className={styles.foundationNodeMore}>{foundationLinks[4].more}</span>
                        </Link>
                        <span className={styles.foundationNodeArrow} aria-hidden="true">
                          {"→"}
                        </span>
                        <Link
                          href={foundationLinks[2].href}
                          className={`${styles.foundationNode} ${foundationLinks[2].accentClass} ${foundationLinks[2].areaClass}`}
                        >
                          <span className={styles.foundationNodeTitle}>{foundationLinks[2].title}</span>
                          <span className={styles.foundationNodeMeta}>{foundationLinks[2].meta}</span>
                          <span className={styles.foundationNodeMore}>{foundationLinks[2].more}</span>
                        </Link>
                        <span className={styles.foundationNodeArrow} aria-hidden="true">
                          {"→"}
                        </span>
                        <Link
                          href={foundationLinks[5].href}
                          className={`${styles.foundationNode} ${foundationLinks[5].accentClass} ${foundationLinks[5].areaClass}`}
                        >
                          <span className={styles.foundationNodeTitle}>{foundationLinks[5].title}</span>
                          <span className={styles.foundationNodeMeta}>{foundationLinks[5].meta}</span>
                          <span className={styles.foundationNodeMore}>{foundationLinks[5].more}</span>
                        </Link>
                      </div>
                    </div>

                    <span
                      className={`${styles.foundationBandConnector} ${styles.foundationValidationConnector}`}
                      aria-hidden="true"
                    />

                    <div className={styles.foundationBand} aria-label="Validation">
                      <div className={styles.foundationSupportRow} aria-label="Supporting foundations">
                        <span className={styles.foundationSupportSpacer} aria-hidden="true" />
                        <Link
                          href={foundationLinks[3].href}
                          className={`${styles.foundationNode} ${styles.foundationSupportNode} ${foundationLinks[3].accentClass} ${foundationLinks[3].areaClass}`}
                        >
                          <span className={styles.foundationNodeTitle}>{foundationLinks[3].title}</span>
                          <span className={styles.foundationNodeMeta}>{foundationLinks[3].meta}</span>
                          <span className={styles.foundationNodeMore}>{foundationLinks[3].more}</span>
                        </Link>
                        <span className={styles.foundationNodeArrow} aria-hidden="true">
                          {"→"}
                        </span>
                        <Link
                          href={foundationLinks[1].href}
                          className={`${styles.foundationNode} ${styles.foundationSupportNode} ${styles.foundationNodeProof} ${foundationLinks[1].areaClass}`}
                        >
                          <span className={styles.foundationNodeTitle}>{foundationLinks[1].title}</span>
                          <span className={styles.foundationNodeMeta}>{foundationLinks[1].meta}</span>
                          <span className={styles.foundationNodeMore}>{foundationLinks[1].more}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <Link className={styles.cardLink} href={foundations.href}>
                  See the full model
                </Link>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}


