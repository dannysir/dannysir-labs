import { runUserCode } from './index';
import type { RunOptions, RunResult } from './types';

export interface WorkerRequest {
  id: number;
  source: string;
  options?: RunOptions;
}

export interface WorkerResponse {
  id: number;
  result: RunResult;
}

const ctx = self as unknown as Worker;

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, source, options } = event.data;
  const result = await runUserCode(source, options);
  const message: WorkerResponse = { id, result };
  ctx.postMessage(message);
};
