import Link from "next/link";
import styles from "./SiteHeader.module.css";
import { primaryNav } from "../lib/site/nav";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          UnifyPlane
        </Link>
        <nav aria-label="Primary" className={styles.desktopNav}>
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

