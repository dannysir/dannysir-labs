# dannysir-labs — 라이브러리 시연 사이트 구축 계획

> **이 문서는 여러 세션에 걸쳐 단계적으로 진행하기 위한 작업 명세서입니다.**
> 새 세션을 시작할 때마다 이 문서를 먼저 읽고, "현재 진행 상태" 표를 보고 다음 미완료 Phase 를 이어서 진행하세요.

---

## 새 세션 시작 가이드 (READ ME FIRST)

새 세션이 열리면:

1. **이 문서를 먼저 읽으세요.** 가장 신뢰할 수 있는 작업 명세는 이 파일입니다.
2. 아래 "현재 진행 상태" 표에서 **마지막으로 완료된 Phase 와 다음 Phase** 를 확인합니다.
3. 해당 Phase 의 "작업 내용" / "산출물 (Deliverables)" / "검증" 을 읽고, 사용자에게 "Phase N 을 이어서 진행해도 될까요?" 라고 확인한 뒤 진행합니다.
4. Phase 를 완료하면 **이 문서의 진행 상태 표 체크박스를 갱신**하고, 그 Phase 섹션 끝의 "완료 메모" 에 한 줄 기록한 뒤 사용자에게 결과를 보고합니다.
5. 사용자의 글로벌 규칙 준수:
   - 모든 대화는 존댓말
   - 파일 수정·생성·리팩토링 전에 **플랜 모드** 진입 (이 문서가 이미 메인 플랜이므로, 각 Phase 진입 시에는 "이 Phase 의 작업을 시작하겠습니다" 정도 확인이면 충분)
   - **`git commit` / `git push` / PR 생성 전에는 매번 사전 허락**

작업 디렉터리: `/Users/san/dannysir-labs`
참조 라이브러리 (로컬 경로):
- `/Users/san/floating-component` (`@dannysir/floating-components`)
- `/Users/san/js-te-package` (`@dannysir/js-te`)
- `/Users/san/floating-demo` (Vite 기반 기존 데모 — 패턴 참고용)

플랜 원본 사본 위치: `/Users/san/.claude/plans/witty-jingling-lobster.md` (둘 중 하나를 갱신하면 다른 쪽도 동기화)

---

## Context (왜 이걸 만드는가)

사용자(dannysir)가 본인의 npm 라이브러리들을 **인터랙티브하게 시연**할 수 있는 단일 사이트가 필요합니다.

- `@dannysir/floating-components` — VS Code 스타일 패널 레이아웃 (React 19, 브라우저 직접 사용 가능)
- `@dannysir/js-te` — Node 22.15+ `module.registerHooks` 를 쓰는 Jest 스타일 테스트 프레임워크 (브라우저 직접 실행 불가 → 클라이언트 미니 러너로 모사)
- 향후 라이브러리 2개 추가 예정 → **확장 가능한 구조** 필수
- 각 라이브러리의 npm `homepage` 필드를 본 사이트의 시연 페이지로 연결할 예정
- 인터랙티브 시연이 핵심. README/API 레퍼런스 페이지는 만들지 않음 (각 라이브러리 저장소에 이미 존재).

---

## 핵심 결정 사항 (확정)

| 항목 | 결정 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind v4 (CSS-first, `@import "tailwindcss"`) |
| 패키지 매니저 | npm |
| 라이브러리 연결 | npm published 버전 dependency (`@dannysir/floating-components`). `@dannysir/js-te` 는 Node 전용이라 dependency 에 포함하지 않고 미니 러너로 모사. |
| 다국어 | 자체 dictionary (`lib/i18n/{ko,en}.json`) + `app/[locale]/...` 라우팅. 한국어 기본. 헤더 우측의 **드롭다운 버튼**으로 전환. 사용자 선택은 쿠키 `NEXT_LOCALE` 에 저장 (다음 방문 유지). **`Accept-Language` 자동 감지는 사용하지 않음** — 사용자가 명시적으로 버튼으로 바꿔야 함. |
| js-te 시연 방식 | 클라이언트 측 미니 러너. `mock()` 모킹은 코드 미리보기만, 실행 비활성. |
| 코드 에디터 | CodeMirror 6 (`@uiw/react-codemirror`) |
| 사이트 이름 | `dannysir-labs` (Vercel: `dannysir-labs.vercel.app`) |

