"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./MobileNav.module.css";
import headerStyles from "./SiteHeader.module.css";
import { primaryNav } from "../lib/site/nav";

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reactId = useId();
  const panelId = `mobile-nav-${reactId.replaceAll(":", "")}`;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = getFocusable(panel);
    const first = focusables[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const currentFocusables = getFocusable(panel);
      if (currentFocusables.length === 0) return;
      const firstEl = currentFocusables[0]!;
      const lastEl = currentFocusables[currentFocusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (!active || active === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (active === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) return;
    toggleRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={headerStyles.mobileToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        Menu
      </button>
      {open ? (
        <>
          <div
            className={styles.overlay}
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
          >
            <div className={styles.panelHeader}>
              <strong>Navigate</strong>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav aria-label="Primary (mobile)">
              <ul className={styles.navList}>
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
