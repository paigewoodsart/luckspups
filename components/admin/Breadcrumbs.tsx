import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-brown-soft">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link href={item.href} className="hover:text-sky-deep hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-brown">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2 text-sky">/</span>}
        </span>
      ))}
    </nav>
  );
}
