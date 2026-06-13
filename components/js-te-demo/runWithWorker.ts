import { runUserCode } from './runner';
import type { RunResult } from './runner';
import type { WorkerRequest, WorkerResponse } from './runner/runner.worker';

export interface RunWithWorkerOptions {
  timeoutMs: number;
  signal?: AbortSignal;
}

export type RunWithWorkerOutcome =
  | { kind: 'result'; result: RunResult; noWorker?: boolean }
  | { kind: 'timeout' }
  | { kind: 'aborted' };

const buildWorker = (): Worker => new Worker(
  new URL('./runner/runner.worker.ts', import.meta.url),
  { type: 'module' },
);

export const runWithWorker = async (
  source: string,
  opts: RunWithWorkerOptions,
): Promise<RunWithWorkerOutcome> => {
  if (typeof Worker === 'undefined') {
    if (opts.signal?.aborted) return { kind: 'aborted' };
    const result = await runUserCode(source);
    if (opts.signal?.aborted) return { kind: 'aborted' };
    return { kind: 'result', result, noWorker: true };
  }

  if (opts.signal?.aborted) return { kind: 'aborted' };

  const worker = buildWorker();

  return new Promise<RunWithWorkerOutcome>((resolve) => {
    let settled = false;

    const finalize = (outcome: RunWithWorkerOutcome): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
      resolve(outcome);
    };

    const onAbort = (): void => finalize({ kind: 'aborted' });

    const timer = setTimeout(
      () => finalize({ kind: 'timeout' }),
      opts.timeoutMs,
    );

    opts.signal?.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      finalize({ kind: 'result', result: event.data.result });
    };

    worker.onerror = (event) => {
      finalize({
        kind: 'result',
        result: {
          tree: [],
          passed: 0,
          failed: 0,
          skipped: 0,
          todo: 0,
          usedNodeOnlyMock: false,
          runtimeError: { message: event.message || 'worker error' },
          durationMs: 0,
        },
      });
    };

    const request: WorkerRequest = { id: 1, source };
    worker.postMessage(request);
  });
};
