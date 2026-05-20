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
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    tryFloating: string;
    tryJsTe: string;
    librariesHeading: string;
    features: {
      runTitle: string;
      runDesc: string;
      npmTitle: string;
      npmDesc: string;
      ossTitle: string;
      ossDesc: string;
    };
    builtWith: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
  card: {
    npm: string;
    github: string;
    demo: string;
    comingSoon: string;
  };
  floating: {
    title: string;
    description: string;
    toolbar: {
      splitH: string;
      splitV: string;
      addPanel: string;
      reset: string;
      selectedHint: string;
      noSelection: string;
    };
    inspector: {
      title: string;
    };
    panelLabel: string;
  };
  jste: {
    title: string;
    description: string;
    exampleLabel: string;
    examples: {
      hello: string;
      matchers: string;
      each: string;
      fn: string;
      mock: string;
    };
    run: string;
    running: string;
    mockBanner: string;
    results: {
      heading: string;
      idle: string;
      summary: string;
      timeout: string;
      runtimeError: string;
      nodeOnlyMockDetected: string;
      consoleHeading: string;
      noWorker: string;
    };
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  ko: koDict satisfies Dictionary,
  en: enDict satisfies Dictionary,
};

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
