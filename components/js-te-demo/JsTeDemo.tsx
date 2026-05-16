'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import { Editor } from './Editor';
import { type ExampleId, exampleOrder, examples } from './examples';
import { Results, type ResultsState } from './Results';
import { runWithWorker } from './runWithWorker';

interface JsTeDemoProps {
  dict: Dictionary['jste'];
}

const TIMEOUT_MS = 5000;

const buttonClass = 'rounded-md border border-stone bg-cream px-3 py-1.5 text-xs font-medium text-cocoa transition hover:border-cocoa hover:text-onyx disabled:cursor-not-allowed disabled:opacity-40';

export function JsTeDemo({ dict }: JsTeDemoProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<ExampleId>('hello');
  const [source, setSource] = useState<string>(examples.hello.source);
  const [resultsState, setResultsState] = useState<ResultsState>({ kind: 'idle' });
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const current = examples[selectedId];
  const blocked = current.readOnly;

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
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-stone bg-cream/60 px-3 py-2">
          <label
            htmlFor="jste-example-select"
            className="text-xs font-medium text-cocoa"
          >
            {dict.exampleLabel}
          </label>
          <select
            id="jste-example-select"
            value={selectedId}
            onChange={(e) => handleSelectExample(e.target.value as ExampleId)}
            className="rounded-md border border-stone bg-cream px-2 py-1 text-xs text-onyx focus:border-cocoa focus:outline-none"
          >
            {exampleOrder.map((id) => (
              <option key={id} value={id}>
                {dict.examples[id]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`${buttonClass} ml-auto`}
            disabled={blocked || isRunning}
            onClick={handleRun}
          >
            {isRunning ? dict.running : dict.run}
          </button>
        </div>
        {blocked ? (
          <div className="border-x border-stone bg-gold/10 px-3 py-2 text-xs text-cocoa">
            {dict.mockBanner}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-b-lg border border-stone bg-white">
          <Editor
            value={source}
            onChange={handleSourceChange}
            readOnly={blocked}
            height="360px"
          />
        </div>
      </div>
      <Results dict={dict.results} state={resultsState} />
    </div>
  );
}
