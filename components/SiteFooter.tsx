import Link from "next/link";
import styles from "./SiteFooter.module.css";
import { primaryNav, secondaryNav } from "../lib/site/nav";

export function SiteFooter() {
  const sectionLinks = primaryNav.filter((item) => item.href !== "/");
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} UnifyPlane</span>
        <div className={styles.navs}>
          <nav aria-label="Sections" className={styles.links}>
            {sectionLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
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
