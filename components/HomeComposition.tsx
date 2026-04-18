import Link from "next/link";
import styles from "./HomeComposition.module.css";
import type { HomeComposition } from "../lib/content/compositions";

function TrustBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.trustBox} aria-label={label}>
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
        <section className={styles.hero}>
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
        </section>
      ) : null}

      <section className={styles.sections} aria-label="Homepage sections">
        {why && why.kind === "summary" ? (
          <section className={styles.section} aria-label="Why it matters in practice">
            <h2 className={styles.sectionTitle}>Why this matters in practice</h2>
            <Link href={why.href} className={`${styles.card} ${styles.cardEmphasis}`}>
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

        {readiness && readiness.kind === "summary" ? (
          <section className={styles.section} aria-label="Current readiness">
            <h2 className={styles.sectionTitle}>Current Readiness</h2>
            <Link href={readiness.href} className={`${styles.card} ${styles.cardEmphasis}`}>
              <h3 className={styles.cardTitle}>{readiness.title}</h3>
              <p className={styles.cardDesc}>{readiness.description}</p>
            </Link>
            <TrustBox label="Readiness boundary">
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

        {evidence && evidence.kind === "summary" ? (
          <section className={styles.section} aria-label="Evidence">
            <h2 className={styles.sectionTitle}>Evidence</h2>
            <Link href={evidence.href} className={`${styles.card} ${styles.cardEmphasis}`}>
              <h3 className={styles.cardTitle}>{evidence.title}</h3>
              <p className={styles.cardDesc}>{evidence.description}</p>
            </Link>
            <TrustBox label="Evidence scope">
              <p className={styles.trustLine}>Artifacts and runs support current claims.</p>
              <p className={styles.trustLine}>Evidence does not equal full maturity.</p>
              <p className={styles.trustLine}>
                Evidence is about artifacts, runs, and what they support. It should clarify current
                claims, not inflate maturity.
              </p>
            </TrustBox>
          </section>
        ) : null}

        <section className={styles.pair} aria-label="Operational parts and deeper foundations">
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
        </section>
      </section>

      {links && links.kind === "links" ? (
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
      ) : null}
    </>
  );
}
