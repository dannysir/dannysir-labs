import { notFound } from 'next/navigation';

import { FloatingDemo } from '@/components/floating-demo/FloatingDemo';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface FloatingComponentsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FloatingComponentsPage({
  params,
}: FloatingComponentsPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-mono text-3xl font-bold tracking-tight text-on-surface">
          {dict.floating.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          {dict.floating.description}
        </p>
      </header>
      <FloatingDemo dict={dict.floating} />
    </div>
  );
}
