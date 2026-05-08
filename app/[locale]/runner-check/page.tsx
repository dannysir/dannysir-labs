import { notFound } from 'next/navigation';

import { locales, type Locale } from '@/lib/i18n/config';

import { RunnerCheck } from './RunnerCheck';

interface RunnerCheckPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RunnerCheckPage({ params }: RunnerCheckPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return <RunnerCheck />;
}
