# 본 프로젝트 규칙

> 전역 규칙 (`~/.claude/CLAUDE.md`) 도 함께 적용됩니다. 이 파일은 **본 프로젝트 특화** 규칙만 다룹니다.

## 프로젝트 컨텍스트

`dannysir-labs` — 사용자가 만든 npm 라이브러리들을 인터랙티브하게 시연하는 사이트. Next.js 16 + React 19 + Tailwind v4 + TypeScript. 자세한 내용은 `PLAN.md` 참조.

---

## 작업 워크플로우

### PLAN.md 가 작업 진입점

- 본 프로젝트는 한 사이클의 작업 명세를 `PLAN.md` 에 적어두고 진행하는 방식. 현재 사이클이 끝나면 다음 사이클을 위한 새 PLAN.md 로 교체됨 (Phase 구성·개수는 사이클마다 달라짐).
- 새 세션 시작 시:
  1. 코드를 보기 전에 먼저 `PLAN.md` 를 읽어 현재 사이클의 목표와 "진행 상태" 표를 확인.
  2. 다음 미완료 작업 단위를 식별하고 사용자에게 "이어서 진행해도 될까요?" 식으로 확인 후 시작.
  3. 작업 단위를 건너뛰지 말 것.
- 작업 단위 완료 시: 진행 상태 표 체크박스 갱신 + 그 단위 섹션 끝의 "완료 메모" 한 줄 기록.
- 현재 PLAN.md 의 모든 단위가 완료되어 있다면 사이클이 끝난 상태. 새 작업 지시가 들어오면 곧바로 코드를 만지지 말고, 먼저 사용자와 다음 PLAN.md 작성 여부·범위를 합의.

### PLAN.md 사본 동기화

- 사이클마다 `PLAN.md` 의 사본이 `~/.claude/plans/<plan-id>.md` 에 있을 수 있음. 사본이 존재하면 항상 동기 유지 (한 쪽 수정 시 다른 쪽도 같이 갱신).

### 브랜치 컨벤션

- 셋업·구조·도구 변경: `chore/<설명>`
- 사용자에게 노출되는 새 기능: `feat/<설명>`
- 버그 수정: `fix/<설명>`
- 한 작업 단위 (Phase 등) = 한 브랜치가 기본. 사용자가 다른 단위를 명시하면 그에 따름.

### 표준 검증 명령어

작업 단위 마무리 / 의미 있는 변경 후 아래 셋이 **모두** 통과해야 "완료" 로 간주:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

---

## Next.js 16 주의사항

- 본 프로젝트는 Next.js 16 (`16.2.4`). 학습 데이터의 Next.js 와 다른 점이 많음.
- 의심되는 API 는 `node_modules/next/dist/docs/` 의 해당 가이드를 먼저 확인하고 코딩.
- 알려진 변경 (확인된 것):
  - `middleware.ts` → **`proxy.ts`** (함수명도 `middleware` → `proxy`)
  - `params` 가 Promise → `const { foo } = await params;` 형태로 사용

---

## 참조 라이브러리 (로컬 경로)

본 사이트가 시연하는 라이브러리들의 로컬 소스 위치. 라이브러리의 실제 동작/시그니처를 확인할 때는 npm 패키지 대신 위 경로의 소스를 **우선** 참조.

- `/Users/san/floating-component` (`@dannysir/floating-components`)
- `/Users/san/js-te-package` (`@dannysir/js-te`)
- `/Users/san/floating-demo` (Vite 기반 기존 데모, 패턴 참고용)

---

## 코드 스타일

베이스: **Airbnb JS/TS/React 스타일 가이드**. 정식 ESLint 패키지 도입 (`eslint-config-airbnb-typescript` 의 ESLint 9 flat config 호환) 은 Phase 6 즈음 검토하고, 지금은 본 가이드를 사람/에이전트 모두 따르는 컨벤션으로 사용.

### TypeScript

