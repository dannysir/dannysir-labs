# dannysir-labs — js-te 0.9.0 시연 사이클

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
   - 파일 수정·생성·리팩토링 전에 **플랜 모드** (이 문서가 이미 메인 플랜이므로, 각 Phase 진입 시에는 "이 Phase 의 작업을 시작하겠습니다" 정도 확인이면 충분)
   - **`git commit` / `git push` / PR 생성 전에는 매번 사전 허락**

작업 디렉터리: `/Users/san/dannysir-labs`
참조 라이브러리 (로컬): `/Users/san/js-te-package` (`@dannysir/js-te`, 현재 0.9.0)

플랜 사본 위치: `/Users/san/.claude/plans/reflective-hatching-sutton.md`. 이 파일과 항상 동기 유지.

이전 사이클 사본 (아카이브): `/Users/san/.claude/plans/witty-jingling-lobster.md`

---

## Context (왜 이걸 만드는가)

`@dannysir/js-te` 가 0.7.3 → 0.9.0 으로 두 단계 minor 업데이트를 거쳤습니다.

- **0.7.4** — `homepage` 메타데이터만. 시연 영향 없음
- **0.8.0** — `--testLocation`, JSON reporter (CLI 전용). 브라우저 데모와 무관
- **0.9.0** — `test.only / .skip / .todo`, `describe.only / .skip`. **브라우저 entry 에 노출되는 코어 API 변경.** 시연에 추가해야 할 신기능

dannysir-labs 는 자신의 라이브러리들을 인터랙티브하게 시연하는 사이트이므로, 0.9.0 의 핵심 사용자-노출 기능인 focus/skip 모디파이어를 데모에 반영해야 합니다.

동시에 현재 데모 코드에 **0.7.3 도입 시점에 정리됐어야 할 잔재**가 남아 있어 함께 정리합니다:

- `components/js-te-demo/runner/dannysirJsTe.d.ts` — `declare module '@dannysir/js-te/browser'` 형태의 손글씨 shim. 라이브러리가 0.7.3 부터 공식 `.d.ts` 를 ship 하므로 (`package.json#exports` 의 `types` 조건) 셰도잉 상태
- `runner/types.ts` 의 일부 타입 — 라이브러리에서 import 가능하지만 자체 정의 중

---

## 핵심 결정 사항 (확정)

| 항목 | 결정 |
| --- | --- |
| 의존성 | `@dannysir/js-te: ^0.7.3` → `^0.9.0` (caret 규칙상 0.x 의 minor 변경은 자동 업데이트 안 되므로 명시적 bump) |
| `@dannysir/js-te/browser` 타입 | 라이브러리 공식 `.d.ts` (types/browser.d.ts) 사용. 데모의 shim 파일 삭제 |
| 데모 미니 러너의 모드 처리 전략 | **Option B 자체 실행 유지 + 모드 직접 처리.** 라이브러리 `Reporter` 인터페이스에 per-test start 훅이 없어 console 캡처와 호환되지 않음. `testManager.getTests()` 가 `mode: TestMode` 가 이미 resolved 된 `TestCase[]` 를 반환하므로 (`describe.only/.skip` 전파는 라이브러리가 처리), 데모는 file-scoped only-demotion 한 줄만 모사 |
| `.only` demotion 규칙 | `tests.some(t => t.mode === 'only')` 면 `mode === 'normal'` 을 `'skip'` 으로 demote. `skip`/`todo` 는 그대로. 라이브러리 testManager.js:141-144 룰과 동일 |
| 데모 타입 이름 충돌 | 라이브러리 `RunResult` 는 import 하지 않음 (collector 에서 사용처 없음). 데모의 `RunResult` 는 그대로 둠 (데모 트리·console·duration 필드 포함, 라이브러리 결과와는 별개 모델) |
| 새 상태 색 | Skipped = `text-on-surface-variant/50` (dim/회색 계열, 기존 토큰 재사용). Todo = `text-secondary` + 점선 보더. **Tailwind purge 회피 위해 literal class 만 사용**, 동적 문자열 금지 |
| 의도적 제외 | 0.8.0 의 `--testLocation`, JSON reporter — CLI 전용으로 브라우저 데모와 무관. 라이브러리 `Reporter` import — Option B 에서 사용처 없음 (dead weight) |
| 브랜치 | `feat/jste-0.9-only-skip-todo` |

---

