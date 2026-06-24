'use client';

import type { SplitDirection } from '@dannysir/floating-components';

import { RefreshIcon, SplitSquareIcon } from '@/components/site/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import type { PanelConstraints } from './treeConstraints';

interface ToolbarProps {
  selectedId: string | null;
  dict: Dictionary['floating']['toolbar'];
  constraintsDict: Dictionary['floating']['constraints'];
  liveCanvasLabel: string;
  parentDirection: SplitDirection | undefined;
  constraints: PanelConstraints;
  overflowOn: boolean;
  onSplitH: () => void;
  onSplitV: () => void;
  onAddPanel: () => void;
  onReset: () => void;
  onSetConstraint: (field: keyof PanelConstraints, value: number | undefined) => void;
  onClearConstraints: () => void;
  onPreset: () => void;
  onToggleOverflow: () => void;
}

const formatHint = (template: string, id: string): string =>
  template.replace('{{id}}', id);

const parseConstraint = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
};

const actionClass =
  'flex items-center gap-1.5 rounded-md border border-outline-variant/40 bg-surface-high/60 px-2.5 py-1.5 font-mono text-xs font-medium text-on-surface-variant transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

const toggleActiveClass =
  'flex items-center gap-1.5 rounded-md border border-primary/60 bg-primary/10 px-2.5 py-1.5 font-mono text-xs font-medium text-primary transition disabled:cursor-not-allowed disabled:opacity-40';

const inputClass =
  'w-16 rounded-md border border-outline-variant/40 bg-surface-high/60 px-2 py-1 font-mono text-xs text-on-surface focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40';

export function Toolbar({
  selectedId,
  dict,
  constraintsDict,
  liveCanvasLabel,
  parentDirection,
  constraints,
  overflowOn,
  onSplitH,
  onSplitV,
  onAddPanel,
  onReset,
  onSetConstraint,
  onClearConstraints,
  onPreset,
  onToggleOverflow,
}: ToolbarProps): React.ReactElement {
  const hasSelection = selectedId !== null;
  const isHorizontal = parentDirection === 'horizontal';
  const isVertical = parentDirection === 'vertical';
  const constrainable = hasSelection && (isHorizontal || isVertical);
  const minField: keyof PanelConstraints = isHorizontal ? 'minWidth' : 'minHeight';
  const maxField: keyof PanelConstraints = isHorizontal ? 'maxWidth' : 'maxHeight';
  const minValue = constrainable ? constraints[minField] : undefined;
  const maxValue = constrainable ? constraints[maxField] : undefined;

  let axisLabel = constraintsDict.axisNone;
  if (isHorizontal) axisLabel = constraintsDict.axisWidth;
  else if (isVertical) axisLabel = constraintsDict.axisHeight;

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
      <div className="flex items-center gap-1.5">
        <span
          className="rounded-full border border-outline-variant/20 bg-surface-lowest/60 px-2 py-1 font-mono text-[11px] text-on-surface-variant/70"
          title={constraintsDict.hint}
          aria-label={constraintsDict.hint}
        >
          {constraintsDict.label} · {axisLabel}
        </span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className={inputClass}
          placeholder={constraintsDict.min}
          aria-label={constraintsDict.min}
          value={minValue ?? ''}
          disabled={!constrainable}
          onChange={(event) =>
            onSetConstraint(minField, parseConstraint(event.target.value))}
        />
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className={inputClass}
          placeholder={constraintsDict.max}
          aria-label={constraintsDict.max}
          value={maxValue ?? ''}
          disabled={!constrainable}
          onChange={(event) =>
            onSetConstraint(maxField, parseConstraint(event.target.value))}
        />
        <button
          type="button"
          className={actionClass}
          disabled={!constrainable}
          onClick={onPreset}
        >
          {constraintsDict.preset}
        </button>
        <button
          type="button"
          className={actionClass}
          disabled={!constrainable}
          onClick={onClearConstraints}
        >
          {constraintsDict.clear}
        </button>
        <button
          type="button"
          className={overflowOn ? toggleActiveClass : actionClass}
          disabled={!hasSelection}
          onClick={onToggleOverflow}
        >
          {constraintsDict.overflowToggle}
        </button>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span
          className="flex items-center font-mono text-xs text-secondary"
          title={liveCanvasLabel}
          aria-label={liveCanvasLabel}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
        </span>
        <button type="button" className={actionClass} onClick={onReset}>
          <RefreshIcon className="h-3.5 w-3.5" />
          {dict.reset}
        </button>
      </div>
    </div>
  );
}
