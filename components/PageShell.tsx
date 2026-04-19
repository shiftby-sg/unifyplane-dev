import { Breadcrumbs } from "./Breadcrumbs";
import { JumpMenu } from "./JumpMenu";
import styles from "./PageShell.module.css";
import type { TocHeading } from "./SideToc";
import { SideToc } from "./SideToc";

export function PageShell({
  pathname,
  children,
  width = "content",
  tocHeadings,
}: {
  pathname: string;
  children: React.ReactNode;
  width?: "content" | "wide";
  tocHeadings?: TocHeading[];
}) {
  const hasToc = Boolean(tocHeadings && tocHeadings.length > 0);
  const effectiveWidth = hasToc ? "wide" : width;
  return (
    <div
      className={`${styles.shell} ${
        effectiveWidth === "wide" ? styles.wide : styles.content
      }`}
      data-has-toc={hasToc ? "yes" : "no"}
    >
      <Breadcrumbs pathname={pathname} />
      {hasToc ? <JumpMenu headings={tocHeadings!} /> : null}
      <div className={styles.body}>
        <div className={styles.main}>{children}</div>
        {hasToc ? (
          <aside className={styles.aside}>
            <SideToc headings={tocHeadings!} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
