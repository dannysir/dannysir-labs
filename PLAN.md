# dannysir-labs — 라이브러리 동시 업데이트 사이클 (floating 0.4.0 + js-te 0.9.3)

> **이 문서는 dannysir-labs 의 현재 작업 사이클 명세서입니다.**
> 새 세션을 시작할 때마다 이 문서를 먼저 읽고, "현재 진행 상태" 표를 보고 다음 미완료 Phase 를 이어서 진행하세요.

---

## 새 세션 시작 가이드 (READ ME FIRST)

새 세션이 열리면:

1. **이 문서를 먼저 읽으세요.** 가장 신뢰할 수 있는 작업 명세는 이 파일입니다.
2. 아래 "현재 진행 상태" 표에서 **마지막으로 완료된 Phase 와 다음 Phase** 를 확인합니다.
3. 해당 Phase 의 "작업 내용" / "산출물" / "검증" 을 읽고, 사용자에게 "Phase N 을 이어서 진행해도 될까요?" 라고 확인한 뒤 진행합니다.
4. Phase 를 완료하면 **이 문서의 진행 상태 표 체크박스를 갱신**하고, 그 Phase 섹션 끝의 "완료 메모" 에 한 줄 기록한 뒤 사용자에게 결과를 보고합니다.
5. 사용자의 글로벌 규칙 준수:
   - 모든 대화는 존댓말
   - 파일 수정·생성·리팩토링 전에 **플랜 모드** (이 문서가 이미 메인 플랜이므로, 각 Phase 진입 시에는 "이 Phase 를 시작하겠습니다" 정도 확인이면 충분)
   - **`git commit` / `git push` / PR 생성 전에는 매번 사전 허락**

작업 디렉터리: `/Users/san/dannysir-labs`
참조 라이브러리 (로컬): `/Users/san/floating-component` (`@dannysir/floating-components`, 0.4.0) · `/Users/san/js-te-package` (`@dannysir/js-te`, 0.9.3)

플랜 사본 위치: `/Users/san/.claude/plans/greedy-snacking-swan.md` (= 프로젝트 `PLAN.md` 와 항상 동기 유지).
이전 사이클 사본 (아카이브): `/Users/san/.claude/plans/reflective-hatching-sutton.md`

---

## Context (왜 이걸 하는가)

두 라이브러리가 **동시에** 새 버전을 ship 했고, 둘 다 npm 레지스트리에 publish 됨. dannysir-labs 는 자신의 라이브러리를 인터랙티브하게 시연하는 사이트이므로 두 신기능을 데모에 반영한다.

- **`@dannysir/floating-components` 0.3.0 → 0.4.0** (2026-06-17)
  - 신규: `minWidth`/`minHeight`/`maxWidth`/`maxHeight` (px) — 패널의 split 방향(main-axis) 크기 제약. window resize·border drag 양쪽에서 일관 적용. 패널 wrapper `overflow: auto` — 콘텐츠가 패널보다 크면 잘리지 않고 스크롤.
  - **BREAKING**: `minSize`/`maxSize` 제거 → 위 4개로 대체. 단 **데모는 size 제약을 전혀 안 써서**(grep 0건) 코드가 깨지지 않음. 마이그레이션 부담 없음.
