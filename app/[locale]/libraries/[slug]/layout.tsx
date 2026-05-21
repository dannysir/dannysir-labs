import { notFound } from 'next/navigation';

import { LibrarySidebar } from '@/components/libraries/LibrarySidebar';
import { SparkleIcon } from '@/components/site/icons';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { libraries } from '@/lib/libraries';

export function generateStaticParams() {
  return libraries.map((library) => ({ slug: library.slug }));
}

interface LibraryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LibraryLayout({
  children,
  params,
}: LibraryLayoutProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const library = libraries.find((entry) => entry.slug === slug);
  if (!library) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface-high px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
          <SparkleIcon className="h-3.5 w-3.5" />
          {dict.landing.heroBadge}
        </span>
        <h1 className="glow-text font-mono text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {library.npmName}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {library.tagline[locale as Locale]}
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <LibrarySidebar
          locale={locale as Locale}
          slug={slug}
          githubUrl={library.githubUrl}
          dict={dict.libraries}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
