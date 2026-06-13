import type { TestCase } from '@dannysir/js-te/browser';

/**
 * 라이브러리의 TestMode 는 `./browser` entry 에서 직접 re-export 되지 않고
 * `TestCase.mode` 로만 노출됩니다 (0.9.0 기준). 데모는 인덱스 액세스로 동등한 타입을 얻습니다.
 */
export type TestMode = TestCase['mode'];

export interface RunOptions {
  /** Reserved for future Phase 5 worker-side timeout. Currently unused. */
  timeoutMs?: number;
}

export interface TestError {
  message: string;
  stack?: string;
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';

export interface ConsoleEntry {
  level: ConsoleLevel;
  args: string[];
}

export type TestNodeStatus = 'pass' | 'fail' | 'skipped' | 'todo';

export interface DescribeNode {
  id: string;
  type: 'describe';
  name: string;
  status: TestNodeStatus;
  children: TestNode[];
}

export interface TestLeafNode {
  id: string;
  type: 'test';
  name: string;
  status: TestNodeStatus;
  mode: TestMode;
  error?: TestError;
  consoleLogs: ConsoleEntry[];
  durationMs: number;
}

export type TestNode = DescribeNode | TestLeafNode;

export interface RunResult {
  tree: TestNode[];
  passed: number;
  failed: number;
  skipped: number;
  todo: number;
  usedNodeOnlyMock: boolean;
  runtimeError?: TestError;
  durationMs: number;
}

export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

export type MatcherFn = (actual: unknown, ...args: unknown[]) => MatcherResult;
