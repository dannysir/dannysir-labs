import { notFound } from 'next/navigation';

import { JsTeDemo } from '@/components/js-te-demo/JsTeDemo';
import { SparkleIcon } from '@/components/site/icons';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface JsTePageProps {
  params: Promise<{ locale: string }>;
}

export default async function JsTePage({ params }: JsTePageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface-high px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
          <SparkleIcon className="h-3.5 w-3.5" />
          {dict.landing.heroBadge}
        </span>
        <h1 className="glow-text font-mono text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {dict.jste.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {dict.jste.description}
        </p>
      </header>
      <JsTeDemo dict={dict.jste} />
    </div>
  );
}
