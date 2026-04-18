export function Prose({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        borderTop: "1px solid var(--color-border)",
        paddingTop: "var(--space-6)",
      }}
    />
  );
}
