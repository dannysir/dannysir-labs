import type { TestCase } from '@dannysir/js-te/browser';

import type {
  ConsoleEntry,
  ConsoleLevel,
  DescribeNode,
  RunOptions,
  RunResult,
  TestError,
  TestLeafNode,
  TestNode,
} from './types';

export type { RunOptions, RunResult, TestError } from './types';
export type {
  ConsoleEntry,
  ConsoleLevel,
  DescribeNode,
  TestLeafNode,
  TestNode,
  TestNodeStatus,
} from './types';

const NODE_ONLY_MOCK_RE = /\bmock\s*\(/;
const PATH_DELIMITER = ' > ';

const now = (): number => (typeof performance !== 'undefined' ? performance : Date).now();

const stringifyConsoleArg = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const toTestError = (err: unknown): TestError => {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return { message: String(err) };
};

const buildCapturingConsole = (
  getActive: () => ConsoleEntry[] | null,
): Console => {
  const push = (level: ConsoleLevel, args: unknown[]): void => {
    const target = getActive();
    if (!target) return;
    target.push({ level, args: args.map(stringifyConsoleArg) });
  };
  const proxyConsole: Pick<Console, 'log' | 'info' | 'warn' | 'error'> = {
    log: (...args: unknown[]) => push('log', args),
    info: (...args: unknown[]) => push('info', args),
    warn: (...args: unknown[]) => push('warn', args),
    error: (...args: unknown[]) => push('error', args),
  };
  return proxyConsole as Console;
};

interface BuiltTree {
  roots: TestNode[];
  leaves: { test: TestCase; node: TestLeafNode }[];
}

const buildTree = (collected: readonly TestCase[]): BuiltTree => {
  const roots: TestNode[] = [];
  const describeIndex = new Map<string, DescribeNode>();
  const leaves: { test: TestCase; node: TestLeafNode }[] = [];
  let idCounter = 0;
  const nextId = (): string => {
    idCounter += 1;
    return `n${idCounter}`;
  };

  for (const t of collected) {
    const segments = t.path === '' ? [] : t.path.split(PATH_DELIMITER);
    let parentChildren = roots;
    let accumulatedPath = '';

    for (const seg of segments) {
      accumulatedPath = accumulatedPath === ''
        ? seg
        : `${accumulatedPath}${PATH_DELIMITER}${seg}`;
      let node = describeIndex.get(accumulatedPath);
      if (!node) {
        node = {
          id: nextId(),
          type: 'describe',
          name: seg,
          status: 'pass',
          children: [],
        };
        parentChildren.push(node);
        describeIndex.set(accumulatedPath, node);
      }
      parentChildren = node.children;
    }

    const leaf: TestLeafNode = {
      id: nextId(),
      type: 'test',
      name: t.description,
      status: 'pass',
      mode: t.mode,
      consoleLogs: [],
      durationMs: 0,
    };
    parentChildren.push(leaf);
    leaves.push({ test: t, node: leaf });
  }

  return { roots, leaves };
};

/**
 * 라이브러리 testManager.run() 룰과 동일:
 * 같은 파일(데모는 가상의 한 파일) 안에 `.only` 가 하나라도 있으면
 * `mode === 'normal'` 인 케이스를 'skip' 으로 demote 합니다.
 * 사본을 만들어 라이브러리 객체를 mutate 하지 않습니다.
 */
const applyOnlyDemotion = (tests: readonly TestCase[]): TestCase[] => {
  const hasOnly = tests.some((t) => t.mode === 'only');
  if (!hasOnly) return tests.map((t) => ({ ...t }));
  return tests.map((t) => (t.mode === 'normal' ? { ...t, mode: 'skip' as const } : { ...t }));
};

const rollupStatuses = (nodes: TestNode[]): boolean => {
  let anyFailed = false;
  for (const node of nodes) {
    if (node.type === 'test') {
      if (node.status === 'fail') anyFailed = true;
    } else {
      const childFailed = rollupStatuses(node.children);
      if (childFailed) {
        node.status = 'fail';
        anyFailed = true;
      }
    }
  }
  return anyFailed;
};

export const runUserCode = async (
  source: string,
  options: RunOptions = {},
): Promise<RunResult> => {
  void options;
  const startedAt = now();
  const usedNodeOnlyMock = NODE_ONLY_MOCK_RE.test(source);

  // Dynamic import: the package marks this subpath as `"node": null`, so we
  // load it only at run time (browser / Web Worker) to keep SSR bundles clean.
  const {
    describe,
    test,
    beforeEach,
    expect,
    fn,
    testManager,
  } = await import('@dannysir/js-te/browser');

  testManager.clearTests();

  let activeLogs: ConsoleEntry[] | null = null;
  const setActiveLogs = (logs: ConsoleEntry[] | null): void => {
    activeLogs = logs;
  };
  const proxyConsole = buildCapturingConsole(() => activeLogs);

  let runtimeError: TestError | undefined;

  try {
    const userFn = new Function(
      'describe',
      'test',
      'beforeEach',
      'expect',
      'fn',
      'console',
      source,
    ) as (
      describe_: typeof describe,
      test_: typeof test,
      beforeEach_: typeof beforeEach,
      expect_: typeof expect,
      fn_: typeof fn,
      console_: Console,
    ) => unknown;

    userFn(describe, test, beforeEach, expect, fn, proxyConsole);
  } catch (err) {
    runtimeError = toTestError(err);
  }

  if (runtimeError) {
    testManager.clearTests();
    return {
      tree: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      todo: 0,
      usedNodeOnlyMock,
      runtimeError,
      durationMs: Math.round(now() - startedAt),
    };
  }

  const resolved = applyOnlyDemotion(testManager.getTests());
  const { roots, leaves } = buildTree(resolved);

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let todo = 0;

  for (const { test: t, node } of leaves) {
    if (node.mode === 'todo') {
      node.status = 'todo';
      todo += 1;
      continue;
    }
    if (node.mode === 'skip') {
      node.status = 'skipped';
      skipped += 1;
      continue;
    }

    const ts = now();
    setActiveLogs(node.consoleLogs);
    try {
      await t.fn();
      node.status = 'pass';
      passed += 1;
    } catch (err) {
      node.status = 'fail';
      node.error = toTestError(err);
      failed += 1;
    } finally {
      node.durationMs = Math.round(now() - ts);
      setActiveLogs(null);
    }
  }

  rollupStatuses(roots);
  testManager.clearTests();

  return {
    tree: roots,
    passed,
    failed,
    skipped,
    todo,
    usedNodeOnlyMock,
    durationMs: Math.round(now() - startedAt),
  };
};
