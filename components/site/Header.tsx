import Link from 'next/link';

import { HeaderNav, type NavItem } from '@/components/site/HeaderNav';
import { LocaleSwitcher } from '@/components/site/LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function Header({ locale, dict }: HeaderProps) {
  const navItems: NavItem[] = [
    { href: `/${locale}`, label: dict.header.home, exact: true },
    {
      href: `/${locale}/libraries/floating-components`,
      label: 'floating-components',
    },
    { href: `/${locale}/libraries/js-te`, label: 'js-te' },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-baseline gap-8">
          <Link
            href={`/${locale}`}
            aria-label={dict.header.home}
            className="text-lg font-bold tracking-tight text-primary"
          >
            {dict.siteName}
          </Link>
          <HeaderNav items={navItems} />
        </div>
        <LocaleSwitcher
          currentLocale={locale}
          dict={dict.header.localeSwitcher}
        />
      </div>
    </header>
  );
}
