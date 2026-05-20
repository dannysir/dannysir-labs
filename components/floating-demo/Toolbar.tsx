'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';

interface ToolbarProps {
  selectedId: string | null;
  dict: Dictionary['floating']['toolbar'];
  onSplitH: () => void;
  onSplitV: () => void;
  onAddPanel: () => void;
  onReset: () => void;
}

const formatHint = (template: string, id: string): string =>
  template.replace('{{id}}', id);

export function Toolbar({
  selectedId,
  dict,
  onSplitH,
  onSplitV,
  onAddPanel,
  onReset,
}: ToolbarProps): React.ReactElement {
  const hasSelection = selectedId !== null;
  const buttonClass =
    'rounded-md border border-outline-variant/40 bg-surface-high px-3 py-1.5 font-mono text-xs font-medium text-on-surface-variant transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-outline-variant/30 bg-surface/60 px-3 py-2">
      <button
        type="button"
        className={buttonClass}
        disabled={!hasSelection}
        onClick={onSplitH}
      >
        {dict.splitH}
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={!hasSelection}
        onClick={onSplitV}
      >
        {dict.splitV}
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={!hasSelection}
        onClick={onAddPanel}
      >
        {dict.addPanel}
      </button>
      <span className="ml-auto font-mono text-xs text-on-surface-variant/70">
        {hasSelection
          ? formatHint(dict.selectedHint, selectedId)
          : dict.noSelection}
      </span>
      <button type="button" className={buttonClass} onClick={onReset}>
        {dict.reset}
      </button>
    </div>
  );
}
