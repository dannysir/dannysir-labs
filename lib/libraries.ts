export interface LibraryText {
  ko: string;
  en: string;
}

export interface LibraryHighlights {
  ko: string[];
  en: string[];
}

export interface LibraryDocs {
  readme: LibraryText;
  api: LibraryText;
}

export interface Library {
  id: string;
  slug: string;
  npmName: string;
  githubUrl: string;
  status: 'live' | 'coming-soon';
  name: LibraryText;
  tagline: LibraryText;
  highlights: LibraryHighlights;
  docs: LibraryDocs;
}

const RAW = 'https://raw.githubusercontent.com';

export const libraries: Library[] = [
  {
    id: 'floating-components',
    slug: 'floating-components',
    npmName: '@dannysir/floating-components',
    githubUrl: 'https://github.com/dannysir/floating-component',
    status: 'live',
    name: {
      ko: '@dannysir/floating-components',
      en: '@dannysir/floating-components',
    },
    tagline: {
      ko: 'VS Code 스타일 패널 레이아웃을 React 한 줄로',
      en: 'VS Code-style panel layouts in one React component',
    },
    highlights: {
      ko: ['드래그 리사이즈', '패널 재배치', '동적 분할/추가'],
      en: ['Drag-resize borders', 'Reorder panels', 'Split/insert at runtime'],
    },
    docs: {
      readme: {
        ko: `${RAW}/dannysir/floating-component/main/README.ko.md`,
        en: `${RAW}/dannysir/floating-component/main/README.md`,
      },
      api: {
        ko: `${RAW}/dannysir/floating-component/main/doc/API.ko.md`,
        en: `${RAW}/dannysir/floating-component/main/doc/API.md`,
      },
    },
  },
  {
    id: 'js-te',
    slug: 'js-te',
    npmName: '@dannysir/js-te',
    githubUrl: 'https://github.com/dannysir/js-te-package',
    status: 'live',
    name: {
      ko: '@dannysir/js-te',
      en: '@dannysir/js-te',
    },
    tagline: {
      ko: 'Node.js native loader hooks 위에 올린 Jest 스타일 테스트 프레임워크',
      en: 'Jest-style test framework on top of Node native loader hooks',
    },
    highlights: {
      ko: ['describe/test/expect', 'fn() 모킹', 'test.each'],
      en: ['describe/test/expect', 'fn() mocking', 'test.each'],
    },
    docs: {
      readme: {
        ko: `${RAW}/dannysir/js-te-package/main/README.ko.md`,
        en: `${RAW}/dannysir/js-te-package/main/README.md`,
      },
      api: {
        ko: `${RAW}/dannysir/js-te-package/main/docs/reference/API.ko.md`,
        en: `${RAW}/dannysir/js-te-package/main/docs/reference/API.md`,
      },
    },
  },
];
