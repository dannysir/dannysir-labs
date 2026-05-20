import { notFound } from 'next/navigation';

import { JsTeDemo } from '@/components/js-te-demo/JsTeDemo';
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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-mono text-3xl font-bold tracking-tight text-on-surface">
          {dict.jste.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          {dict.jste.description}
        </p>
      </header>
      <JsTeDemo dict={dict.jste} />
    </div>
  );
}
