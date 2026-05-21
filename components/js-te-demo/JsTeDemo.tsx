'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FileCodeIcon,
  PlayIcon,
  RefreshIcon,
  TrashIcon,
} from '@/components/site/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { Editor } from './Editor';
import { type ExampleId, exampleOrder, examples } from './examples';
import { Results, type ResultsState } from './Results';
import { runWithWorker } from './runWithWorker';

interface JsTeDemoProps {
  dict: Dictionary['jste'];
}

const TIMEOUT_MS = 5000;

interface StatusInfo {
  label: string;
  className: string;
  spinning: boolean;
}

const deriveStatus = (
  state: ResultsState,
  dict: Dictionary['jste']['status'],
): StatusInfo => {
  if (state.kind === 'running') {
    return { label: dict.running, className: 'text-secondary', spinning: true };
  }
  if (state.kind === 'timeout') {
    return { label: dict.fail, className: 'text-error', spinning: false };
  }
  if (state.kind === 'result') {
    const passOk = state.result.failed === 0 && !state.result.runtimeError;
    return passOk
      ? { label: dict.pass, className: 'text-tertiary', spinning: false }
      : { label: dict.fail, className: 'text-error', spinning: false };
  }
  return { label: dict.ready, className: 'text-tertiary', spinning: false };
};

const paneHeaderClass =
  'flex items-center justify-between border-b border-outline-variant/10 bg-surface-lowest px-4 py-2 font-mono text-xs uppercase tracking-widest text-on-surface-variant/60';

const runButtonClass =
  'flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-mono text-xs font-bold text-on-primary shadow-[0_0_16px_rgba(138,235,255,0.3)] transition-shadow hover:shadow-[0_0_28px_rgba(138,235,255,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none';

const clearButtonClass =
  'flex items-center gap-1.5 rounded-full border border-outline-variant/40 px-3 py-1.5 font-mono text-xs text-on-surface-variant transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

export function JsTeDemo({ dict }: JsTeDemoProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<ExampleId>('hello');
  const [source, setSource] = useState<string>(examples.hello.source);
  const [resultsState, setResultsState] = useState<ResultsState>({ kind: 'idle' });
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const current = examples[selectedId];
  const blocked = current.readOnly;
  const status = deriveStatus(resultsState, dict.status);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const handleSelectExample = useCallback((id: ExampleId): void => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSelectedId(id);
    setSource(examples[id].source);
    setResultsState({ kind: 'idle' });
    setIsRunning(false);
  }, []);

  const handleSourceChange = useCallback((next: string): void => {
    setSource(next);
  }, []);

  const handleClear = useCallback((): void => {
    abortRef.current?.abort();
    abortRef.current = null;
    setResultsState({ kind: 'idle' });
    setIsRunning(false);
  }, []);

  const handleRun = useCallback(async (): Promise<void> => {
    if (blocked) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    setResultsState({ kind: 'running' });
    const outcome = await runWithWorker(source, {
      timeoutMs: TIMEOUT_MS,
      signal: controller.signal,
    });
    if (controller.signal.aborted) return;
    if (outcome.kind === 'timeout') {
      setResultsState({ kind: 'timeout' });
    } else if (outcome.kind === 'result') {
      setResultsState({
        kind: 'result',
        result: outcome.result,
        noWorker: outcome.noWorker,
      });
    }
    setIsRunning(false);
  }, [blocked, source]);

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/10 bg-surface-low/60 px-4 py-3">
        <span className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant">
          <FileCodeIcon className="h-4 w-4 text-primary" />
          {dict.fileName}
        </span>
        <div className="flex items-center gap-2">
          <label
            htmlFor="jste-example-select"
            className="font-mono text-xs text-on-surface-variant"
          >
            {dict.exampleLabel}
          </label>
          <select
            id="jste-example-select"
            value={selectedId}
            onChange={(e) => handleSelectExample(e.target.value as ExampleId)}
            className="rounded-md border border-outline-variant/40 bg-surface-high px-2 py-1 font-mono text-xs text-on-surface focus:border-primary/50 focus:outline-none"
          >
            {exampleOrder.map((id) => (
              <option key={id} value={id}>
                {dict.examples[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className={clearButtonClass}
            disabled={resultsState.kind === 'idle' || isRunning}
            onClick={handleClear}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            {dict.clear}
          </button>
          <button
            type="button"
            className={runButtonClass}
            disabled={blocked || isRunning}
            onClick={handleRun}
          >
            <PlayIcon className="h-3.5 w-3.5" />
            {isRunning ? dict.running : dict.run}
          </button>
        </div>
      </div>

      {blocked ? (
        <div className="border-b border-outline-variant/10 bg-secondary/10 px-4 py-2 font-mono text-xs text-secondary">
          {dict.mockBanner}
        </div>
      ) : null}

      {/* Editor | Terminal */}
      <div className="grid grid-cols-1 divide-y divide-outline-variant/10 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="flex flex-col bg-[#010409]">
          <div className={paneHeaderClass}>
            <span>{dict.editorLabel}</span>
          </div>
          <Editor
            value={source}
            onChange={handleSourceChange}
            readOnly={blocked}
            height="380px"
          />
        </div>
        <div className="flex flex-col bg-surface-lowest">
          <div className={paneHeaderClass}>
            <span>{dict.terminalLabel}</span>
            <span
              className={`flex items-center gap-1.5 normal-case tracking-normal ${status.className}`}
            >
              {status.spinning ? (
                <RefreshIcon className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
              {status.label}
            </span>
          </div>
          <div className="h-[380px] overflow-auto px-4 py-3">
            <Results dict={dict.results} state={resultsState} />
          </div>
        </div>
      </div>
    </div>
  );
}