## 영향 받는 파일 (요약)

| 파일 | 변경 |
| --- | --- |
| `package.json` | dep `@dannysir/js-te: ^0.7.3 → ^0.9.0`. lockfile 갱신 |
| `components/js-te-demo/runner/dannysirJsTe.d.ts` | **삭제** |
| `components/js-te-demo/runner/types.ts` | `TestMode` import. `TestNodeStatus` 확장 (`'pass' \| 'fail' \| 'skipped' \| 'todo'`). `TestLeafNode` 에 `mode: TestMode` 추가. `RunResult` 에 `skipped: number`, `todo: number` 추가 |
| `components/js-te-demo/runner/index.ts` | only-demotion 패스 추가. leaf 실행 루프에서 `mode` 분기 (todo/skip → fn 호출 안 함, 카운터만). rollupStatuses 가 새 상태들과 호환 (describe 노드는 child 가 fail 일 때만 fail, 그 외엔 pass 유지). 데모 트리 타입 변경에 따라 빌드 부분 조정 |
| `components/js-te-demo/runner/runner.worker.ts` | 변경 없음 (RunResult 새 필드는 structured-clone 안전한 number) |
| `components/js-te-demo/Results.tsx` | 상태 아이콘·색 확장 (▾·✓·✗ 외에 ↷ skipped, ☐ todo 등 ASCII). summary 4 카운터 + ms. PASS/FAIL 배지 로직은 그대로 (`failed > 0 \|\| runtimeError` 면 FAIL) |
| `components/js-te-demo/examples.ts` | 3개 예제 추가: `only` (normal 테스트 1개 + `.only` 1개로 demotion 시연), `skip` (`.skip` + 일반 비교), `todo` (`.todo` 단독 + 옆에 일반 1개). `ExampleId` 유니온, `exampleOrder` 갱신 |
| `lib/i18n/{ko,en}.json` | `jste.examples.{only,skip,todo}` 라벨 + 설명. `jste.results.{skipped,todo}` 뱃지·summary 템플릿 4 카운터로 갱신 |
| `README.md` | "미니 러너 한계" 섹션의 0.7.3 언급을 0.9.0 으로. (선택) 새 시연 항목 한 줄 언급 |
| `~/.claude/projects/-Users-san-dannysir-labs/memory/project_js_te_mini_runner_rationale.md` | 0.9.0 전환 + shim 제거 사실 갱신 |

---

## 현재 진행 상태 (체크리스트)

| Phase | 제목 | 상태 |
| --- | --- | --- |
| 1 | 의존성 bump + shim 삭제 | [x] |
| 2 | 러너 타입·로직 확장 (모드 4종) | [x] |
| 3 | Results UI: 상태 4종 + 카운터 4종 | [x] |
| 4 | examples 3종 추가 (only / skip / todo) | [x] |
| 5 | i18n 키 추가 (ko/en 동시) | [x] |
| 6 | 검증 + 메모리 동기화 + PR | [ ] |

> Phase 완료 시 체크박스 갱신 + 해당 섹션 끝 "완료 메모" 한 줄 기록.

---

## Phase 1 — 의존성 bump + shim 삭제

**목적**: 라이브러리 버전 올리고, 0.7.3 부터 무의미해진 손글씨 타입 shim 을 제거합니다. 후속 Phase 의 전제 조건.

**작업 내용**

1. `package.json` 의 `"@dannysir/js-te": "^0.7.3"` → `"^0.9.0"`. `npm install` 로 lockfile 갱신
2. `components/js-te-demo/runner/dannysirJsTe.d.ts` 삭제
3. `tsconfig.json` 의 `include` / `types` 에 shim 파일 명시 참조가 없는지 확인 (없으면 통과). 있으면 제거
4. 즉시 `npx tsc --noEmit` 으로 타입 깨짐 여부 확인. **shim 삭제만으로 컴파일 깨질 수 있음** — `runner/index.ts` 가 라이브러리 공식 타입의 `testManager.getTests()` 반환을 사용하므로, 데모 `LibraryCollectedTest` 인터페이스가 라이브러리 `TestCase` 와 정합한지 점검 (양쪽 다 `description`, `path`, `fn` 보유, 추가로 라이브러리는 `mode`/`location` 보유)

**산출물**

- 업데이트된 `package.json`, `package-lock.json`
- `dannysirJsTe.d.ts` 삭제

