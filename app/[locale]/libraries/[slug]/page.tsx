import { notFound } from 'next/navigation';

import { FloatingDemo } from '@/components/floating-demo/FloatingDemo';
import { JsTeDemo } from '@/components/js-te-demo/JsTeDemo';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface LibraryDemoPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const introClass = 'max-w-3xl text-sm leading-relaxed text-on-surface-variant';

export default async function LibraryDemoPage({
  params,
}: LibraryDemoPageProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDictionary(locale as Locale);

  if (slug === 'floating-components') {
    return (
      <div className="space-y-6">
        <p className={introClass}>{dict.floating.description}</p>
        <FloatingDemo dict={dict.floating} />
      </div>
    );
  }

  if (slug === 'js-te') {
    return (
      <div className="space-y-6">
        <p className={introClass}>{dict.jste.description}</p>
        <JsTeDemo dict={dict.jste} />
      </div>
    );
  }

  notFound();
}
