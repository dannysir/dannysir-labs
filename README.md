# dannysir-labs

[@dannysir](https://github.com/dannysir) 가 만든 npm 라이브러리들을 **인터랙티브하게 시연**하는 사이트입니다. README/API 레퍼런스가 아니라, 라이브러리를 브라우저에서 직접 만져보는 데모가 핵심입니다.

- **배포**: https://dannysir-labs.vercel.app
- **스택**: Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript
- **다국어**: 한국어(기본) / 영어. 자체 dictionary + `app/[locale]/...` 라우팅. 헤더 우측 드롭다운으로 전환하며 선택은 쿠키(`NEXT_LOCALE`)에 저장됩니다.

현재 시연 중인 라이브러리:

| 라이브러리 | 시연 방식 |
| --- | --- |
| [`@dannysir/floating-components`](https://github.com/dannysir/floating-component) | npm 의존성을 그대로 임포트해 브라우저에서 실행 |
| [`@dannysir/js-te`](https://github.com/dannysir/js-te-package) | Node 전용이라 `@dannysir/js-te/browser` entry 를 위임받는 브라우저 미니 러너로 모사 |

---

## 로컬 개발

```bash
npm install
npm run dev      # http://localhost:3000 → /ko 로 redirect
```

### 표준 검증 명령어

의미 있는 변경 후 아래 셋이 **모두** 통과해야 합니다.

```bash
npx tsc --noEmit   # 타입 체크
npm run lint       # ESLint
npm run build      # 프로덕션 빌드
```

---

## 디렉터리 구조

```
app/
├── [locale]/
│   ├── layout.tsx                    # Header/Footer 셸
│   ├── page.tsx                      # 랜딩 (라이브러리 카드 그리드)
│   └── libraries/
│       ├── floating-components/page.tsx
│       └── js-te/page.tsx
├── layout.tsx                        # 루트 (<html lang> 동적 처리)
└── globals.css                       # Tailwind + @theme 색 팔레트
components/
├── site/                             # Header, Footer, LocaleSwitcher, LibraryCard
├── floating-demo/                    # floating-components 시연 ('use client')
└── js-te-demo/                       # js-te 에디터 / 결과 / 러너
lib/
├── libraries.ts                      # 라이브러리 메타데이터 (확장 포인트)
└── i18n/{config,dictionaries,ko,en}  # 다국어
proxy.ts                             # locale redirect + x-locale 헤더 (Next.js 16: 구 middleware.ts)
```

---

## 새 라이브러리 추가하기

1. **메타데이터 등록** — [`lib/libraries.ts`](lib/libraries.ts) 의 `libraries` 배열에 항목을 추가합니다. `status: 'coming-soon'` 으로 두면 카드가 비활성 + "곧 출시" 배지로 표시되니, 시연 페이지를 만들기 전에 먼저 카드만 노출할 수도 있습니다.

   ```ts
   {
     id: 'my-lib',
     slug: 'my-lib',                  // 시연 페이지 경로 세그먼트
     npmName: '@dannysir/my-lib',
     githubUrl: 'https://github.com/dannysir/my-lib',
     status: 'live',
     name: { ko: '...', en: '...' },
     tagline: { ko: '...', en: '...' },
     highlights: { ko: ['...'], en: ['...'] },
   }
   ```

2. **시연 페이지 추가** — `app/[locale]/libraries/<slug>/page.tsx` 를 만듭니다. 페이지 자체는 Server Component 로 두고, 인터랙션이 필요한 부분만 `components/<lib>-demo/` 의 `'use client'` 자식 컴포넌트로 분리합니다.

3. **번역 키 추가** — 시연 UI 에서 쓰는 사용자 노출 텍스트는 [`lib/i18n/ko.json`](lib/i18n/ko.json) 과 [`lib/i18n/en.json`](lib/i18n/en.json) **양쪽에 동시에** 추가합니다(한쪽만 추가하면 화면에 빈 문자열이 나옵니다). 키는 도메인 점 표기(`mylib.toolbar.run` 등)를 따릅니다. 사용자가 입력하는 코드나 예제 코드 자체는 번역하지 않습니다.

라이브러리가 브라우저에서 직접 동작하지 않는다면(예: Node 전용), `@dannysir/js-te` 처럼 브라우저용 entry 를 라이브러리 쪽에 추가하거나 미니 러너로 모사하는 방식을 검토하세요.

---

## js-te 미니 러너의 한계

`@dannysir/js-te` 의 원본은 Node.js native loader hooks(`module.registerHooks`) 위에서 동작합니다. 이 사이트의 시연은 라이브러리의 `@dannysir/js-te/browser` entry 를 위임받아 `describe` / `test`(`test.each` 포함) / `beforeEach` / `expect` / `fn()` 을 브라우저·Web Worker 에서 실행합니다.

- **모듈 모킹(`mock()`)은 모사할 수 없습니다.** loader hook 에 의존하므로 브라우저에서 동작 불가 — 해당 예제는 읽기 전용으로 코드만 보여주고 실행은 비활성화됩니다.
- 사용자 코드는 Web Worker 안에서 실행되며 **5초 타임아웃**이 걸려 있습니다(무한 루프 보호). Web Worker 미지원 브라우저에서는 메인 스레드 fallback 으로 실행되며 타임아웃 보호가 없습니다.