**검증**

- `npx tsc --noEmit` 통과 (Phase 2 시작 전 OK 여야 함. shim 삭제로 깨지면 Phase 2 의 타입 작업을 일부 앞당겨 처리)
- `node_modules/@dannysir/js-te/types/browser.d.ts` 가 실제로 export 되는지 확인 (`package.json#exports."./browser".types`)

**완료 메모**: 2026-06-08 `@dannysir/js-te ^0.7.3 → ^0.9.0` (lockfile changed 1 package), `dannysirJsTe.d.ts` 삭제. `tsconfig.json#include` 는 `**/*.ts` 와일드카드라 별도 정리 불필요. `npx tsc --noEmit` 깨끗하게 통과 — shim 삭제 후 `testManager.getTests()` 반환이 라이브러리 공식 `TestCase[]` 로 잡혀도 데모의 `LibraryCollectedTest` 와 structural 호환. lint/build 는 Phase 6 에서 일괄.

---

## Phase 2 — 러너 타입·로직 확장 (모드 4종)

**목적**: `.only` / `.skip` / `.todo` 4 모드를 데모 트리 모델과 실행 루프에 반영합니다.

**작업 내용**

1. `runner/types.ts`:
   - `import type { TestMode } from '@dannysir/js-te/browser';` 추가
   - `TestNodeStatus = 'pass' | 'fail' | 'skipped' | 'todo'`
   - `TestLeafNode` 에 `mode: TestMode` 필드 추가
   - `RunResult` 에 `skipped: number`, `todo: number` 추가 (기존 `passed`, `failed` 유지)
2. `runner/index.ts`:
   - `buildTree` 에서 leaf 생성 시 `mode: t.mode` 보존 (라이브러리 `TestCase.mode` 그대로 복사)
   - **only-demotion 패스** — `getTests()` 직후, `hasOnly = collected.some(t => t.mode === 'only')` 면 normal → skip 으로 demote (라이브러리와 동일 룰, testManager.js:141-144 의 6줄). 로컬 변수 사본에서 처리해 부수효과 최소화
   - 실행 루프에서 `node.mode` 분기:
     - `'todo'` → `node.status = 'todo'`, fn 호출 안 함, `todo += 1`
     - `'skip'` → `node.status = 'skipped'`, fn 호출 안 함, `skipped += 1`
     - `'normal'` / `'only'` → 기존대로 실행, pass/fail 카운터 갱신
   - 반환 객체에 `skipped`, `todo` 포함
3. `rollupStatuses` — describe 의 status 는 child 중 하나라도 fail 이면 fail, 그 외엔 pass 로 유지 (현재 로직 그대로). skipped/todo 만 있는 describe 도 pass 표시 — 실패가 아니므로 자연스러움. 별도 변경 불필요
4. 한 가지 export 정리: `runner/index.ts` 의 `export type` 재export 에서 누락된 타입이 없는지 점검

**산출물**

- 업데이트된 `runner/types.ts`, `runner/index.ts`

**검증**

- `npx tsc --noEmit` 통과
- 임시 콘솔 출력으로 다음 3가지 결과 확인:
  - `test('a', ...)` + `test.only('b', ...)` → a 는 skipped, b 는 pass
  - `test.skip('a', ...)` + `test('b', ...)` → a 는 skipped, b 는 pass
  - `test.todo('a')` + `test('b', ...)` → a 는 todo, b 는 pass

**완료 메모**: 2026-06-08 `runner/types.ts` 에 `TestMode = TestCase['mode']` (browser entry 가 0.9.0 에서 `TestMode` 를 직접 re-export 안 함 — 인덱스 액세스로 우회. 추후 라이브러리에 PR 가능). `TestNodeStatus` 4종 + `TestLeafNode.mode` + `RunResult.{skipped,todo}` 추가. `runner/index.ts` 는 `LibraryCollectedTest` 자체 인터페이스 제거하고 라이브러리 `TestCase` 직접 사용. `applyOnlyDemotion` 패스 추가 (라이브러리 룰 testManager.js:141-144 와 동일, 라이브러리 객체 mutation 없이 사본 처리). 실행 루프 mode 분기 (todo/skip 은 fn 미호출). `runWithWorker.ts` 의 worker.onerror fallback 객체에도 `skipped/todo: 0` 추가. tsc 통과.

---

## Phase 3 — Results UI: 상태 4종 + 카운터 4종

