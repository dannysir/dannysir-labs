import { clearAllMocks } from './createMockFn';
import type {
  ConsoleEntry,
  DescribeNode,
  TestError,
  TestLeafNode,
  TestNode,
} from './types';

type AnyFn = () => unknown | Promise<unknown>;

interface CollectedTest {
  node: TestLeafNode;
  fn: AnyFn;
  beforeEachHooks: AnyFn[];
}

const PLACEHOLDER_RE = /%([so])/g;

const formatDescription = (args: unknown[], description: string): string => {
  let argIndex = 0;
  return description.replace(PLACEHOLDER_RE, (match, type: string) => {
    if (argIndex >= args.length) return match;
    const value = args[argIndex];
    argIndex += 1;
    if (type === 's') return String(value);
    if (type === 'o') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return match;
  });
};

const toTestError = (err: unknown): TestError => {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return { message: String(err) };
};

export interface CollectorApi {
  describe: (name: string, fn: () => void) => void;
  test: TestApi;
  beforeEach: (fn: AnyFn) => void;
}

export interface TestApi {
  (name: string, fn: AnyFn): void;
  each: <T extends unknown[]>(
    cases: ReadonlyArray<T | unknown>,
  ) => (name: string, fn: (...args: T) => unknown) => void;
}

export class Collector {
  private roots: TestNode[] = [];

  private describeStack: DescribeNode[] = [];

  private beforeEachStack: AnyFn[] = [];

  private collectedTests: CollectedTest[] = [];

  private idCounter = 0;

  private nextId(): string {
    this.idCounter += 1;
    return `n${this.idCounter}`;
  }

  private currentChildren(): TestNode[] {
    const top = this.describeStack[this.describeStack.length - 1];
    return top ? top.children : this.roots;
  }

  private describe = (name: string, fn: () => void): void => {
    const node: DescribeNode = {
      id: this.nextId(),
      type: 'describe',
      name,
      status: 'pass',
      children: [],
    };
    this.currentChildren().push(node);
    this.describeStack.push(node);
    const prevHookCount = this.beforeEachStack.length;
    try {
      fn();
    } finally {
      this.beforeEachStack.length = prevHookCount;
      this.describeStack.pop();
    }
  };

  private registerTest = (name: string, fn: AnyFn): void => {
    const node: TestLeafNode = {
      id: this.nextId(),
      type: 'test',
      name,
      status: 'pass',
      consoleLogs: [],
      durationMs: 0,
    };
    this.currentChildren().push(node);
    this.collectedTests.push({
      node,
      fn,
      beforeEachHooks: [...this.beforeEachStack],
    });
  };

  private beforeEach = (fn: AnyFn): void => {
    this.beforeEachStack.push(fn);
  };

  buildApi(): CollectorApi {
    const test = ((name: string, fn: AnyFn) => {
      this.registerTest(name, fn);
    }) as TestApi;

    test.each = <T extends unknown[]>(cases: ReadonlyArray<T | unknown>) => (
      (name: string, fn: (...args: T) => unknown) => {
        cases.forEach((testCase) => {
          const args = (Array.isArray(testCase) ? testCase : [testCase]) as T;
          this.registerTest(formatDescription(args, name), () => fn(...args));
        });
      }
    );

    return {
      describe: this.describe,
      test,
      beforeEach: this.beforeEach,
    };
  }

  /**
   * Walk every describe node and update its status to 'fail' if any descendant
   * test failed. Called once after all tests have run.
   */
  private rollupStatuses(nodes: TestNode[]): boolean {
    let anyFailed = false;
    for (const node of nodes) {
      if (node.type === 'test') {
        if (node.status === 'fail') anyFailed = true;
      } else {
        const childFailed = this.rollupStatuses(node.children);
        if (childFailed) {
          node.status = 'fail';
          anyFailed = true;
        }
      }
    }
    return anyFailed;
  }

  async runAll(
    setActiveLogs: (logs: ConsoleEntry[] | null) => void,
  ): Promise<{ tree: TestNode[]; passed: number; failed: number }> {
    let passed = 0;
    let failed = 0;

    for (const { node, fn, beforeEachHooks } of this.collectedTests) {
      const startedAt = performance.now();
      setActiveLogs(node.consoleLogs);
      try {
        for (const hook of beforeEachHooks) {
          await hook();
        }
        await fn();
        node.status = 'pass';
        passed += 1;
      } catch (err) {
        node.status = 'fail';
        node.error = toTestError(err);
        failed += 1;
      } finally {
        node.durationMs = Math.round(performance.now() - startedAt);
        setActiveLogs(null);
        clearAllMocks();
      }
    }

    this.rollupStatuses(this.roots);

    return { tree: this.roots, passed, failed };
  }
}
