import { Breadcrumbs } from "./Breadcrumbs";
import styles from "./PageShell.module.css";

export function PageShell({
  pathname,
  children,
  width = "content",
}: {
  pathname: string;
  children: React.ReactNode;
  width?: "content" | "wide";
}) {
  return (
    <div
      className={`${styles.shell} ${
        width === "wide" ? styles.wide : styles.content
      }`}
    >
      <Breadcrumbs pathname={pathname} />
      {children}
    </div>
  );
}