**목적**: 새 상태와 카운터를 결과 패널에 시각적으로 표시합니다.

**작업 내용**

1. `Results.tsx` `Tree` 컴포넌트의 leaf 렌더에서 status 4종 대응:
   - `pass` → `text-tertiary` + `✓` (기존)
   - `fail` → `text-error` + `✗` (기존)
   - `skipped` → `text-on-surface-variant/60` + `↷` (또는 `⊘`). 톤 다운
   - `todo` → `text-secondary` + `☐` + 점선 보더는 leaf 박스 자체에 적용 안 함 (텍스트만 톤). 일관성 우선
   - duration 표시는 pass/fail 만. skipped/todo 는 (실행 안 했으므로) 표시 안 함
2. PASS/FAIL 배지 로직: `passOk = state.result.failed === 0 && !state.result.runtimeError`. **skipped/todo 만 있는 경우도 PASS.** 변경 없음
3. summary 라인: 4 카운터 + ms 로 확장. 새 문자열은 i18n 에서 처리하지만 Results 의 `formatSummary` 가 4개 키 (`{{passed}}`, `{{failed}}`, `{{skipped}}`, `{{todo}}`, `{{ms}}`) 를 replace 하도록 시그니처 변경
4. **모든 클래스명은 literal** — 동적 보간 금지 (Tailwind purge 회피)

**산출물**

- 업데이트된 `Results.tsx`

**검증**

- `npx tsc --noEmit`, `npm run lint` 통과
- (Phase 4·5 이후) 브라우저에서 4가지 상태가 모두 의도된 색·아이콘으로 렌더

**완료 메모**: 2026-06-08 `Results.tsx` 에 `leafVisual` / `describeVisual` 헬퍼로 status 4종 비주얼 분기. pass `✓` tertiary / fail `✗` error / skipped `⊘` on-surface-variant/50 / todo `☐` secondary. duration 표시는 pass/fail 한정. `formatSummary` 4 카운터 + ms 시그니처로 확장. PASS/FAIL 배지 로직은 `failed === 0 && !runtimeError` 그대로 — skipped/todo 만 있어도 PASS. tsc 통과. (브라우저 시각 검증은 Phase 6.)

---

## Phase 4 — examples 3종 추가 (only / skip / todo)

**목적**: 사용자가 데모에서 신기능을 한 번에 시연할 수 있는 예제를 제공합니다.

**작업 내용**

1. `components/js-te-demo/examples.ts`:
   - `ExampleId` 유니온에 `'only' | 'skip' | 'todo'` 추가
   - 3개 예제 추가. `readOnly: false` 로 모두 실행 가능
   - `exampleOrder` 에 적절한 위치 (예: hello → matchers → each → fn → **only → skip → todo** → mock) 로 삽입

2. 각 예제 source 코드 가이드라인 — **`.only` 의 file-scoped demotion 효과를 명확히 보여주기 위해 반드시 normal 테스트 1개 이상을 함께 포함**:

   - **`only`**: `describe('focus', () => { test('this is skipped', ...); test.only('only this runs', ...); })`. 결과 트리에서 첫 테스트가 skipped 표시되는 것을 시연
   - **`skip`**: `test('runs normally', ...); test.skip('this is pending', () => { /* TODO */ });`. skip 의 의미와 동작 시연
   - **`todo`**: `test('runs normally', ...); test.todo('write the empty-list edge case');`. todo 의 시그니처 (fn 인자 없음) 와 표시 시연

3. 각 예제는 짧고 (10줄 내외) 의도가 자명하게

**산출물**

- 업데이트된 `examples.ts`

**검증**

- `JsTeDemo.tsx` 의 셀렉터에서 3개 예제가 노출되고 클릭 시 에디터에 로드되는지
- 각 예제 Run 시 의도된 카운터·트리 상태가 나오는지

**완료 메모**: 2026-06-08 `examples.ts` 에 only/skip/todo 3개 추가 (모두 `readOnly: false`). only 예제는 `describe('focus')` 내 normal + `.only` 로 file-scoped demotion 효과 시연. skip 은 normal + `.skip`, todo 는 normal + `.todo` 2개. `ExampleId` 유니온·`exampleOrder` 갱신 (hello/matchers/each/fn/**only/skip/todo**/mock). 브라우저 시각 검증은 Phase 6.

---

