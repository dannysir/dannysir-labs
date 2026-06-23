export type ExampleId =
  | 'hello'
  | 'matchers'
  | 'each'
  | 'fn'
  | 'only'
  | 'onlyEach'
  | 'skip'
  | 'skipEach'
  | 'todo'
  | 'mock';

export interface Example {
  id: ExampleId;
  source: string;
  readOnly: boolean;
}

const hello = `describe('math', () => {
  test('add', () => {
    console.log('inside add');
    expect(1 + 2).toBe(3);
  });
});
`;

const matchers = `describe('matchers', () => {
  test('toBe / toEqual', () => {
    expect(1 + 2).toBe(3);
    expect({ name: 'Alice', tags: ['a', 'b'] }).toEqual({
      name: 'Alice',
      tags: ['a', 'b'],
    });
  });

  test('toContain / .not', () => {
    expect([1, 2, 3]).toContain(2);
    expect('hello world').not.toContain('xyz');
  });

  test('toThrow', () => {
    expect(() => {
      throw new Error('boom');
    }).toThrow('boom');
  });

  test('toBeTruthy / toBeFalsy / toBeNull', () => {
    expect('non-empty').toBeTruthy();
    expect(0).toBeFalsy();
    expect(null).toBeNull();
  });
});
`;

const each = `test.each([
  [1, 1, 2],
  [2, 3, 5],
  [10, 20, 30],
])('add(%s, %s) = %s', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
`;

const fnExample = `describe('fn() mocking', () => {
  test('tracks calls', () => {
    const greet = fn();
    greet('Alice');
    greet('Bob', { loud: true });

    expect(greet).toHaveBeenCalledTimes(2);
    expect(greet).toHaveBeenCalledWith('Alice');
    expect(greet).toHaveBeenCalledWith('Bob', { loud: true });
  });

  test('mockReturnValue / mockReturnValueOnce', () => {
    const next = fn().mockReturnValueOnce(1).mockReturnValue(42);
    expect(next()).toBe(1);
    expect(next()).toBe(42);
    expect(next()).toBe(42);
  });

  test('mockImplementation', () => {
    const double = fn((n) => n * 2);
    expect(double(3)).toBe(6);
  });
});
`;

const onlyExample = `// test.only — 같은 파일의 일반 테스트는 자동으로 skipped 됩니다.
describe('focus', () => {
  test('normal test (demoted to skipped)', () => {
    expect('not run').toBe('not run');
  });

  test.only('only this runs', () => {
    expect(2 + 2).toBe(4);
  });
});
`;

const onlyEachExample = `// test.only.each — 생성된 케이스 묶음 전체를 only 로 등록.
// 같은 파일의 일반 test() 는 자동으로 skipped 됩니다.
test('normal test (demoted to skipped)', () => {
  expect('not run').toBe('not run');
});

test.only.each([
  [2, 3, 5],
  [10, 20, 30],
])('only: add(%s, %s) = %s', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
`;

const skipExample = `// test.skip — 함수는 등록만 되고 실행되지 않습니다.
test('runs normally', () => {
  expect(1 + 1).toBe(2);
});

test.skip('known broken — fix later', () => {
  expect(true).toBe(false);
});
`;

const skipEachExample = `// test.skip.each — 생성된 모든 케이스를 실행 없이 skipped 로 보고.
test('runs normally', () => {
  expect(1 + 1).toBe(2);
});

test.skip.each([
  [1, 2, 3],
  [5, 5, 10],
  [100, 200, 300],
])('skipped: add(%s, %s) = %s', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
`;

const todoExample = `// test.todo — 아직 작성하지 않은 테스트를 todo 로 보고합니다 (함수 인자 없음).
test('addition works', () => {
  expect(1 + 1).toBe(2);
});

test.todo('handle empty list');
test.todo('handle very large list');
`;

const mockExample = `// Node.js 전용 예제 — 브라우저에서는 실행되지 않습니다.
// The real @dannysir/js-te runs on Node.js loader hooks,
// so module mocking with mock() works natively.

import { play } from './game.js';
mock('./random.js', { random: () => 0.5 });

test('uses mocked random', () => {
  expect(play()).toBe(5);
});
`;

export const examples: Record<ExampleId, Example> = {
  hello: { id: 'hello', source: hello, readOnly: false },
  matchers: { id: 'matchers', source: matchers, readOnly: false },
  each: { id: 'each', source: each, readOnly: false },
  fn: { id: 'fn', source: fnExample, readOnly: false },
  only: { id: 'only', source: onlyExample, readOnly: false },
  onlyEach: { id: 'onlyEach', source: onlyEachExample, readOnly: false },
  skip: { id: 'skip', source: skipExample, readOnly: false },
  skipEach: { id: 'skipEach', source: skipEachExample, readOnly: false },
  todo: { id: 'todo', source: todoExample, readOnly: false },
  mock: { id: 'mock', source: mockExample, readOnly: true },
};

export const exampleOrder: ExampleId[] = [
  'hello',
  'matchers',
  'each',
  'fn',
  'only',
  'onlyEach',
  'skip',
  'skipEach',
  'todo',
  'mock',
];
