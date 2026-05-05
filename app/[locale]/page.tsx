import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{dict.siteName}</h1>
      <p className="mt-2 text-sm text-gray-500">locale = {locale}</p>
    </main>
  );
}
