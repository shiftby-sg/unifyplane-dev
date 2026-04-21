import Link from "next/link";
import styles from "./SiteFooter.module.css";
import { secondaryNav } from "../lib/site/nav";

export function SiteFooter() {
  // Keep the footer calm and non-duplicative: primary navigation already exists in the header.
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} UnifyPlane</span>
        <div className={styles.navs}>
          <nav aria-label="Secondary" className={styles.secondary}>
            {secondaryNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
