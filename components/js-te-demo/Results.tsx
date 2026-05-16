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
        const statusClass = pass ? 'text-forest' : 'text-red-700';
        const icon = node.type === 'describe' ? '▾' : pass ? '✓' : '✗';
        return (
          <li key={node.id} style={{ paddingLeft: depth * 14 }}>
            <div className={`flex items-baseline gap-2 text-sm ${statusClass}`}>
              <span className="font-mono">{icon}</span>
              <span className={node.type === 'describe' ? 'font-semibold' : ''}>
                {node.name}
              </span>
              {node.type === 'test' ? (
                <span className="text-xs text-olive">
                  ({node.durationMs}
                  ms)
                </span>
              ) : null}
            </div>
            {node.type === 'test' && node.error ? (
              <pre className="ml-6 mt-1 whitespace-pre-wrap break-words rounded-md bg-red-50 px-3 py-2 font-mono text-xs text-red-800">
                {node.error.message}
              </pre>
            ) : null}
            {node.type === 'test' && node.consoleLogs.length > 0 ? (
              <div className="ml-6 mt-1 rounded-md border border-stone/60 bg-cream/50 px-3 py-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-olive">
                  {consoleHeading}
                </div>
                <ul className="space-y-0.5 font-mono text-xs text-cocoa">
                  {node.consoleLogs.map((entry, i) => (
                    <li key={`${node.id}-log-${i}`}>
                      <span className="mr-1 text-olive">
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
      className="flex h-full flex-col rounded-lg border border-stone bg-cream/40"
    >
      <header className="border-b border-stone/70 px-4 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-olive">
          {dict.heading}
        </h2>
      </header>
      <div className="flex-1 overflow-auto px-4 py-3">
        {state.kind === 'idle' ? (
          <p className="text-sm text-olive">{dict.idle}</p>
        ) : null}

        {state.kind === 'running' ? (
          <p className="text-sm text-cocoa">{dict.heading}…</p>
        ) : null}

        {state.kind === 'timeout' ? (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {dict.timeout}
          </p>
        ) : null}

        {state.kind === 'result' ? (
          <div className="space-y-3">
            {state.noWorker ? (
              <p className="rounded-md border border-stone bg-cream/70 px-3 py-2 text-xs text-cocoa">
                {dict.noWorker}
              </p>
            ) : null}
            <p className="text-sm font-medium text-onyx">
              {formatSummary(
                dict.summary,
                state.result.passed,
                state.result.failed,
                state.result.durationMs,
              )}
            </p>
            {state.result.usedNodeOnlyMock ? (
              <p className="rounded-md border border-gold/50 bg-cream/80 px-3 py-2 text-xs text-cocoa">
                {dict.nodeOnlyMockDetected}
              </p>
            ) : null}
            {state.result.runtimeError ? (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                  {dict.runtimeError}
                </p>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-800">
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
