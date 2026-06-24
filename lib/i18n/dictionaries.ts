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
  libraries: {
    nav: {
      readme: string;
      demo: string;
      api: string;
    };
    github: string;
    loadError: string;
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
    constraints: {
      label: string;
      min: string;
      max: string;
      clear: string;
      preset: string;
      overflowToggle: string;
      axisWidth: string;
      axisHeight: string;
      axisNone: string;
      hint: string;
      events: {
        set: string;
        clear: string;
      };
    };
    inspector: {
      title: string;
    };
    liveCanvas: string;
    activityLog: {
      title: string;
      clear: string;
      empty: string;
      events: {
        init: string;
        split: string;
        add: string;
        move: string;
        resize: string;
        reset: string;
        close: string;
      };
    };
    closePanel: string;
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
      only: string;
      onlyEach: string;
      skip: string;
      skipEach: string;
      todo: string;
      mock: string;
    };
    run: string;
    running: string;
    clear: string;
    fileName: string;
    editorLabel: string;
    terminalLabel: string;
    status: {
      ready: string;
      running: string;
      pass: string;
      fail: string;
    };
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
