import Link from 'next/link';

import { LocaleSwitcher } from '@/components/site/LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function Header({ locale, dict }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          aria-label={dict.header.home}
          className="text-base font-semibold tracking-tight text-forest hover:text-onyx"
        >
          {dict.siteName}
        </Link>
        <LocaleSwitcher
          currentLocale={locale}
          dict={dict.header.localeSwitcher}
        />
      </div>
    </header>
  );
}
