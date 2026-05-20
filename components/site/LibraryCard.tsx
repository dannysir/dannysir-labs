import Link from 'next/link';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Library } from '@/lib/libraries';

interface LibraryCardProps {
  library: Library;
  locale: Locale;
  dict: Dictionary['card'];
}

export function LibraryCard({ library, locale, dict }: LibraryCardProps) {
  const isLive = library.status === 'live';
  const npmUrl = `https://www.npmjs.com/package/${library.npmName}`;
  const demoHref = `/${locale}/libraries/${library.slug}`;
  return (
    <article className="glass-card glass-card-hover relative flex flex-col rounded-xl p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-lg font-semibold tracking-tight text-on-surface">
          {library.name[locale]}
        </h3>
        {!isLive && (
          <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-xs text-secondary">
            {dict.comingSoon}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-on-surface-variant">
        {library.tagline[locale]}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {library.highlights[locale].map((item) => (
          <li
            key={item}
            className="rounded-full border border-outline-variant/30 bg-surface-high/60 px-2.5 py-1 font-mono text-xs text-on-surface-variant"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <div className="relative z-10 flex gap-4 font-mono text-xs">
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            {dict.npm}
          </a>
          <a
            href={library.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            {dict.github}
          </a>
        </div>
        {isLive ? (
          <Link
            href={demoHref}
            aria-label={`${library.name[locale]} — ${dict.demo}`}
            className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-bold text-on-primary shadow-[0_0_20px_rgba(138,235,255,0.25)] transition-shadow hover:shadow-[0_0_30px_rgba(138,235,255,0.45)]"
          >
            <span className="absolute inset-0 rounded-xl" aria-hidden="true" />
            {dict.demo}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-lg bg-surface-high px-3.5 py-1.5 text-sm font-medium text-on-surface-variant/50"
          >
            {dict.demo}
          </span>
        )}
      </div>
    </article>
  );
}
