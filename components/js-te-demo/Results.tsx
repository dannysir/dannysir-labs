'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import type { RunResult, TestNode, TestNodeStatus } from './runner';

export type ResultsState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'timeout' }
  | { kind: 'result'; result: RunResult; noWorker?: boolean };

interface ResultsProps {
  dict: Dictionary['jste']['results'];
  state: ResultsState;
}

const formatSummary = (
  template: string,
  passed: number,
  failed: number,
  skipped: number,
  todo: number,
  ms: number,
): string => template
  .replace('{{passed}}', String(passed))
  .replace('{{failed}}', String(failed))
  .replace('{{skipped}}', String(skipped))
  .replace('{{todo}}', String(todo))
  .replace('{{ms}}', String(ms));

interface LeafVisual {
  icon: string;
  classes: string;
}

const leafVisual = (status: TestNodeStatus): LeafVisual => {
  switch (status) {
    case 'pass':
      return { icon: '✓', classes: 'text-tertiary' };
    case 'fail':
      return { icon: '✗', classes: 'text-error' };
    case 'skipped':
      return { icon: '⊘', classes: 'text-on-surface-variant/50' };
    case 'todo':
      return { icon: '☐', classes: 'text-secondary' };
    default:
      return { icon: '·', classes: 'text-on-surface-variant' };
  }
};

const describeVisual = (status: TestNodeStatus): LeafVisual => (
  status === 'fail'
    ? { icon: '▾', classes: 'text-error' }
    : { icon: '▾', classes: 'text-tertiary' }
);

interface TreeProps {
  nodes: TestNode[];
  depth: number;
  consoleHeading: string;
}

function Tree({ nodes, depth, consoleHeading }: TreeProps): React.ReactElement {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const visual = node.type === 'describe'
          ? describeVisual(node.status)
          : leafVisual(node.status);
        return (
          <li key={node.id} style={{ paddingLeft: depth * 14 }}>
            <div className={`flex items-baseline gap-2 text-sm ${visual.classes}`}>
              <span className="font-mono">{visual.icon}</span>
              <span className={node.type === 'describe' ? 'font-semibold' : ''}>
                {node.name}
              </span>
              {node.type === 'test'
              && (node.status === 'pass' || node.status === 'fail') ? (
                <span className="text-xs text-on-surface-variant/60">
                  ({node.durationMs}
                  ms)
                </span>
                ) : null}
            </div>
            {node.type === 'test' && node.error ? (
              <pre className="ml-6 mt-1 whitespace-pre-wrap break-words rounded-md border border-error/30 bg-error/10 px-3 py-2 font-mono text-xs text-error">
                {node.error.message}
              </pre>
            ) : null}
            {node.type === 'test' && node.consoleLogs.length > 0 ? (
              <div className="ml-6 mt-1 rounded-md border border-outline-variant/30 bg-surface-high/40 px-3 py-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                  {consoleHeading}
                </div>
                <ul className="space-y-0.5 font-mono text-xs text-on-surface-variant">
                  {node.consoleLogs.map((entry, i) => (
                    <li key={`${node.id}-log-${i}`}>
                      <span className="mr-1 text-on-surface-variant/50">
                        [
                        {entry.level}
                        ]
                      </span>
                      {entry.args.join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {node.type === 'describe' ? (
              <div className="mt-1">
                <Tree
                  nodes={node.children}
                  depth={depth + 1}
                  consoleHeading={consoleHeading}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Cursor(): React.ReactElement {
  return (
    <div className="mt-4 flex items-center gap-1">
      <span className="text-primary">❯</span>
      <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
    </div>
  );
}

export function Results({ dict, state }: ResultsProps): React.ReactElement {
  if (state.kind === 'idle') {
    return (
      <div className="font-mono text-sm">
        <p className="text-on-surface-variant/60">{dict.idle}</p>
        <Cursor />
      </div>
    );
  }

  if (state.kind === 'running') {
    return (
      <p className="flex items-center gap-2 font-mono text-sm text-on-surface-variant">
        <span className="text-primary">❯</span>
        {dict.heading}…
      </p>
    );
  }

  if (state.kind === 'timeout') {
    return (
      <div className="font-mono text-sm">
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-error">
          {dict.timeout}
        </p>
        <Cursor />
      </div>
    );
  }

  const passOk = state.result.failed === 0 && !state.result.runtimeError;
  return (
    <div className="space-y-3">
      {state.noWorker ? (
        <p className="rounded-md border border-outline-variant/30 bg-surface-high/40 px-3 py-2 text-xs text-on-surface-variant">
          {dict.noWorker}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold ${
            passOk
              ? 'bg-tertiary/20 text-tertiary'
              : 'bg-error/20 text-error'
          }`}
        >
          {passOk ? 'PASS' : 'FAIL'}
        </span>
        <span className="font-mono text-sm font-medium text-on-surface">
          {formatSummary(
            dict.summary,
            state.result.passed,
            state.result.failed,
            state.result.skipped,
            state.result.todo,
            state.result.durationMs,
          )}
        </span>
      </div>
      {state.result.usedNodeOnlyMock ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs text-secondary">
          {dict.nodeOnlyMockDetected}
        </p>
      ) : null}
      {state.result.runtimeError ? (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-error">
            {dict.runtimeError}
          </p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-error">
            {state.result.runtimeError.message}
          </pre>
        </div>
      ) : null}
      {state.result.tree.length > 0 ? (
        <Tree
          nodes={state.result.tree}
          depth={0}
          consoleHeading={dict.consoleHeading}
        />
      ) : null}
      <Cursor />
    </div>
  );
}
