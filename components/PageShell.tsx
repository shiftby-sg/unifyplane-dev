import { Breadcrumbs } from "./Breadcrumbs";

export function PageShell({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs pathname={pathname} />
      {children}
    </>
  );
}