---

## 디렉터리 구조 (목표)

```
/Users/san/dannysir-labs
├── PLAN.md                           # 본 문서
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 랜딩
│   │   └── libraries/
│   │       ├── floating-components/page.tsx
│   │       └── js-te/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── site/                         # Header, Footer, LocaleSwitcher, LibraryCard
│   ├── floating-demo/                # 'use client' 시연
│   └── js-te-demo/                   # Editor, Results, JsTeDemo (+ runner.ts, examples.ts)
├── lib/
│   ├── libraries.ts                  # 라이브러리 메타데이터 (확장 포인트)
│   └── i18n/{config.ts,dictionaries.ts,ko.json,en.json}
├── proxy.ts                          # locale 라우팅 (Next.js 16: 구 middleware.ts)
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

---

## 현재 진행 상태 (체크리스트)

| Phase | 제목 | 상태 |
| --- | --- | --- |
| 0 | 조사 + 결정 + 본 플랜 작성 | [x] 완료 |
| 1 | Next.js 프로젝트 생성 + i18n 골격 | [x] 완료 |
| 2 | 사이트 셸 (헤더/푸터/언어 토글) + 랜딩 페이지 | [x] 완료 |
| 3 | floating-components 시연 페이지 | [x] 완료 |
| 4 | js-te 미니 러너 (핵심 로직) | [ ] |
| 5 | js-te 시연 페이지 UI | [ ] |
| 6 | 다국어 사전 채우기 + 디자인 정돈 + README | [ ] |
| 7 | GitHub push + Vercel 배포 (사용자 사전 허락 필수) | [ ] |
| 8 | 두 라이브러리 저장소에 `homepage` 필드 추가 PR (사용자 사전 허락 필수) | [ ] |

> **Phase 를 완료할 때마다 위 표의 `[ ]` 를 `[x]` 로 바꾸고, 그 Phase 섹션 끝의 "완료 메모" 에 한 줄 기록**해 두세요. 그래야 새 세션에서 어디까지 했는지 빠르게 파악됩니다.

---

## Phase 1 — Next.js 프로젝트 생성 + i18n 골격

**목적**: 빈 디렉터리에 Next.js 16 / Tailwind v4 / TypeScript 프로젝트를 새로 생성하고, `app/[locale]/...` 구조와 proxy (구 middleware) locale redirect 까지 동작하는 최소 골격을 만듭니다.

**작업 내용**:
1. 프로젝트 초기 생성 (`npx create-next-app@latest .` — Next/React/TS/ESLint/Tailwind 의존성과 기본 설정 파일·디렉터리 구조를 한 번에 생성)
   - `npx create-next-app@latest .` (TypeScript, App Router, Tailwind v4, ESLint, src dir 미사용, alias `@/*`)
   - 생성된 기본 보일러플레이트 페이지 정리 (홈 페이지를 빈 placeholder 로)
2. `app/[locale]/layout.tsx` + `app/[locale]/page.tsx` (placeholder "ko/en" 표시) 생성
3. `lib/i18n/config.ts` — `locales = ['ko', 'en'] as const; defaultLocale = 'ko'`
4. `lib/i18n/dictionaries.ts` — `getDictionary(locale)` 동적 import
5. `lib/i18n/{ko,en}.json` — 빈 객체 또는 최소 키 (`siteName`)
6. `proxy.ts` (Next.js 16 에서 `middleware.ts` 가 `proxy.ts` 로 이름 변경됨) — 경로에 locale 이 없으면 쿠키 `NEXT_LOCALE` 우선, 쿠키도 없으면 기본값 `ko` 로 redirect. (`Accept-Language` 자동 감지는 쓰지 않음 — 사용자가 헤더 LocaleSwitcher 로 명시 변경)

**산출물 (Deliverables)**:
- `npm run dev` 실행 시 `/` → `/ko` redirect, `/ko` 와 `/en` 모두 200 응답
- `/ko/<무관경로>` 라도 `[locale]/page.tsx` 가 잡혀야 함 (현재는 페이지 한 개만 있어도 OK)
- `npm run build` 통과
- `npx tsc --noEmit` 통과

**검증**:
- 브라우저로 `http://localhost:3000/` → `/ko` 로 자동 이동 확인
- `http://localhost:3000/en` 직접 접근 가능 확인

**완료 메모**: 2026-05-05 Next.js 16.2.4 부트스트랩 + Tailwind v4 + i18n 골격 + proxy.ts (Next.js 16 에서 middleware → proxy 로 rename) 동작. tsc/lint/build 통과, dev 서버에서 / → /ko 307 redirect, /ko·/en 200, /zh → /ko/zh → 404, 쿠키 우선 redirect 모두 확인.

---

## Phase 2 — 사이트 셸 + 랜딩 페이지

**목적**: 모든 페이지에서 공통으로 쓸 헤더(언어 토글 포함)/푸터를 만들고, 랜딩 페이지에 라이브러리 카드 그리드를 띄웁니다.

**작업 내용**:
1. `lib/libraries.ts` — 라이브러리 메타데이터 모델과 초기 2개 항목
   ```ts
   export type Library = {
     id: string;
     slug: string;
     npmName: string;
     githubUrl: string;
     status: 'live' | 'coming-soon';
     name: { ko: string; en: string };
     tagline: { ko: string; en: string };
     highlights: { ko: string[]; en: string[] };
   };
   export const libraries: Library[] = [/* floating-components, js-te */];
   ```
2. `components/site/Header.tsx` — 좌측 사이트명 (홈 링크), 우측 `<LocaleSwitcher>` (현재 경로의 locale 만 바꿔 이동)
3. `components/site/Footer.tsx` — GitHub 프로필 / 저작권 한 줄
4. `components/site/LocaleSwitcher.tsx` — 헤더 우측의 **드롭다운 버튼** (현재 locale 을 라벨에 표시: 예 `🌐 KO ▾`). 클릭 시 `ko` / `en` 메뉴 노출 → 선택 시 (a) 쿠키 `NEXT_LOCALE` 저장, (b) `useRouter` + `usePathname` 으로 현재 경로의 locale 세그먼트만 치환해 이동. 메뉴 외부 클릭 시 닫힘, ESC 로도 닫힘. 접근성: `aria-haspopup="menu"`, 키보드 화살표로 항목 이동.
5. `components/site/LibraryCard.tsx` — name, tagline, npm/GitHub 보조 링크, 시연 버튼 (status 가 `coming-soon` 이면 비활성 + "곧 출시" 배지)
6. `app/[locale]/layout.tsx` 에 `<Header>` / `<Footer>` 배치
7. `app/[locale]/page.tsx` — `getDictionary(locale)` 로 hero 문구 가져오고, `libraries.map` 으로 카드 그리드 렌더

**산출물**:
- `/ko`, `/en` 모두 헤더/푸터 표시
- 언어 토글 동작 (현재 경로의 locale 세그먼트만 바뀌어야 함)
- 라이브러리 카드 2장 렌더 (시연 버튼은 다음 Phase 에서 만드는 라우트로 링크 — 이 시점에는 404 여도 OK)

**검증**:
- `npm run dev` 후 양 언어로 카드 표시 확인
- 모바일 폭(375px) 에서도 그리드 깨지지 않음
- `npm run build` / `tsc --noEmit` 통과

**완료 메모**: 2026-05-05 lib/libraries.ts + Header/Footer/LocaleSwitcher/LibraryCard + 사전 키 확장 + 랜딩 페이지 카드 그리드. tsc/lint/build 통과, /ko·/en 양쪽 hero/footer/카드 모두 렌더 확인. `<html lang>` 동적 처리는 Phase 6 으로 미룸 (옵션 1 권장: proxy → x-locale 헤더 → 루트 layout headers() 읽기).

---

## Phase 3 — floating-components 시연 페이지

**목적**: 라이브러리의 핵심 기능(드래그 리사이즈 / 패널 재배치 / 동적 분할·추가) 을 사용자가 직접 만져볼 수 있는 페이지를 만듭니다.

**작업 내용**:
1. `npm i @dannysir/floating-components` (peer: react>=18 충족)
2. `components/floating-demo/FloatingDemo.tsx` (`'use client'`)
   - 초기 트리 정의 (참조: `floating-demo/src/App.tsx` 의 패턴)
   - `useLayoutTree(initial)` 사용 → `tree`, `resizeBorder`, `movePanel`, `splitPanel`, `insertPanel`, `removePanel`
   - `<TreeLayout tree={tree} onResizeBorder={resizeBorder} onMovePanel={movePanel} ...>` 렌더
   - 패널 콘텐츠는 색상 + 라벨이 들어간 단순 div
3. `components/floating-demo/Toolbar.tsx`
   - "Split horizontal", "Split vertical", "Add panel", "Reset" 버튼
4. `components/floating-demo/TreeInspector.tsx` — 우측(또는 하단)에 현재 `tree` 상태를 JSON 으로 실시간 표시 (학습용)
5. `app/[locale]/libraries/floating-components/page.tsx` — 위 컴포넌트들을 배치
   - 페이지 자체는 서버 컴포넌트, 시연만 `'use client'` 자식

**산출물**:
- `/ko/libraries/floating-components`, `/en/...` 모두 동작
- 드래그 리사이즈, 패널 헤더 드래그 → 다른 패널 위로 드롭 시 재배치 동작
- 툴바 버튼 동작
- 트리 상태 인스펙터가 변경마다 갱신

**검증**:
- 브라우저에서 직접 인터랙션 (마우스 드래그 / 드롭 / 버튼 클릭)
- `npm run build` 통과 (특히 SSR 측 `window`/`document` 참조 에러 없는지)

**완료 메모**: 2026-05-06 @dannysir/floating-components ^0.2.4 도입 + FloatingDemo/Toolbar/TreeInspector/DemoPanel + i18n floating.* 키. 시연 중 라이브러리 루트 div 가 부모 크기를 못 채우는 이슈 발견 → 라이브러리 본체에 `width/height: 100%` 기본값(+ prop override) 도입해 0.2.4 publish 로 해결. 선택 표시는 inset box-shadow + 항상 렌더되는 뱃지(visibility 토글)로 사이즈 흔들림 제거. tsc/lint/build 통과. 디자인 톤 정돈은 Phase 6 으로 미룸.

---

## Phase 4 — js-te 미니 러너 (핵심 로직)

**목적**: 브라우저에서 사용자가 작성한 JS 코드를 받아 `describe`/`test`/`expect`/`fn` 을 평가하고 결과 트리를 반환하는 자체 러너를 구현합니다. UI 는 다음 Phase 에서.

**작업 내용**:
1. `components/js-te-demo/runner.ts`
   - `runUserCode(source: string): RunResult` 동기 인터페이스
   - 글로벌 주입: `describe`, `test` (`test.each` 포함), `beforeEach`, `expect`, `fn`
   - matchers 13종 (`toBe`, `toEqual` deep, `toThrow`, `toBeTruthy`, `toBeFalsy`, `toContain`, `toBeInstanceOf`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`) + `.not` 체이닝
   - `fn(impl?)` — `mockImplementation`, `mockReturnValue`, `mockReturnValueOnce`, `mockClear`, `mock.calls` 추적
   - 트리 수집: `{ id, name, status: 'pass'|'fail', error?, children }`
   - 사용자 코드 평가: `new Function('describe','test','beforeEach','expect','fn', source)(...injected)`
   - `console.log` 캡처 → 결과에 동봉
   - `mock(` 패턴 감지 → 결과에 `usedNodeOnlyMock: true` 플래그
