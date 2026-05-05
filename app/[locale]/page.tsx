import { notFound } from 'next/navigation';

import { LibraryCard } from '@/components/site/LibraryCard';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { libraries } from '@/lib/libraries';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-forest">
          {dict.landing.heroTitle}
        </h1>
        <p className="mt-3 text-lg text-cocoa">
          {dict.landing.heroSubtitle}
        </p>
      </section>
      <section>
        <h2 className="mb-6 text-xl font-semibold text-forest">
          {dict.landing.librariesHeading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {libraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
              locale={locale as Locale}
              dict={dict.card}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
