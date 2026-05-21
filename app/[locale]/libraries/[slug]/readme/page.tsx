import { notFound } from 'next/navigation';

import { DocError } from '@/components/docs/DocError';
import { Markdown } from '@/components/docs/Markdown';
import { loadDoc } from '@/lib/docs';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { libraries } from '@/lib/libraries';

interface ReadmePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ReadmePage({ params }: ReadmePageProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const library = libraries.find((entry) => entry.slug === slug);
  if (!library) notFound();
  const dict = getDictionary(locale as Locale);
  let doc;
  try {
    doc = await loadDoc(library.docs.readme[locale as Locale]);
  } catch {
    return <DocError dict={dict.libraries} githubUrl={library.githubUrl} />;
  }
  return <Markdown {...doc} />;
}
