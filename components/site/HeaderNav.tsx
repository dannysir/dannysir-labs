'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

interface HeaderNavProps {
  items: NavItem[];
}

export function HeaderNav({ items }: HeaderNavProps): React.ReactElement {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`border-b-2 pb-1 font-mono text-xs transition-colors ${
              active
                ? 'border-primary font-extrabold text-primary'
                : 'border-transparent font-bold text-on-surface-variant hover:text-primary'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
