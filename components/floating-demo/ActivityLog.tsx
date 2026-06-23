'use client';

import { HistoryIcon } from '@/components/site/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export type LogKind =
  | 'init'
  | 'split'
  | 'add'
  | 'move'
  | 'resize'
  | 'reset'
  | 'close'
  | 'constraint';

export interface LogEntry {
  id: number;
  time: string;
  kind: LogKind;
  message: string;
}

const KIND_LABEL: Record<LogKind, string> = {
  init: 'INIT',
  split: 'SPLIT',
  add: 'ADD',
  move: 'MOVE',
  resize: 'RESIZE',
  reset: 'RESET',
  close: 'CLOSE',
  constraint: 'LIMIT',
};

const KIND_COLOR: Record<LogKind, string> = {
  init: 'text-primary',
  split: 'text-primary',
  add: 'text-tertiary',
  move: 'text-secondary',
  resize: 'text-tertiary',
  reset: 'text-secondary',
  close: 'text-error',
  constraint: 'text-tertiary',
};

interface ActivityLogProps {
  entries: LogEntry[];
  dict: Dictionary['floating']['activityLog'];
  onClear: () => void;
}

export function ActivityLog({
  entries,
  dict,
  onClear,
}: ActivityLogProps): React.ReactElement {
  return (
    <div className="glass-card flex h-[260px] flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3">
        <div className="flex items-center gap-2 text-secondary">
          <HistoryIcon className="h-4 w-4" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">
            {dict.title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className="font-mono text-xs text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
        >
          {dict.clear}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {entries.length === 0 ? (
          <p className="px-1 font-mono text-xs leading-relaxed text-on-surface-variant/60">
            {dict.empty}
          </p>
        ) : (
          <ul className="space-y-0.5 font-mono text-xs">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-surface-high/40"
              >
                <span className="text-on-surface-variant/40" suppressHydrationWarning>
                  {entry.time}
                </span>
                <span className={`font-semibold ${KIND_COLOR[entry.kind]}`}>
                  {KIND_LABEL[entry.kind]}
                </span>
                <span className="text-on-surface">{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
