import Link from "next/link";
import styles from "./HomeComposition.module.css";
import type { HomeComposition } from "../lib/content/compositions";

function TrustBox({
  label,
  variant,
  children,
}: {
  label: string;
  variant?: "readiness" | "evidence";
  children: React.ReactNode;
}) {
  const variantClass =
    variant === "readiness"
      ? styles.trustBoxReadiness
      : variant === "evidence"
        ? styles.trustBoxEvidence
        : "";
  return (
    <section className={`${styles.trustBox} ${variantClass}`} aria-label={label}>
      <div className={styles.trustLabel}>{label}</div>
      <div className={styles.trustBody}>{children}</div>
    </section>
  );
}

export function HomeCompositionView({ composition }: { composition: HomeComposition }) {
  const hero = composition.sections.find((s) => s.kind === "hero");
  const links = composition.sections.find((s) => s.kind === "links");
  const summaries = new Map(
    composition.sections
      .filter((s) => s.kind === "summary")
      .map((s) => [s.id, s]),
  );

  const what = summaries.get("what");
  const why = summaries.get("why");
  const readiness = summaries.get("readiness");
  const evidence = summaries.get("evidence");
  const components = summaries.get("components");
  const foundations = summaries.get("foundations");

  return (
    <>
      {hero && hero.kind === "hero" ? (
        <section className={styles.heroBand} data-home-band="hero">
          <div className={styles.bandInner}>
            <div className={styles.hero}>
              <h1 className={styles.headline}>{hero.headline}</h1>
              <p className={styles.subhead}>{hero.subhead}</p>
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

      <section className={styles.contextBand} data-home-band="context" aria-label="Context">
        <div className={styles.bandInner}>
          <h2 className={styles.bandTitle}>Start here</h2>
          <p className={styles.bandIntro}>
            Begin with the plain-language definition and why the problem matters in practice.
          </p>
          <div className={styles.contextGrid}>
            {why && why.kind === "summary" ? (
              <section className={styles.section} aria-label="Why it matters">
                <h3 className={styles.sectionTitle}>{why.title}</h3>
                <article className={styles.card}>
                  <p className={styles.cardDesc}>{why.description}</p>
                  <Link className={styles.cardLink} href={why.href}>
                    See why it matters
                  </Link>
                </article>
              </section>
            ) : null}

            {what && what.kind === "summary" ? (
              <section className={styles.section} aria-label="What is UnifyPlane">
                <h3 className={styles.sectionTitle}>{what.title}</h3>
                <article className={styles.card}>
                  <p className={styles.cardDesc}>{what.description}</p>
                  <Link className={styles.cardLink} href={what.href}>
                    Read definition
                  </Link>
                </article>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.trustBand} data-home-band="trust" aria-label="Trust anchors">
        <div className={styles.bandInner}>
          <h2 className={styles.bandTitle}>Trust anchors</h2>
          <p className={styles.bandIntro}>
            Use readiness and evidence as the truth boundary for interpreting claims.
          </p>
          <div className={styles.trustGrid}>
            {evidence && evidence.kind === "summary" ? (
              <section className={styles.trustPanel} aria-label="Evidence">
                <h3 className={styles.sectionTitle}>{evidence.title}</h3>
                <article className={`${styles.card} ${styles.cardEmphasis}`}>
                  <p className={styles.cardDesc}>{evidence.description}</p>
                  <Link className={styles.cardLink} href={evidence.href}>
                    Review evidence
                  </Link>
                </article>
                <TrustBox label="Evidence scope" variant="evidence">
                  <p className={styles.trustLine}>
                    Artifacts and runs (proof + drift surfaces) support current claims within explicit
                    boundaries.
                  </p>
                  <p className={styles.trustLine}>
                    Use evidence to assess whether control and security assumptions still hold; it does
                    not equal full maturity.
                  </p>
                </TrustBox>
              </section>
            ) : null}

            {readiness && readiness.kind === "summary" ? (
              <section className={styles.trustPanel} aria-label="Current readiness">
                <h3 className={styles.sectionTitle}>{readiness.title}</h3>
                <article className={`${styles.card} ${styles.cardEmphasis}`}>
                  <p className={styles.cardDesc}>{readiness.description}</p>
                  <Link className={styles.cardLink} href={readiness.href}>
                    See current readiness
                  </Link>
                </article>
                <TrustBox label="Readiness boundary" variant="readiness">
                  <div className={styles.rail} aria-label="Readiness buckets">
                    <div className={`${styles.railItem} ${styles.railProven}`}>Proven now</div>
                    <div className={`${styles.railItem} ${styles.railImmature}`}>
                      Implemented but immature
                    </div>
                    <div className={`${styles.railItem} ${styles.railFuture}`}>Future but grounded</div>
                  </div>
                  <p className={styles.trustLine}>
                    Readiness is separated into what is proven now, what is implemented but immature,
                    and what remains future but grounded.
                  </p>
                  <p className={styles.routeLine}>
                    Use this page as the truth boundary for interpreting claims elsewhere.
                  </p>
                </TrustBox>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.routeBand} data-home-band="routes" aria-label="Onward routes">
        <div className={styles.bandInner}>
          <h2 className={styles.bandTitle}>Onward routes</h2>
          <p className={styles.bandIntro}>
            Explore the components you can run and the foundations behind the approach.
          </p>
          <div className={styles.pair}>
            {components && components.kind === "summary" ? (
              <section className={styles.section} aria-label="Components">
                <h3 className={styles.sectionTitle}>Components</h3>
                <article className={styles.card}>
                  <p className={styles.cardDesc}>{components.description}</p>
                  <Link className={styles.cardLink} href={components.href}>
                    Explore components
                  </Link>
                </article>
              </section>
            ) : null}

            {foundations && foundations.kind === "summary" ? (
              <section className={styles.section} aria-label="Foundations">
                <h3 className={styles.sectionTitle}>Foundations</h3>
                <article className={styles.card}>
                  <p className={styles.cardDesc}>{foundations.description}</p>
                  <Link className={styles.cardLink} href={foundations.href}>
                    Browse foundations
                  </Link>
                </article>
              </section>
            ) : null}
          </div>
        </div>
      </section>

      {links && links.kind === "links" ? (
        <section className={styles.exploreBand} data-home-band="explore">
          <div className={styles.bandInner}>
            <section className={styles.links}>
              <h2 className={styles.bandTitle}>{links.title}</h2>
              <ul className={styles.linksList}>
                {links.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      ) : null}
    </>
  );
}
