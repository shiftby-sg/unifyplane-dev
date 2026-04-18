import Link from "next/link";
import styles from "./SiteFooter.module.css";
import { secondaryNav } from "../lib/site/nav";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} UnifyPlane</span>
        <nav aria-label="Secondary" className={styles.links}>
          {secondaryNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

