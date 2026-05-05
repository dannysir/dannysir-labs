import 'server-only';
import type { Locale } from './config';

export type Dictionary = {
  siteName: string;
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ko: () => import('./ko.json').then((m) => m.default),
  en: () => import('./en.json').then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