2. (Phase 5 에서 사용할) Web Worker 변형 준비 — `runner.worker.ts`. 메인 스레드 fallback 도 export.

**산출물**:
- `runner.ts` 단독으로 호출 가능 (UI 없이도 단위 시나리오 실행 가능)
- 임시 검증 페이지 `app/[locale]/__runner-check/page.tsx` 에서 하드코딩한 코드 문자열 5종(통과/실패/throw/fn/test.each) 을 돌려 결과를 console 또는 화면에 출력. **이 페이지는 Phase 5 끝에서 삭제.**

**검증**:
- 검증 페이지에서 5종 시나리오 모두 의도대로 동작 (통과·실패·error 메시지 적절)
- `tsc --noEmit` 통과

**완료 메모**: _(완료 시 한 줄 기록)_

---

## Phase 5 — js-te 시연 페이지 UI

**목적**: Phase 4 의 러너를 둘러싼 사용자 인터페이스 (에디터 / 예제 셀렉터 / 결과 패널 / 실행 버튼) 를 완성합니다.

**작업 내용**:
1. `npm i @uiw/react-codemirror @codemirror/lang-javascript`
2. `components/js-te-demo/examples.ts` — 5종 예제
   - `'hello'` (첫 테스트), `'matchers'`, `'each'`, `'fn'`, `'mock'`(Node 전용 — readonly)