## Phase 5 — i18n 키 추가 (ko/en 동시)

**목적**: 새 상태·예제·summary 가 양쪽 로케일에서 동일하게 동작.

**작업 내용**

1. `lib/i18n/ko.json`, `lib/i18n/en.json` 양쪽에 동시에 추가:

   - `jste.examples.only` / `.skip` / `.todo` — 셀렉터 라벨
   - `jste.results.skipped` — Skipped 뱃지·카운터 라벨
   - `jste.results.todo` — Todo 뱃지·카운터 라벨
   - `jste.results.summary` — 4 카운터 + ms 로 변경 (기존 키 갱신)

2. summary 템플릿 예시:
   - ko: `"통과 {{passed}} · 실패 {{failed}} · 건너뜀 {{skipped}} · 예정 {{todo}} · {{ms}}ms"`
   - en: `"{{passed}} passed · {{failed}} failed · {{skipped}} skipped · {{todo}} todo · {{ms}}ms"`

3. **두 파일을 동시에 편집한 뒤 키 셋 diff 로 누락 확인** (`jq 'paths(scalars) | join(".")'` 또는 단순 grep). i18n 누락 시 화면에 빈 문자열 표시되는 게 알려진 함정

**산출물**

- 업데이트된 ko/en 사전

**검증**

- `npm run lint`, `npm run build` 통과
- /ko, /en 양쪽에서 새 라벨이 모두 정상 표시

**완료 메모**: 2026-06-08 `lib/i18n/dictionaries.ts` 의 `jste.examples` 타입에 only/skip/todo 추가, ko/en.json 양쪽에 라벨 동시 추가 (".only — 포커스" / ".only — focus" 등). `jste.results.summary` 를 4 카운터 + ms 로 갱신 ("통과 X · 실패 Y · 건너뜀 Z · 예정 W · Vms" / "X passed · Y failed · Z skipped · W todo · Vms"). 별도 `results.skipped/todo` 키는 summary 안에 라벨이 포함돼 사용처가 없어 추가하지 않음. tsc 통과 — `satisfies Dictionary` 양쪽 OK.

---

## Phase 6 — 검증 + 메모리 동기화 + PR

**목적**: 표준 검증 통과 후 사용자 사전 허락 받고 PR 까지.

**작업 내용**

1. **표준 검증 3종**: `npx tsc --noEmit`, `npm run lint`, `npm run build` — 셋 다 통과
2. **브라우저 스모크**:
   - dev 서버 (`preview_start`) 실행
   - /ko, /en 각각 `/libraries/js-te` 에서:
     - 기존 5개 예제 (hello/matchers/each/fn/mock) 모두 동작 변화 없는지 (regression)
     - 새 3개 예제 (only/skip/todo) 각각 의도된 상태·카운터로 표시되는지
     - summary 4 카운터 라인 표시 확인
   - 콘솔 에러 0 확인
3. **메모리 갱신**:
   - `~/.claude/projects/-Users-san-dannysir-labs/memory/project_js_te_mini_runner_rationale.md` 에 0.9.0 전환·shim 삭제·모드 처리 방식 (Option B) 한두 줄 추가
4. **README 갱신**: "미니 러너 한계" 섹션의 0.7.3 언급을 0.9.0 으로. 새 시연 한 줄 언급 (선택)
5. **PLAN 사본 동기화**: 이 파일과 `/Users/san/.claude/plans/reflective-hatching-sutton.md` 가 동일한지 마지막 확인
6. **사용자 사전 허락 받고**:
   - 커밋 (작업 단위별 분리 또는 한 묶음)
   - 브랜치 `feat/jste-0.9-only-skip-todo` push
   - PR 생성. 제목·본문 초안 미리 제시

**산출물**

- 모든 검증 통과
- PR 한 건