- **`@dannysir/js-te` 0.9.2 → 0.9.3** (2026-06-23)
  - 신규: `test.only.each` / `test.skip.each` — 모디파이어 + 데이터주도 `.each` 조합. main·`/browser` 양쪽 노출. 직전 0.9 사이클(`.only`/`.skip`/`.todo` 시연, PR #6)의 자연스러운 연장. 보류 메모 `project_floating_demo_csr_refactor.md` 의 "다음 사이클 후보 C" 가 실현된 것.

**시연 방식 (사용자 확정)**: floating 은 "툴바에 제약 설정 컨트롤 추가"(인터랙티브). PR 은 **라이브러리별 2개로 분리** (직전 PR #5 floating / #6 js-te 패턴과 동일).

---

## 핵심 결정 사항 (확정)

| 항목 | 결정 |
| --- | --- |
| 트랙 구성 | 두 라이브러리 = 두 브랜치·두 PR. 순서: **js-te 먼저**(작고 위험 낮음) → floating(방안 B, 작업량 큼) |
| 브랜치 | `feat/jste-0.9.3-only-skip-each`, `feat/floating-0.4-minmax-overflow` |
| **js-te 러너** | **코드 무수정.** 라이브러리가 `.only.each`/`.skip.each` 의 각 케이스에 `mode`('only'/'skip')를 부착(`testManager.testEach(cases, mode)` → `#registerTest(..., mode)`). 데모의 `applyOnlyDemotion` + 실행 루프 mode 분기가 이미 generic 하게 커버. 결과도 기존 4상태(pass/fail/skipped/todo) 안에 떨어짐. Phase A1 에서 "무수정으로 동작" 을 검증으로 확인 |
| js-te 예제 ID | 점 회피 **camelCase** `onlyEach` / `skipEach` (기존 `only`/`skip`/`todo` 와 일관. 라벨만 `.only.each` 표기). 셀렉터는 `dict.examples[id]` 직접 인덱싱(점 split 아님)이라 안전 |
| **floating 시연** | **방안 B — 툴바 제약 컨트롤.** 선택 패널의 **부모 split 방향**(가로→width, 세로→height)을 인식해 그 축의 min/max 숫자 입력 2개 + Clear (+ 프리셋·overflow 토글)만 노출. 4개 전부 노출은 cross-axis 가 silently 무시돼 교육상 오해 → 기각 |
| floating patch 방법 | 라이브러리가 노드 update API 미제공(`useLayoutTree` 반환에 없음, 내부 유틸 비공개) → **데모에 `treeConstraints.ts` 신규**: `setTree` 기반 불변 patch 헬퍼 + 부모 방향 조회 헬퍼 |
| floating 제약값 표시 | 별도 state 없이 `tree`+`selectedId` 에서 `useMemo` derive (제어 컴포넌트). 새 effect 0 → line 177 의 set-state-in-effect 영역 안 건드림 |
| floating overflow 시연 | `DemoPanel` 에 `showOverflowContent?` opt-in prop(기본 false) + 툴바 토글. 특정 패널만 큰 콘텐츠 → cross-axis 축소 시 wrapper `overflow:auto` 로 스크롤. 다른 패널은 깨끗이 유지 |
| floating localStorage | `STORAGE_KEY` `'floating-demo:tree'` → `'floating-demo:tree:v2'` 로 bump (제약 없는 구 저장본 자연 무효화, 신기능 첫 진입에 깨끗한 캔버스) |
| **범위 밖 (건드리지 않음)** | 보류 리팩토링 "B-2"(FloatingDemo 영속화 client-only 전환, `FloatingDemo.tsx:177` 의 `react-hooks/set-state-in-effect` disable 제거)는 별개 사이클. 이번엔 같은 파일을 만지더라도 그 disable/effect 구조는 유지 |

---

## 영향 받는 파일 (요약)

### Track A — js-te 0.9.3

| 파일 | 변경 |
| --- | --- |
| `package.json` | `@dannysir/js-te: ^0.9.2 → ^0.9.3`. lockfile 갱신 |
| `components/js-te-demo/examples.ts` | `ExampleId` 유니온에 `'onlyEach'`/`'skipEach'`. `onlyEachExample`/`skipEachExample` 소스 추가. `examples` 레코드·`exampleOrder`(only 뒤 onlyEach, skip 뒤 skipEach) 갱신 |
| `lib/i18n/dictionaries.ts` | `jste.examples` 타입에 `onlyEach`/`skipEach` 추가 |
| `lib/i18n/{ko,en}.json` | `jste.examples.onlyEach`/`skipEach` 라벨 동시 추가 |
| 러너(`runner/*`, `Results.tsx`) | **무수정** (검증으로 확인) |
| `README.md` / 메모리 | 0.9.3 한 줄 갱신 |

### Track B — floating 0.4.0

| 파일 | 변경 |
| --- | --- |
| `package.json` | `@dannysir/floating-components: ^0.3.0 → ^0.4.0`. lockfile 갱신 |
| `components/floating-demo/treeConstraints.ts` | **신규** — `PanelConstraints` interface + `applyPanelConstraints`/`getParentSplitDirection`/`getPanelConstraints` 순수 헬퍼(불변, reference-stable) |
| `components/floating-demo/Toolbar.tsx` | 축 인식 제약 그룹(min/max number input + Clear + 프리셋 + overflow 토글 + 축 배지). `flex-wrap` 으로 좁을 때 둘째 줄 |
| `components/floating-demo/FloatingDemo.tsx` | `STORAGE_KEY` v2. 헬퍼 import. `parentDir`/`currentConstraints` derive. overflow 토글 state. `handleSetConstraint`/`handleClearConstraints`/`handlePreset`/`handleToggleOverflow`(각 `setTree(applyPanelConstraints)` + `pushLog('constraint', …)`). Toolbar 에 새 props. **line 177 영역 불변** |
| `components/floating-demo/DemoPanel.tsx` | `showOverflowContent?: boolean` prop. true 면 고정 크기 블록(literal Tailwind 크기 상수) 렌더 |
| `components/floating-demo/ActivityLog.tsx` | `LogKind` 에 `'constraint'`. `KIND_LABEL.constraint='LIMIT'` / `KIND_COLOR.constraint='text-tertiary'` |
| `lib/i18n/dictionaries.ts` | `floating.constraints` 서브객체 타입 추가 |
| `lib/i18n/{ko,en}.json` | `floating.constraints.*` 동시 추가(label/min/max/clear/preset/overflowToggle/axisWidth/axisHeight/axisNone/hint/events.{set,clear}) |
| `TreeInspector.tsx` / `SelectionContext.ts` / 데모 페이지 | **무변경** (min/max 는 JSON 에 자동 표시) |
| `README.md` / 메모리 | 0.4.0 한 줄 갱신 |

---

## 현재 진행 상태 (체크리스트)

| Phase | 트랙 | 제목 | 상태 |
| --- | --- | --- | --- |
| A1 | js-te | 0.9.3 bump + only.each/skip.each 예제 + i18n | [x] |
| A2 | js-te | 검증 + 메모리/README + PR | [x] |
| B1 | floating | 0.4.0 bump + treeConstraints 헬퍼 | [x] |
| B2 | floating | Toolbar 제약 컨트롤 + 데모 통합 + overflow + ActivityLog | [x] |
| B3 | floating | i18n(constraints) + STORAGE_KEY v2 | [x] |
| B4 | floating | 검증 + 메모리/README + PR | [ ] |

> Phase 완료 시 체크박스 갱신 + 해당 섹션 끝 "완료 메모" 한 줄 기록.

---

## Phase A1 — js-te 0.9.3 bump + only.each/skip.each 예제 + i18n

**작업 내용**

1. `package.json` `@dannysir/js-te` `^0.9.2 → ^0.9.3`. `npm install` 로 lockfile 갱신.
2. `examples.ts`:
   - `ExampleId` 에 `'onlyEach' | 'skipEach'` 추가.
   - 두 예제 소스 추가(기존 only/skip 톤의 한글 주석 포함):
     - **onlyEach**: 일반 `test()` 1개 + `test.only.each([[2,3,5],[10,20,30]])('only: add(%s, %s) = %s', …)`. → 일반 테스트는 demote 되어 skipped, only.each 2케이스 pass.
     - **skipEach**: 일반 `test()` 1개 + `test.skip.each([...3+ 케이스])('skipped: …', …)`. → 일반 pass, skip.each 전부 skipped.
   - `examples` 레코드에 두 엔트리(`readOnly: false`), `exampleOrder` 를 `hello/matchers/each/fn/only/onlyEach/skip/skipEach/todo/mock` 로 갱신.
3. i18n (3곳 동시): `dictionaries.ts` 의 `jste.examples` 타입에 `onlyEach`/`skipEach`; `ko.json`·`en.json` 에 라벨.
   - en: `"onlyEach": ".only.each — focus batch"`, `"skipEach": ".skip.each — skip batch"`
   - ko: `"onlyEach": ".only.each — 묶음 포커스"`, `"skipEach": ".skip.each — 묶음 건너뜀"`

**검증**

- `npx tsc --noEmit` 통과.
- **러너 무수정 동작 확인**: dev 서버에서 onlyEach 예제 Run → 통과 N·건너뜀 1, skipEach → 통과 1·건너뜀 N. (러너 코드 변경 없이 의도대로 나오면 핵심 결정 확정.) 정식 브라우저 스모크는 A2.

**완료 메모**: 2026-06-23 `@dannysir/js-te ^0.9.2 → ^0.9.3` (레지스트리 clean install, `dist/browser.mjs` 에 `only.each`/`skip.each`/`testEach` 확인). `examples.ts` 에 onlyEach/skipEach 2종(camelCase id, 점 회피) + `ExampleId`·`exampleOrder` 갱신. i18n 3곳(dictionaries 타입 + ko/en) 동시 추가, 키 양쪽 일치. **러너 무수정 확정** — dev 스모크 /en onlyEach(통과2·건너뜀1)/skipEach(통과1·건너뜀3) 전부 PASS, 트리 `⊘`(demote/skip)·`✓` 정상. tsc 통과.

---

## Phase A2 — js-te 검증 + 메모리/README + PR

**작업 내용**

1. **표준 검증 3종**: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
2. **브라우저 스모크** (/ko·/en, `/libraries/js-te`): 새 onlyEach/skipEach 의도대로(트리 `✓`/`⊘`, summary 카운터). 기존 8개 예제 회귀 없음. 콘솔 0.
3. **메모리**: `project_js_te_mini_runner_rationale.md` 에 0.9.3 only.each/skip.each(러너 무수정) 한 줄.
4. **README**: js-te 시연 항목/버전 언급 갱신(있으면).
5. **PLAN 사본 동기화** 확인.
6. **사용자 사전 허락 받고**: 커밋 → `feat/jste-0.9.3-only-skip-each` push → PR. 제목·본문 초안 선제시.

**검증**: 3종 통과 + 스모크 OK. PR 한 건.

**진행 메모 (2026-06-23)**: 표준검증 3종(tsc/lint/build) 모두 통과. 브라우저 스모크 — /en onlyEach(통과2·실패0·건너뜀1·예정0)·skipEach(통과1·건너뜀3) 전부 PASS, /ko 한글 라벨 정상(`.only.each — 묶음 포커스`/`.skip.each — 묶음 건너뜀`, 빈 문자열 0)·onlyEach(통과2·건너뜀1)·기존 hello 회귀 없음, 콘솔 에러 0. 메모리(`project_js_te_mini_runner_rationale`·`MEMORY.md`)·README(미니 러너 한계 섹션) 갱신 완료.

**완료 메모**: 2026-06-23 단일 feat 커밋 `4580e1c` → **PR #7 머지 완료** (main HEAD `84cf0d5`). 러너 코드 무수정으로 `.only.each`/`.skip.each` 시연 (라이브러리가 각 `.each` 케이스에 mode 부착). **Track A(js-te 0.9.3) 종료.**

---

## Phase B1 — floating 0.4.0 bump + treeConstraints 헬퍼

**작업 내용**

1. (A 트랙 머지/분리 후 새 브랜치 `feat/floating-0.4-minmax-overflow`.) `package.json` `@dannysir/floating-components` `^0.3.0 → ^0.4.0`. `npm install`.
2. `components/floating-demo/treeConstraints.ts` 신규:
   - `interface PanelConstraints { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number; }`
   - `applyPanelConstraints(tree, targetId, next): LayoutNode` — `id===targetId` 인 PanelNode 의 4개 제약 필드를 **replace**(undefined ⇒ 키 삭제) 하는 불변 재귀. 변경 없는 노드는 참조 유지.
   - `getParentSplitDirection(tree, targetId): SplitDirection | undefined` — 선택 패널의 부모 SplitNode.direction(루트 ⇒ undefined). DFS 로 가장 가까운 enclosing split 방향 carry.
   - `getPanelConstraints(tree, targetId): PanelConstraints` — 현재 제약 읽기(없으면 `{}`).

**검증**: `npx tsc --noEmit` (헬퍼는 `any` 금지, `T[]`, non-null assertion 금지).

**완료 메모**: 2026-06-23 `@dannysir/floating-components ^0.3.0 → ^0.4.0` (레지스트리 install, `dist/index.d.ts` 에 min/max 필드·`SplitDirection="horizontal"|"vertical"` 확인). `treeConstraints.ts` 신규 — `PanelConstraints` interface + `applyPanelConstraints`(불변 **replace**, undefined⇒키삭제)·`getParentSplitDirection`·`getPanelConstraints`. 라이브러리가 노드 update API 미제공이라 `setTree` 기반 직접 작성(map/find, for-of 회피). tsc 통과.

---

## Phase B2 — Toolbar 제약 컨트롤 + 데모 통합 + overflow + ActivityLog

**작업 내용**

1. `Toolbar.tsx`: 기존 액션 그룹 뒤에 **제약 그룹** 추가 — 축 배지(W/H/Root) + min·max number input(해당 축만) + Clear + (선택)Constrain 프리셋 + Overflow 토글. 새 props: `parentDirection`, `constraints`, `constraintsDict`, `overflowOn`, `onSetConstraint`/`onClearConstraints`/`onPreset`/`onToggleOverflow`. `selectedId===null` 또는 루트(부모 방향 undefined) 면 disable. 입력 클래스는 literal 상수.
2. `FloatingDemo.tsx`:
   - `STORAGE_KEY` → `'floating-demo:tree:v2'`.
   - 헬퍼 import. `parentDir = useMemo(getParentSplitDirection)`, `currentConstraints = useMemo(getPanelConstraints)`.
   - overflow 토글 state(선택 패널 id 기준) + 토글 시 해당 `DemoPanel` 을 `showOverflowContent` 로 재등록.
   - `handleSetConstraint(field, value)`/`handleClearConstraints()`/`handlePreset()`/`handleToggleOverflow()` — 각 `setTree(prev => applyPanelConstraints(prev, selectedId, next))` 후 `pushLog('constraint', formatConstraintEvent(...))`. 빈 입력 ⇒ 필드 제거(`Number.isFinite` 가드).
   - 상수: `PRESET_MIN_PX`/`PRESET_MAX_PX`. **line 177 effect/disable 영역 불변.**
3. `DemoPanel.tsx`: `showOverflowContent?: boolean`. true 면 라벨 아래 고정 크기 블록(`w-[420px] h-[200px]` 등 literal 상수). 기본 false → 기존 패널 변화 없음.
4. `ActivityLog.tsx`: `LogKind` 에 `'constraint'`; `KIND_LABEL.constraint='LIMIT'`; `KIND_COLOR.constraint='text-tertiary'`.

**검증**: `npx tsc --noEmit` 통과. (시각 검증은 B4.)

**완료 메모**: 2026-06-23 Toolbar 에 축 인식 제약 그룹(부모 split 방향→해당 축 min/max number input·Constrain 프리셋(160/320)·Clear·Overflow 토글·축 배지 W/H/Root, `flex-wrap`). DemoPanel `showOverflowContent?` opt-in(360×200 literal 블록). ActivityLog `LogKind` 에 `'constraint'`(`KIND_LABEL='LIMIT'`/`text-tertiary`). FloatingDemo: `STORAGE_KEY` v2·`parentDir`/`currentConstraints` derive(useMemo, effect 0)·핸들러 4종(`handleSetConstraint` 빈입력⇒키삭제·`handleClearConstraints`·`handlePreset`·`handleToggleOverflow` store 재등록)·**line 177 set-state-in-effect 영역 불변**. tsc 통과.

---

## Phase B3 — i18n(constraints) + 마무리 배선

**작업 내용**

1. i18n 3곳 동시: `dictionaries.ts` 의 `floating` 타입에 `constraints` 서브객체; `ko.json`·`en.json` 에 `floating.constraints.*` (label/min/max/clear/preset/overflowToggle/axisWidth/axisHeight/axisNone/hint/events.{set,clear}). `events.set` = en `"Set {{field}}={{value}}px on {{id}}"` / ko `"{{id}} 패널 {{field}}={{value}}px 설정"`, `events.clear` = en `"Cleared constraints on {{id}}"` / ko `"{{id}} 패널 제약 해제"`.
2. `formatConstraintEvent(template, { field, value, id })` (기존 `formatEvent` `.replace` 패턴 확장).
3. **키 셋 양쪽 diff 로 누락 확인** (누락 시 빈 문자열 함정 + `satisfies Dictionary` 빌드 실패).

**검증**: `npx tsc --noEmit`, `npm run lint` 통과.

**완료 메모**: 2026-06-23 i18n `floating.constraints.*`(label/min/max/clear/preset/overflowToggle/axis{Width,Height,None}/hint/events.{set,clear}) ko/en + `dictionaries.ts` 타입 동시 추가. `formatConstraintEvent`(field/value/id `.replace`). tsc(`satisfies Dictionary` 양쪽 키 일치)·lint 통과.

---

## Phase B4 — floating 검증 + 메모리/README + PR

**작업 내용**

1. **표준 검증 3종**: tsc / lint / build.
2. **브라우저 스모크** (/ko·/en, `/libraries/floating-components`), preview_* MCP:
   - (a) 패널 선택→min/max 설정→border drag 시 실제로 해당 px 에서 막힘(가로 패널 width, 세로 패널 height). `getBoundingClientRect` 로 확인.
   - (b) Overflow 토글→cross-axis 축소 시 패널 내 스크롤(`scrollHeight>clientHeight`).
   - (c) TreeInspector 에 `"minWidth": …` 반영. (d) ActivityLog 에 `LIMIT` 로그(coalesce 안 됨). (e) 빈 입력 ⇒ 키 삭제·제약 해제.
   - (f) 기존 split/add/move/close/reset/resize 회귀 없음, 제약이 split 후 자식에 유지·Reset 시 해제. (g) 새로고침 영속(v2). 구 `:v1` 키는 무시(크래시 0). (h) /ko 라벨 한글·/en 영문(빈 문자열 0). (i) 콘솔 0.
3. **메모리**: floating 0.4.0 시연(툴바 제약 컨트롤·treeConstraints) 한 줄. B-2 보류 메모에 "0.4.0 작업이 같은 파일 만졌으나 disable 영역 불변" 한 줄.
4. **README**: floating 시연/버전 언급 갱신.
5. **PLAN 사본 동기화** 확인.
6. **사용자 사전 허락 받고**: 커밋 → `feat/floating-0.4-minmax-overflow` push → PR. 제목·본문 초안 선제시.

**검증**: 3종 통과 + 스모크 OK. PR 한 건.

**진행 메모 (2026-06-23)**: 표준검증 3종(tsc/lint/build) 모두 통과. 브라우저 스모크 /en·/ko 전부 통과 — (a) minWidth=400 설정 시 패널 a CSS min-width honor(폭 확장 시각 확인) (b) Overflow 토글 시 wrapper 가로 스크롤(clientW 295 < scrollW 328) (c) TreeInspector `"minWidth":400` 반영 (d) ActivityLog `LIMIT Set minWidth=400px on a` (e) 빈 입력⇒트리에서 키 삭제 (f) Reset 시 제약·overflow 해제·기본 3패널 복귀, Split V 후 새 패널 축 W→H 전환(`크기 제약 · ↕ 높이 (H)`) (g) v2 영속(/en 4패널 트리 /ko 복원) (h) /ko 한글 라벨(빈 문자열 0) (i) 콘솔 warn/error 0. 메모리(신규 `project_floating_04_constraints_demo` + B-2 갱신 + MEMORY.md)·README 갱신 완료. **남은 것: 커밋/push/PR — 사용자 사전 허락 대기.** PR 머지 시 B4 [x].

**완료 메모**:

---

## 검증 명령어 (작업 단위 마무리 표준)

```bash
npx tsc --noEmit
npm run lint
npm run build
```

세 명령이 **모두 통과** 해야 작업 단위 "완료" 처리. (+ 의미 있는 변경 후 브라우저 스모크.)
