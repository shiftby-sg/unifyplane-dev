import Link from "next/link";
import styles from "./Breadcrumbs.module.css";
import { breadcrumbsForPath } from "../lib/seo/breadcrumbs";

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const items = breadcrumbsForPath(pathname);
  if (items.length <= 1) return null;
  return (
    <nav aria-label="Breadcrumb" className={styles.wrap}>
      <ol className={styles.list}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.path} className={styles.item}>
              {idx > 0 ? <span className={styles.sep}>/</span> : null}{" "}
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

