import styles from "./Prose.module.css";

export function Prose({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={styles.prose}
    />
  );
}
