declare module '@dannysir/js-te/browser' {
  export interface MockFn {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
    mockImplementation: (impl: (...args: unknown[]) => unknown) => MockFn;
    mockReturnValue: (value: unknown) => MockFn;
    mockReturnValueOnce: (...values: unknown[]) => MockFn;
    mockClear: () => MockFn;
  }

  export interface ExpectApi {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toThrow: (expected?: unknown) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toContain: (expected: unknown) => void;
    toBeInstanceOf: (Ctor: unknown) => void;
    toBeNull: () => void;
    toBeUndefined: () => void;
    toBeDefined: () => void;
    toHaveBeenCalled: () => void;
    toHaveBeenCalledWith: (...args: unknown[]) => void;
    toHaveBeenCalledTimes: (expected: number) => void;
    not: Omit<ExpectApi, 'not'>;
  }

  export const describe: (name: string, fn: () => void) => void;

  export interface TestFn {
    (description: string, fn: () => unknown | Promise<unknown>): void;
    each: <T extends unknown[]>(
      cases: ReadonlyArray<T | unknown>,
    ) => (description: string, fn: (...args: T) => unknown | Promise<unknown>) => void;
  }
  export const test: TestFn;

  export const beforeEach: (fn: () => unknown | Promise<unknown>) => void;
  export const expect: (actual: unknown) => ExpectApi;
  export const fn: (implementation?: (...args: unknown[]) => unknown) => MockFn;

  export interface CollectedTest {
    description: string;
    path: string;
    fn: () => Promise<void>;
  }

  export interface TestManager {
    getTests: () => CollectedTest[];
    clearTests: () => void;
    run: (
      reporter?: unknown,
      testNamePattern?: string,
      file?: string,
    ) => Promise<{ passed: number; failed: number }>;
  }
  export const testManager: TestManager;
}
