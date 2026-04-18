import Link from "next/link";
import styles from "./RelatedLinks.module.css";

export function RelatedLinks({ links }: { links: ReadonlyArray<string> }) {
  if (!links || links.length === 0) return null;
  return (
    <section className={styles.wrap} aria-label="Related pages">
      <h2 className={styles.title}>Related</h2>
      <ul className={styles.list}>
        {links.map((href) => (
          <li key={href}>
            <Link href={href}>{href}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