- 객체 형태는 **`interface`** 로 정의 (단, 유니온/원시 별칭/유틸리티 타입 결과는 `type` 사용)
- `any` 금지 → `unknown` 으로 받고 type guard 로 좁히기
- 배열은 **`T[]`** (Airbnb TS: `Array<T>` 보다 선호)
- non-null assertion (`!`) 금지. `??` / `?.` 또는 명시적 가드 사용
- export 되는 함수/훅은 파라미터/리턴 타입 명시 (내부 함수는 추론 의존 OK)
- type-only import 분리: `import type { Foo } from '...';`

### JavaScript/TypeScript 일반 (Airbnb 핵심)

- **싱글쿼트** `'foo'` (JSX 속성은 더블쿼트 `"foo"`)
- **세미콜론 필수**
- 멀티라인 객체/배열/함수 인자 끝에 **trailing comma**
- `===` 사용, `==` 금지
- `var` 금지, `const` 우선, 변경이 필요할 때만 `let`
- 콜백은 **arrow function** 우선
- 문자열 결합은 **template literal** (`` `${}` ``) 사용
- 객체/배열 **destructuring** 적극 활용
- 객체 shorthand (`{ foo }` 사용, `{ foo: foo }` 금지)

### React

- 함수형 컴포넌트 + Hooks
- 자식 없는 태그는 **self-close** `<Foo />`
- 리스트 렌더 시 항상 `key`. 배열 인덱스를 key 로 쓰는 것은 마지막 수단
- JSX 속성에 `bind` 금지 — arrow function 또는 `useCallback`
- 멀티라인 JSX 는 괄호 `(...)` 로 감싸기

### Next.js / 본 프로젝트 추가

- 기본 **Server Component**. state / effect / event handler / browser API 가 필요한 컴포넌트만 `'use client'` 선언
- `params` 는 `await params` 후 destructuring
- 페이지 (`page.tsx`) / 레이아웃 (`layout.tsx`) 만 default export, 그 외 컴포넌트는 named export
- 사용자 노출 텍스트는 dictionary 거치기 (하드코딩 금지)
- i18n 키 추가 시 `lib/i18n/ko.json` 과 `lib/i18n/en.json` **양쪽에 동시에** 추가. 누락 시 화면에 빈 문자열이 표시되므로 주의
- i18n 키 네이밍은 도메인 점 표기 (예: `header.siteName`, `floating.toolbar.split`)

### 파일/식별자 네이밍 (Airbnb 정통 — A안)

- 컴포넌트 파일: **PascalCase** (예: `LibraryCard.tsx`, `FloatingDemo.tsx`)
- 컴포넌트 함수명: 파일명과 동일한 **PascalCase**
- 유틸/훅 파일: **camelCase** (예: `useLayoutTree.ts`, `getDictionary.ts`)
- 일반 함수/변수: **camelCase**
- 디렉터리: **camelCase** 기본, 도메인 묶음으로 PascalCase 도 허용
- 상수: `UPPER_SNAKE_CASE` (예: `COOKIE_NAME`, `DEFAULT_LOCALE`)

### Import 순서

1. 외부 패키지 (`react`, `next`, `@dannysir/...`)
2. 내부 alias (`@/lib/...`, `@/components/...`)
3. 상대 경로 (`./foo`, `../bar`)

각 그룹 사이 빈 줄 한 줄.

### 함수/구조

- **early return** 선호 — 깊은 if 중첩 피하기
- 함수당 **한 가지 책임**. 길이가 ~50 줄 넘어가면 분해 검토
- **매직 넘버 금지** — 의미 있는 상수로 추출 (자명한 0/1/-1 예외)

### Tailwind / 스타일

- 유틸리티 우선. 커스텀 CSS 는 `app/globals.css` 의 `@theme` 변수 정의에만 한정
- 같은 클래스 조합이 **3회 이상** 반복되면 컴포넌트로 추출 (그 이전엔 추상화 금지)
- 다크 모드는 본 사이트 범위에서 제외 (PLAN 결정사항)
