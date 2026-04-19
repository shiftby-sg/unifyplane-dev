"use client";

import styles from "./JumpMenu.module.css";
import type { TocHeading } from "./SideToc";

export function JumpMenu({ headings }: { headings: TocHeading[] }) {
  if (!headings || headings.length === 0) return null;

  return (
    <div className={styles.wrap} aria-label="Jump menu">
      <label className={styles.label} htmlFor="jump-menu-select">
        Jump to section
      </label>
      <select
        id="jump-menu-select"
        className={styles.select}
        defaultValue=""
        onChange={(e) => {
          const v = e.currentTarget.value;
          if (!v) return;
          window.location.hash = v;
        }}
      >
        <option value="" disabled>
          Select a section
        </option>
        {headings.map((h) => (
          <option key={h.id} value={h.id}>
            {h.depth === 3 ? `  ${h.text}` : h.depth === 4 ? `    ${h.text}` : h.text}
          </option>
        ))}
      </select>
    </div>
  );
}

