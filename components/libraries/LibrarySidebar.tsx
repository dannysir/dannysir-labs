'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BookIcon, CodeIcon, LinkIcon, PlayIcon } from '@/components/site/icons';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface LibrarySidebarProps {
  locale: Locale;
  slug: string;
  githubUrl: string;
  dict: Dictionary['libraries'];
}

export function LibrarySidebar({
  locale,
  slug,
  githubUrl,
  dict,
}: LibrarySidebarProps): React.ReactElement {
  const pathname = usePathname();
  const base = `/${locale}/libraries/${slug}`;

  const items = [
    { key: 'readme', href: `${base}/readme`, label: dict.nav.readme, Icon: BookIcon },
    { key: 'demo', href: base, label: dict.nav.demo, Icon: PlayIcon },
    { key: 'api', href: `${base}/api`, label: dict.nav.api, Icon: CodeIcon },
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map(({ key, href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              className={[
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-high hover:text-on-surface',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 hidden w-full items-center justify-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 font-mono text-xs font-bold text-on-primary transition hover:brightness-110 lg:flex"
      >
        <LinkIcon className="h-3.5 w-3.5" />
        {dict.github}
      </a>
    </aside>
  );
}
