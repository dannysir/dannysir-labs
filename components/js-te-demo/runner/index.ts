import { Collector } from './collector';
import { clearAllMocks, createMockFn, resetMockRegistry } from './createMockFn';
import { createExpect } from './matchers';
import type {
  ConsoleEntry,
  ConsoleLevel,
  RunOptions,
  RunResult,
  TestError,
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

export const runUserCode = async (
  source: string,
  options: RunOptions = {},
): Promise<RunResult> => {
  void options;
  const startedAt = (typeof performance !== 'undefined' ? performance : Date)
    .now();
  const usedNodeOnlyMock = NODE_ONLY_MOCK_RE.test(source);

  resetMockRegistry();

  const collector = new Collector();
  const api = collector.buildApi();
  const expect = createExpect();

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
      describe: typeof api.describe,
      test: typeof api.test,
      beforeEach: typeof api.beforeEach,
      expect: ReturnType<typeof createExpect>,
      fn: typeof createMockFn,
      console: Console,
    ) => unknown;

    userFn(api.describe, api.test, api.beforeEach, expect, createMockFn, proxyConsole);
  } catch (err) {
    runtimeError = toTestError(err);
  }

  if (runtimeError) {
    clearAllMocks();
    return {
      tree: [],
      passed: 0,
      failed: 0,
      usedNodeOnlyMock,
      runtimeError,
      durationMs: Math.round(
        (typeof performance !== 'undefined' ? performance : Date).now() - startedAt,
      ),
    };
  }

  const { tree, passed, failed } = await collector.runAll(setActiveLogs);

  return {
    tree,
    passed,
    failed,
    usedNodeOnlyMock,
    durationMs: Math.round(
      (typeof performance !== 'undefined' ? performance : Date).now() - startedAt,
    ),
  };
};
