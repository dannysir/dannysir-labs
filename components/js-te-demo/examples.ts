export type ExampleId = 'hello' | 'matchers' | 'each' | 'fn' | 'mock';

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
  mock: { id: 'mock', source: mockExample, readOnly: true },
};

export const exampleOrder: ExampleId[] = ['hello', 'matchers', 'each', 'fn', 'mock'];
