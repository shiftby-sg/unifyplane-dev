import styles from "./SideToc.module.css";

export type TocHeading = { depth: number; text: string; id: string };

export function SideToc({ headings }: { headings: TocHeading[] }) {
  if (!headings || headings.length === 0) return null;
  return (
    <nav className={styles.wrap} aria-label="On this page">
      <div className={styles.title}>On this page</div>
      <ul className={styles.list}>
        {headings.map((h) => {
          const depthClass =
            h.depth === 3 ? styles.depth3 : h.depth === 4 ? styles.depth4 : "";
          return (
            <li key={h.id} className={`${styles.item} ${depthClass}`}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

