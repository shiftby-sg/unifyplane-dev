import styles from "./BoundaryStatus.module.css";

export type BoundaryVariant = "proven" | "implemented-immature" | "future-grounded";

function variantClass(v: BoundaryVariant): string {
  if (v === "proven") return styles.proven ?? "";
  if (v === "implemented-immature") return styles.immature ?? "";
  return styles.future ?? "";
}

function labelFor(v: BoundaryVariant): string {
  if (v === "proven") return "Proven now";
  if (v === "implemented-immature") return "Implemented but immature";
  return "Future but grounded";
}

export function BoundaryStatus({
  variant,
  note,
}: {
  variant: BoundaryVariant;
  note: string;
}) {
  return (
    <section className={`${styles.box} ${variantClass(variant)}`} aria-label="Boundary">
      <div className={styles.label}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{labelFor(variant)}</span>
      </div>
      <p className={styles.note}>{note}</p>
    </section>
  );
}
