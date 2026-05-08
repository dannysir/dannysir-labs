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

export type TestNodeStatus = 'pass' | 'fail';

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
  error?: TestError;
  consoleLogs: ConsoleEntry[];
  durationMs: number;
}

export type TestNode = DescribeNode | TestLeafNode;

export interface RunResult {
  tree: TestNode[];
  passed: number;
  failed: number;
  usedNodeOnlyMock: boolean;
  runtimeError?: TestError;
  durationMs: number;
}

export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

export type MatcherFn = (actual: unknown, ...args: unknown[]) => MatcherResult;
