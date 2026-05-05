import 'server-only';

import enDict from './en.json';
import koDict from './ko.json';
import type { Locale } from './config';

export type Dictionary = {
  siteName: string;
  header: {
    home: string;
    localeSwitcher: {
      label: string;
      ko: string;
      en: string;
    };
  };
  footer: {
    copyright: string;
    githubProfile: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    librariesHeading: string;
  };
  card: {
    npm: string;
    github: string;
    demo: string;
    comingSoon: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  ko: koDict satisfies Dictionary,
  en: enDict satisfies Dictionary,
};

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
