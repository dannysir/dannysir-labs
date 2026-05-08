import { deepEqual } from './deepEqual';
import type { MatcherFn, MatcherResult } from './types';

const safeStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, val: unknown) => {
      if (typeof val === 'function') return `[Function ${(val as { name?: string }).name ?? 'anonymous'}]`;
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val as object)) return '[Circular]';
        seen.add(val as object);
      }
      return val;
    }) ?? String(value);
  } catch {
    return String(value);
  }
};

const runArgFnc = (actual: unknown): unknown => (
  typeof actual === 'function' ? (actual as () => unknown)() : actual
);

const isErrorClass = (value: unknown): value is ErrorConstructor => (
  typeof value === 'function'
  && (value === Error || (value as { prototype?: unknown }).prototype instanceof Error)
);

const matchesThrown = (thrown: unknown, expected: unknown): boolean => {
  if (expected === undefined) return true;
  const errMsg = String(
    (thrown as { message?: unknown })?.message ?? thrown,
  );
  if (typeof expected === 'string') return errMsg.includes(expected);
  if (expected instanceof RegExp) return expected.test(errMsg);
  if (isErrorClass(expected)) return thrown instanceof expected;
  if (typeof expected === 'function') {
    return (expected as (e: unknown) => unknown)(thrown) === true;
  }
  return false;
};

const describeThrowExpected = (expected: unknown): string => {
  if (expected === undefined) return 'to throw an error';
  if (typeof expected === 'string') return `to throw an error containing "${expected}"`;
  if (expected instanceof RegExp) return `to throw an error matching ${expected}`;
  if (isErrorClass(expected)) {
    return `to throw an instance of ${(expected as { name?: string }).name ?? 'Error'}`;
  }
  if (typeof expected === 'function') return 'to throw an error matching predicate';
  return 'to throw an error';
};

const getMockCalls = (actual: unknown): unknown[][] => {
  const calls = (actual as { mock?: { calls?: unknown[][] } })?.mock?.calls;
  return Array.isArray(calls) ? calls : [];
};

const toBe: MatcherFn = (actual, expected) => {
  const value = runArgFnc(actual);
  return {
    pass: Object.is(value, expected),
    message: () => `Expected ${safeStringify(expected)} but got ${safeStringify(value)}`,
  };
};

const toEqual: MatcherFn = (actual, expected) => {
  const value = runArgFnc(actual);
  return {
    pass: deepEqual(value, expected),
    message: () => `Expected ${safeStringify(expected)} but got ${safeStringify(value)}`,
  };
};

const toThrow: MatcherFn = (actual, expected) => {
  let thrown: unknown;
  let didThrow = false;
  try {
    if (typeof actual === 'function') {
      (actual as () => unknown)();
    }
  } catch (e) {
    thrown = e;
    didThrow = true;
  }

  if (!didThrow) {
    return {
      pass: false,
      message: () => `Expected function ${describeThrowExpected(expected)}, but it did not throw`,
    };
  }

  return {
    pass: matchesThrown(thrown, expected),
    message: () => {
      const head = `Expected function ${describeThrowExpected(expected)}`;
      const actualDesc = thrown instanceof Error
        ? `${thrown.constructor.name}: ${thrown.message}`
        : String(thrown);
      return `${head}, but got ${actualDesc}`;
    },
  };
};

const toBeTruthy: MatcherFn = (actual) => ({
  pass: Boolean(actual),
  message: () => `Expected value to be truthy but got ${safeStringify(actual)}`,
});

const toBeFalsy: MatcherFn = (actual) => ({
  pass: !actual,
  message: () => `Expected value to be falsy but got ${safeStringify(actual)}`,
});

const toContain: MatcherFn = (actual, expected) => {
  const supports = (Array.isArray(actual) || typeof actual === 'string')
    && typeof (actual as { includes?: unknown }).includes === 'function';
  const pass = supports && (actual as string | unknown[]).includes(expected as never);
  return {
    pass,
    message: () => `Expected ${safeStringify(actual)} to contain ${safeStringify(expected)}`,
  };
};

const toBeInstanceOf: MatcherFn = (actual, expected) => {
  const ctor = expected as { name?: string } | undefined;
  const name = ctor?.name ?? 'Constructor';
  const isInstance = typeof expected === 'function' && actual instanceof (expected as new (...args: unknown[]) => unknown);
  const actualName = actual === null
    ? 'null'
    : actual === undefined
      ? 'undefined'
      : (actual as { constructor?: { name?: string } })?.constructor?.name ?? typeof actual;
  return {
    pass: isInstance,
    message: () => `Expected value to be instance of ${name} but got ${actualName}`,
  };
};

const toBeNull: MatcherFn = (actual) => ({
  pass: actual === null,
  message: () => `Expected null but got ${safeStringify(actual)}`,
});

const toBeUndefined: MatcherFn = (actual) => ({
  pass: actual === undefined,
  message: () => `Expected undefined but got ${safeStringify(actual)}`,
});

const toBeDefined: MatcherFn = (actual) => ({
  pass: actual !== undefined,
  message: () => 'Expected value to be defined but got undefined',
});

const toHaveBeenCalled: MatcherFn = (actual) => {
  const calls = getMockCalls(actual);
  return {
    pass: calls.length > 0,
    message: () => `Expected mock to have been called, but it was called ${calls.length} times`,
  };
};

const toHaveBeenCalledWith: MatcherFn = (actual, ...expectedArgs) => {
  const calls = getMockCalls(actual);
  return {
    pass: calls.some((callArgs) => deepEqual(callArgs, expectedArgs)),
    message: () => `Expected mock to have been called with ${safeStringify(expectedArgs)}, but received calls: ${safeStringify(calls)}`,
  };
};

const toHaveBeenCalledTimes: MatcherFn = (actual, expected) => {
  const calls = getMockCalls(actual);
  return {
    pass: calls.length === expected,
    message: () => `Expected mock to have been called ${String(expected)} times, but it was called ${calls.length} times`,
  };
};

const matchers: Record<string, MatcherFn> = {
  toBe,
  toEqual,
  toThrow,
  toBeTruthy,
  toBeFalsy,
  toContain,
  toBeInstanceOf,
  toBeNull,
  toBeUndefined,
  toBeDefined,
  toHaveBeenCalled,
  toHaveBeenCalledWith,
  toHaveBeenCalledTimes,
};

export type ExpectApi = Record<string, (...args: unknown[]) => void> & {
  not: Record<string, (...args: unknown[]) => void>;
};

const buildApi = (actual: unknown, isNot: boolean): Record<string, (...args: unknown[]) => void> => {
  const api: Record<string, (...args: unknown[]) => void> = {};
  for (const [name, matcher] of Object.entries(matchers)) {
    api[name] = (...args: unknown[]) => {
      const result: MatcherResult = matcher(actual, ...args);
      if (result.pass === isNot) {
        throw new Error(result.message());
      }
    };
  }
  return api;
};

export const createExpect = () => (actual: unknown): ExpectApi => {
  const api = buildApi(actual, false) as ExpectApi;
  api.not = buildApi(actual, true);
  return api;
};
