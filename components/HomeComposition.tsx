import Link from "next/link";
import styles from "./HomeComposition.module.css";
import type { HomeComposition } from "../lib/content/compositions";
import { BoundaryStatus } from "./BoundaryStatus";

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
            <div className={styles.boundary}>
              <BoundaryStatus
                variant="proven"
                note="Readiness is expressed as boundaries: proven now, implemented but immature, and future but grounded."
              />
            </div>
          </section>
        ) : null}

        {evidence && evidence.kind === "summary" ? (
          <section className={styles.section} aria-label="Evidence">
            <h2 className={styles.sectionTitle}>Evidence</h2>
            <Link href={evidence.href} className={`${styles.card} ${styles.cardEmphasis}`}>
              <h3 className={styles.cardTitle}>{evidence.title}</h3>
              <p className={styles.cardDesc}>{evidence.description}</p>
            </Link>
            <div className={styles.boundary}>
              <BoundaryStatus
                variant="implemented-immature"
                note="Evidence is about artifacts and what they prove (and do not prove). Evidence is not a maturity claim."
              />
            </div>
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
