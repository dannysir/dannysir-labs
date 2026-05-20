'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import type { RunResult, TestNode } from './runner';

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
  ms: number,
): string => template
  .replace('{{passed}}', String(passed))
  .replace('{{failed}}', String(failed))
  .replace('{{ms}}', String(ms));

interface TreeProps {
  nodes: TestNode[];
  depth: number;
  consoleHeading: string;
}

function Tree({ nodes, depth, consoleHeading }: TreeProps): React.ReactElement {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const pass = node.status === 'pass';
        const statusClass = pass ? 'text-tertiary' : 'text-error';
        const icon = node.type === 'describe' ? '▾' : pass ? '✓' : '✗';
        return (
          <li key={node.id} style={{ paddingLeft: depth * 14 }}>
            <div className={`flex items-baseline gap-2 text-sm ${statusClass}`}>
              <span className="font-mono">{icon}</span>
              <span className={node.type === 'describe' ? 'font-semibold' : ''}>
                {node.name}
              </span>
              {node.type === 'test' ? (
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

export function Results({ dict, state }: ResultsProps): React.ReactElement {
  return (
    <section
      aria-label={dict.heading}
      className="flex h-full flex-col rounded-lg border border-outline-variant/30 bg-surface/40"
    >
      <header className="border-b border-outline-variant/30 px-4 py-2">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          {dict.heading}
        </h2>
      </header>
      <div className="flex-1 overflow-auto px-4 py-3">
        {state.kind === 'idle' ? (
          <p className="text-sm text-on-surface-variant/70">{dict.idle}</p>
        ) : null}

        {state.kind === 'running' ? (
          <p className="text-sm text-on-surface-variant">{dict.heading}…</p>
        ) : null}

        {state.kind === 'timeout' ? (
          <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {dict.timeout}
          </p>
        ) : null}

        {state.kind === 'result' ? (
          <div className="space-y-3">
            {state.noWorker ? (
              <p className="rounded-md border border-outline-variant/30 bg-surface-high/40 px-3 py-2 text-xs text-on-surface-variant">
                {dict.noWorker}
              </p>
            ) : null}
            <p className="font-mono text-sm font-medium text-on-surface">
              {formatSummary(
                dict.summary,
                state.result.passed,
                state.result.failed,
                state.result.durationMs,
              )}
            </p>
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
