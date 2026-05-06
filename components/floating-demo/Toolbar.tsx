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
    'rounded-md border border-stone bg-cream px-3 py-1.5 text-xs font-medium text-cocoa transition hover:border-cocoa hover:text-onyx disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-stone bg-cream/60 px-3 py-2">
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
      <span className="ml-auto text-xs text-olive">
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