**진행 메모 (대기 중)**: 2026-06-08 표준 검증 3종 (tsc/lint/build) 모두 통과. 단 브라우저 스모크에서 회귀 발견 — 라이브러리 0.9.0 의 `dist/browser.mjs` 1번 라인이 `import { fileURLToPath } from 'node:url'` 을 포함 (0.8.0 의 `--testLocation` 도입 시 `SELF_FILE = fileURLToPath(import.meta.url)` 가 그대로 browser 빌드에 번들됨). Turbopack worker 가 이 Node 빌트인을 풀지 못해 silent hang → 모든 예제가 5초 타임아웃으로 실패. 본 사이트 측에서 우회 불가. 라이브러리 0.9.1 patch ship 대기 중 (별도 세션 spawn_task 로 분리 — `js-te-package` 의 testManager.js 의 SELF_FILE 계산을 환경별 분기). 0.9.1 ship 후 본 세션에서 `^0.9.0` → `^0.9.1` bump, 브라우저 스모크 재개, 메모리·README 갱신, 사용자 사전 허락 받고 commit/push/PR. 한편 본 사이클 진행 중 무관한 lint 회귀 발견 — `FloatingDemo.tsx:177` 의 `setState in effect` 위반. main 에도 존재하는 사전 위반이라 한 줄 `eslint-disable-next-line react-hooks/set-state-in-effect` 로 임시 통과시키고 본질적 effect 리팩토링은 별도 fix 태스크로 spawn (사용자 결정).

**진행 메모 (2026-06-13)**: 0.9.1 ship 확인 → `node:url` 회귀 해결 (기존 예제 hello/matchers/each/fn 전부 PASS). 그러나 새 only/skip/todo 는 여전히 FAIL — **별개의 라이브러리 버그** 발견: browser entry (`js-te-package/browser.js`) 가 `test.only/.skip/.todo`·`describe.only/.skip` 부착을 누락 (메인 `index.js` 엔 있음 — 0.9.0 모디파이어 추가 시 browser 만 빠뜨림). 데모 러너가 browser entry 의 `test` 를 그대로 주입하므로 `test.only is not a function` 런타임 에러. **사용자 결정 = 우회 대신 라이브러리 패치 0.9.2.** 사용자가 `browser.js` 에 모디파이어 5줄 추가 + 빌드 + npm link 완료. 본 세션에서 패치 사전검증: npm link / `npm pack --no-save` tarball 둘 다 Turbopack symlink·hidden-lockfile 트랩으로 실패 → **오버레이**(레지스트리 0.9.1 깨끗이 설치 후 패치 `dist/browser.mjs`+map+`browser.js` 만 node_modules 에 cp)로 검증 성공: only(통과1·건너뜀1)/skip(통과1·건너뜀1)/todo(통과1·예정2) 전부 PASS, 트리 `⊘`(skipped)·`✓`(pass) 정상 렌더. **다음 액션 (0.9.2 publish 후 새 세션)**: `^0.9.1`→`^0.9.2`, 레지스트리 clean `npm install`(오버레이 제거), /ko·/en 전체 스모크, 메모리·README 갱신, 사용자 사전 허락 받고 commit/push/PR. **현재 dannysir-labs 상태**: `package.json` `^0.9.1`(← `^0.9.0` bump, 미커밋), `node_modules/@dannysir/js-te` 는 임시 오버레이. 상세는 메모리 `project_jste_09_browser_entry_bug.md`.

**진행 메모 (2026-06-13, 0.9.2 적용)**: 0.9.2 publish 확인 (`npm view` latest=0.9.2, browser.mjs 에 `test.only/.skip/.todo`·`describe.only/.skip` 부착 확인). dannysir-labs 정리 — `package.json` `^0.9.1`→`^0.9.2`, 오버레이 node_modules 제거 후 레지스트리 clean install (symlink 아닌 정규 dir, lockfile 0.9.2), 전역 npm link `@dannysir/js-te` 제거(`npm rm -g`). 표준 검증 3종 (tsc/lint/build) 모두 통과. 브라우저 스모크 (/ko·/en): only(통과1·건너뜀1)/skip(통과1·건너뜀1)/todo(통과1·예정2) 전부 PASS, 트리 `⊘`(skipped)·`✓`(pass)·`☐`(todo) 정상, 기존 hello/matchers/each/fn 회귀 없음, 콘솔 에러 0. 메모리(`project_js_te_mini_runner_rationale`, `project_jste_09_browser_entry_bug`)·README 갱신 완료. 사용자 허락 받고 **로컬 단일 feat 커밋 완료** (Phase 1~6 작업 트리 전체를 한 커밋으로). **남은 것: push/PR — 사용자 추가 지시 대기.** PR merge 시 체크박스 [x].

**완료 메모**: 

---

## 검증 명령어 (작업 단위 마무리 표준)

```bash
npx tsc --noEmit
npm run lint
npm run build
```

세 명령이 **모두 통과** 해야 작업 단위 "완료" 처리.