3. `components/js-te-demo/Editor.tsx` — CodeMirror, JavaScript 모드, value/onChange
4. `components/js-te-demo/Results.tsx` — describe/test 트리 (들여쓰기, 통과 녹색·실패 빨강·에러 메시지·콘솔 캡처)
5. `components/js-te-demo/JsTeDemo.tsx` (`'use client'`)
   - 좌측: 에디터 + 상단 예제 셀렉터 + "Run" 버튼
   - 우측: 결과 패널
   - 모킹 예제 선택 시 에디터 readonly + 실행 비활성 + 안내 배너
   - Web Worker 안에서 러너 실행 + 5초 타임아웃 → terminate. 사용자에게 "무한 루프 의심" 안내. Worker 미지원 fallback 은 메인 스레드.
6. `app/[locale]/libraries/js-te/page.tsx` — 위 컴포넌트 배치
7. Phase 4 의 임시 검증 페이지 삭제

**산출물**:
- `/ko/libraries/js-te`, `/en/...` 모두 동작
- 5종 예제 토글 가능, mock 예제는 실행 불가 안내 정상 표시
- 통과/실패가 시각적으로 구분, 에러 메시지가 보임
- 무한 루프 코드(`while(true){}`) 입력 시 5초 후 타임아웃

**검증**:
- 브라우저에서 직접 코드 작성 → 실행 → 결과 확인
- `npm run build` 통과

