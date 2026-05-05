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
    <article className="flex flex-col rounded-lg border border-gray-200 p-6 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          {library.name[locale]}
        </h3>
        {!isLive && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            {dict.comingSoon}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {library.tagline[locale]}
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {library.highlights[locale].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            {dict.npm}
          </a>
          <a
            href={library.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            {dict.github}
          </a>
        </div>
        {isLive ? (
          <Link
            href={demoHref}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {dict.demo}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-400"
          >
            {dict.demo}
          </span>
        )}
      </div>
    </article>
  );
}
