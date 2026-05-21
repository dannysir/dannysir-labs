'use client';

import { RefreshIcon, SplitSquareIcon } from '@/components/site/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface ToolbarProps {
  selectedId: string | null;
  dict: Dictionary['floating']['toolbar'];
  liveCanvasLabel: string;
  onSplitH: () => void;
  onSplitV: () => void;
  onAddPanel: () => void;
  onReset: () => void;
}

const formatHint = (template: string, id: string): string =>
  template.replace('{{id}}', id);

const actionClass =
  'flex items-center gap-1.5 rounded-md border border-outline-variant/40 bg-surface-high/60 px-2.5 py-1.5 font-mono text-xs font-medium text-on-surface-variant transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

export function Toolbar({
  selectedId,
  dict,
  liveCanvasLabel,
  onSplitH,
  onSplitV,
  onAddPanel,
  onReset,
}: ToolbarProps): React.ReactElement {
  const hasSelection = selectedId !== null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/10 bg-surface/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={actionClass}
          disabled={!hasSelection}
          onClick={onSplitH}
        >
          <SplitSquareIcon className="h-3.5 w-3.5" />
          {dict.splitH}
        </button>
        <button
          type="button"
          className={actionClass}
          disabled={!hasSelection}
          onClick={onSplitV}
        >
          <SplitSquareIcon className="h-3.5 w-3.5 rotate-90" />
          {dict.splitV}
        </button>
        <button
          type="button"
          className={actionClass}
          disabled={!hasSelection}
          onClick={onAddPanel}
        >
          <span className="text-sm leading-none">+</span>
          {dict.addPanel}
        </button>
      </div>
      <span className="rounded-full border border-outline-variant/20 bg-surface-lowest/60 px-2.5 py-1 font-mono text-xs text-on-surface-variant/80">
        {hasSelection
          ? formatHint(dict.selectedHint, selectedId)
          : dict.noSelection}
      </span>
      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
          {liveCanvasLabel}
        </span>
        <button type="button" className={actionClass} onClick={onReset}>
          <RefreshIcon className="h-3.5 w-3.5" />
          {dict.reset}
        </button>
      </div>
    </div>
  );
}
