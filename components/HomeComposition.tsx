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
  const readiness = summaries.get("readiness");
  const evidence = summaries.get("evidence");
  const components = summaries.get("components");
  const foundations = summaries.get("foundations");
  const componentLinks = [
    {
      href: "/components/unifyplane-core",
      title: "UnifyPlane Core",
      meta: "Execution and evidence center",
      accentClass: styles.componentTileCore,
    },
    {
      href: "/components/agent-runtime",
      title: "Agent Runtime",
      meta: "Bounded AI execution path",
      accentClass: styles.componentTileAgent,
    },
    {
      href: "/components/inspect-repo",
      title: "Inspect Repo",
      meta: "Repo inspection and drift visibility",
      accentClass: styles.componentTileInspect,
    },
  ];
  const foundationLinks = [
    {
      href: "/foundations/continuity",
      title: "Continuity",
      meta: "System Context",
      more: "Intended change baseline.",
      accentClass: styles.foundationNodeContinuity,
      areaClass: styles.foundationAnchor,
    },
    {
      href: "/foundations/proof",
      title: "Proof",
      meta: "Verified state",
      more: "What is derived from evidence.",
      accentClass: styles.foundationNodeProof,
      areaClass: styles.foundationSupportNode,
    },
    {
      href: "/foundations/drift",
      title: "Drift",
      meta: "Alignment loss",
      more: "Difference between intended and actual behavior accumulates.",
      accentClass: styles.foundationNodeDrift,
      areaClass: styles.foundationChainNode,
    },
    {
      href: "/foundations/evidence",
      title: "Evidence",
      meta: "Observed behavior",
      more: "Signals that substantiate current claims.",
      accentClass: styles.foundationNodeEvidence,
      areaClass: styles.foundationSupportNode,
    },
    {
      href: "/foundations/change",
      title: "Change",
      meta: "Lifecycle",
      more: "Where the relationship starts.",
      accentClass: styles.foundationNodeChange,
      areaClass: styles.foundationChainNode,
    },
    {
      href: "/foundations/impact",
      title: "Impact",
      meta: "Consequence",
      more: "Where behavior matters operationally.",
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
                <div className={styles.modelConnector} aria-hidden="true">â†’</div>
                <div className={styles.modelNode}>
                  <span className={styles.modelLabel}>Built</span>
                  <span className={styles.modelDetail}>implemented reality</span>
                </div>
                <div className={styles.modelConnector} aria-hidden="true">â†’</div>
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

      {readiness && readiness.kind === "summary" && evidence && evidence.kind === "summary" ? (
        <section className={styles.proofBand} data-home-band="truth-evidence" aria-label="Current truth and evidence">
          <div className={styles.bandInner}>
            <div className={styles.proofContent}>
              <h2 className={styles.bandTitle}>Current truth and evidence</h2>
              <p className={styles.bandIntro}>
                Readiness defines what can be claimed now. Evidence shows what supports it.
              </p>
              <div className={styles.proofGrid}>
                <article className={styles.proofPanel} aria-label="Current readiness">
                  <h3 className={styles.sectionTitle}>{readiness.title}</h3>
                  <p className={styles.signalText}>Current claims are separated by maturity.</p>
                  <ul className={styles.signalList} aria-label="Readiness buckets">
                    <li>Proven now</li>
                    <li>Implemented but immature</li>
                    <li>Future but grounded</li>
                  </ul>
                  <Link className={styles.cardLink} href={readiness.href}>
                    See current readiness
                  </Link>
                </article>
                <article className={styles.proofPanel} aria-label="Evidence">
                  <h3 className={styles.sectionTitle}>{evidence.title}</h3>
                  <p className={styles.signalText}>Artifacts and runs show what current claims can support.</p>
                  <ul className={styles.signalList} aria-label="Evidence surfaces">
                    <li>Artifacts</li>
                    <li>Runs</li>
                    <li>Proof surfaces</li>
                    <li>Drift surfaces</li>
                  </ul>
                  <Link className={styles.cardLink} href={evidence.href}>
                    Review evidence
                  </Link>
                </article>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.routeBand} data-home-band="routes" aria-label="Onward routes">
        <div className={styles.bandInner}>
          <div className={styles.routeStack}>
            <section className={styles.routeSection} aria-label="Components">
              <h2 className={styles.bandTitle}>Operational paths</h2>
              <p className={styles.bandIntro}>
                Move from current proof into the parts you can inspect and the foundations behind them.
              </p>
              {components && components.kind === "summary" ? (
                <article className={styles.signalPanel}>
                  <h3 className={styles.sectionTitle}>Components</h3>
                  <p className={styles.signalText}>Operational parts you can inspect or run.</p>
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
                <h3 className={styles.sectionTitle}>Foundations</h3>
                <p className={styles.signalText}>Deeper concepts stay secondary to current truth.</p>
                <div className={styles.foundationMap} aria-label="Foundation topics">
                  <div className={styles.foundationFrame}>
                    <div className={`${styles.foundationBand} ${styles.foundationContextBand}`} aria-label="Context">
                      <Link
                        href={foundationLinks[0].href}
                        className={`${styles.foundationNode} ${foundationLinks[0].accentClass} ${foundationLinks[0].areaClass}`}
                      >
                        <span className={styles.foundationContextLine}>
                          <strong>{foundationLinks[0].title}</strong>
                          <span> - {foundationLinks[0].meta}</span>
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
                  Browse foundations
                </Link>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
