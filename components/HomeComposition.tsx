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
        </section>
      ) : null}

      <section className={styles.contextBand} data-home-band="context" aria-label="Context">
        <div className={styles.contextGrid}>
          {why && why.kind === "summary" ? (
            <section className={styles.section} aria-label="Why it matters in practice">
              <h2 className={styles.sectionTitle}>Why this matters in practice</h2>
              <Link href={why.href} className={styles.card}>
                <h3 className={styles.cardTitle}>{why.title}</h3>
                <p className={styles.cardDesc}>{why.description}</p>
              </Link>
            </section>
          ) : null}

          {what && what.kind === "summary" ? (
            <section className={styles.section} aria-label="What UnifyPlane is">
              <h2 className={styles.sectionTitle}>What UnifyPlane is</h2>
              <Link href={what.href} className={styles.card}>
                <h3 className={styles.cardTitle}>{what.title}</h3>
                <p className={styles.cardDesc}>{what.description}</p>
              </Link>
            </section>
          ) : null}
        </div>
      </section>

      <section className={styles.trustBand} data-home-band="trust" aria-label="Trust anchors">
        <div className={styles.trustGrid}>
          {evidence && evidence.kind === "summary" ? (
            <section className={styles.trustPanel} aria-label="Evidence">
              <h2 className={styles.sectionTitle}>Evidence</h2>
              <Link href={evidence.href} className={`${styles.card} ${styles.cardEmphasis}`}>
                <h3 className={styles.cardTitle}>{evidence.title}</h3>
                <p className={styles.cardDesc}>{evidence.description}</p>
              </Link>
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
              <h2 className={styles.sectionTitle}>Current Readiness</h2>
              <Link href={readiness.href} className={`${styles.card} ${styles.cardEmphasis}`}>
                <h3 className={styles.cardTitle}>{readiness.title}</h3>
                <p className={styles.cardDesc}>{readiness.description}</p>
              </Link>
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
      </section>

      <section className={styles.routeBand} data-home-band="routes" aria-label="Onward routes">
        <div className={styles.pair}>
          {components && components.kind === "summary" ? (
            <section className={styles.section} aria-label="Components">
              <h2 className={styles.sectionTitle}>Operational parts</h2>
              <Link href={components.href} className={styles.card}>
                <h3 className={styles.cardTitle}>{components.title}</h3>
                <p className={styles.cardDesc}>{components.description}</p>
              </Link>
            </section>
          ) : null}

          {foundations && foundations.kind === "summary" ? (
            <section className={styles.section} aria-label="Foundations">
              <h2 className={styles.sectionTitle}>Deeper foundations</h2>
              <Link href={foundations.href} className={styles.card}>
                <h3 className={styles.cardTitle}>{foundations.title}</h3>
                <p className={styles.cardDesc}>{foundations.description}</p>
              </Link>
            </section>
          ) : null}
        </div>
      </section>

      {links && links.kind === "links" ? (
        <section className={styles.exploreBand} data-home-band="explore">
          <section className={styles.links}>
            <h2>{links.title}</h2>
            <ul className={styles.linksList}>
              {links.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </section>
      ) : null}
    </>
  );
}