**완료 메모**: _(완료 시 한 줄 기록)_

---

## Phase 6 — 번역 사전 채우기 + 디자인 정돈 + README

**목적**: 한국어/영어 사전을 채우고, Tailwind 로 전체 시각적 톤을 정돈하고, 프로젝트 README 에 새 라이브러리 추가 절차를 문서화합니다.

**작업 내용**:
1. `lib/i18n/{ko,en}.json` — 헤더/푸터/랜딩 hero/카드 라벨/시연 페이지 UI 라벨/결과 라벨 모두 채우기. 사용자 코드와 예제 코드 자체는 번역 X.
2. Tailwind 디자인 정돈 — 색상 팔레트, 타이포 스케일, 카드/버튼 일관성, 모바일 반응형 (375px / 768px / 1280px 검수)
3. 다크 모드는 이번 범위에서 제외 (확장 시 별도 작업)
4. **`<html lang>` 동적 처리** — 현재 루트 `app/layout.tsx` 가 `lang="ko"` 로 고정. App Router 제약상 루트 레이아웃이 `params` 를 못 받음. 권장 옵션: `proxy.ts` 에서 응답 헤더 `x-locale` 를 설정 → 루트 레이아웃에서 `headers()` 로 읽어 `<html lang>` 에 반영. (Phase 2 에서 옵션 3 — 고정 — 으로 미뤄둔 항목)
5. `README.md` 작성:
   - 프로젝트 소개
   - 로컬 개발 / 빌드 / 린트 / 타입체크 명령
   - **새 라이브러리 추가 절차** (= `lib/libraries.ts` 항목 추가 → 시연 페이지 추가 → 번역 키 추가)
   - 미니 러너의 한계 (모듈 모킹은 모사 불가)
