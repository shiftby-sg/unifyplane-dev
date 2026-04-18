import Link from "next/link";
import styles from "./HomeComposition.module.css";
import type { HomeComposition } from "../lib/content/compositions";

export function HomeCompositionView({ composition }: { composition: HomeComposition }) {
  const hero = composition.sections.find((s) => s.kind === "hero");
  const summaries = composition.sections.filter((s) => s.kind === "summary");
  const links = composition.sections.find((s) => s.kind === "links");

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

      <section aria-label="Summaries" className={styles.grid}>
        {summaries.map((s) =>
          s.kind === "summary" ? (
            <Link key={s.id} href={s.href} className={styles.card}>
              <h2 className={styles.cardTitle}>{s.title}</h2>
              <p className={styles.cardDesc}>{s.description}</p>
            </Link>
          ) : null,
        )}
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

