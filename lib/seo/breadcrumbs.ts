export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ name: "Home", path: "/" }];
  if (parts.length === 0) return items;

  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    const name = part
      .split("-")
      .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
      .join(" ");
    items.push({ name, path: acc });
  }
  return items;
}