6. (선택) `eslint-config-airbnb-typescript` 의 ESLint 9 flat config 호환 도입 검토 — CLAUDE.md 코드 스타일을 정식 린팅으로 자동 강제

**산출물**:
- 한·영 모두 빠진 텍스트 없음
- 모바일에서 레이아웃 깨짐 없음
- README 만 보고도 새 라이브러리 추가 가능

**검증**:
- 양 locale 페이지 직접 순회 점검
- `npm run build` / `lint` / `tsc --noEmit` 모두 통과

**완료 메모**: _(완료 시 한 줄 기록)_

---

## Phase 7 — GitHub push + Vercel 배포

**⚠️ 사용자 사전 허락 필수** (외부 공개 동작)

**작업 내용**:
1. (필요 시) GitHub 저장소 `dannysir-labs` 생성
2. 첫 커밋 (사용자 허락 후) → push
3. Vercel 프로젝트 연결 (사용자가 직접 진행하거나, `vercel` CLI 안내)
4. 배포 후 preview URL 에서 양 locale + 두 시연 페이지 동작 확인
5. (선택) 커스텀 도메인 연결

**산출물**:
- `https://dannysir-labs.vercel.app/` 접속 가능
- 첫 빌드 성공

**완료 메모**: _(완료 시 한 줄 기록)_

---

## Phase 8 — 라이브러리 저장소에 `homepage` 필드 추가 PR

**⚠️ 사용자 사전 허락 필수** (외부 공개 동작 — 별도 저장소에 PR)

**작업 내용**:
1. `dannysir/floating-component` 저장소의 `package.json` `homepage` →
   `https://dannysir-labs.vercel.app/ko/libraries/floating-components` (또는 영어 버전 — 사용자와 상의)
2. `dannysir/js-te-package` 저장소의 `package.json` `homepage` 갱신
3. 각각 별도 PR / 변경사항 + 사용자 검토 후 머지
4. 다음 npm publish 부터 npm 페이지의 "Homepage" 링크가 본 사이트로 연결됨

**산출물**:
- 두 저장소 모두 `homepage` 필드 갱신 PR
- (다음 publish 시) npmjs.com 의 패키지 페이지에서 본 사이트로 이동 가능

**완료 메모**: _(완료 시 한 줄 기록)_

---

## 의존성 (예정)

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@dannysir/floating-components": "^0.2.3",
    "@uiw/react-codemirror": "^4",
    "@codemirror/lang-javascript": "^6"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node": "^22",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "^15"
  }
}
```

> `@dannysir/js-te` 는 dependency 가 아닙니다 (Node 전용). 미니 러너로 모사.

---

## 향후 추가 예정 라이브러리 (메모)

현재 사이트에는 포함하지 않지만, 추후 시연 페이지를 추가할 예정인 라이브러리들입니다. `lib/libraries.ts` 에 본격적으로 등록하기 전까지는 이 목록에만 보관합니다.

- **SharedWorker 기반 WebSocket 연결 관리 라이브러리** — 여러 탭이 하나의 워커/소켓을 공유하는 형태. 시연 차례가 오면 별도 결정사항(시연용 WebSocket 서버 호스팅 위치, Safari 미지원 안내, iframe 멀티 인스턴스 데모 구성)을 그때 정리.

---

## 운영 메모

- 본 파일과 `/Users/san/.claude/plans/witty-jingling-lobster.md` 은 같은 내용의 사본입니다. Phase 마무리 시 둘 다 갱신해 동기화하세요.
- 글로벌 사용자 규칙 재확인:
  - 모든 대화는 존댓말
  - 구현·변경 작업 시작 전 플랜 모드 진입 (이 문서가 메인 플랜이므로 각 Phase 시작 시 사용자 확인 한 마디면 충분)
  - `git commit` / `git push` / PR 생성은 매번 사전 허락
