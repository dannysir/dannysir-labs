'use client';

import { useContext } from 'react';

import { CloseIcon } from '@/components/site/icons';

import { SelectionContext } from './SelectionContext';

const ACCENT_PALETTE = ['#22d3ee', '#ddb7ff', '#68f5b8', '#8aebff', '#a2eeff', '#4edea3'];

const accentForId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
};

interface DemoPanelProps {
  id: string;
  label: string;
  showOverflowContent?: boolean;
}

export function DemoPanel({
  id,
  label,
  showOverflowContent = false,
}: DemoPanelProps): React.ReactElement {
  const { selectedId, setSelectedId, closePanel, closable, closeLabel } =
    useContext(SelectionContext);
  const accent = accentForId(id);
  const isSelected = selectedId === id;

  const handleSelect = (): void => setSelectedId(id);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(id);
    }
  };
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    closePanel(id);
  };
  const stopDrag = (event: React.SyntheticEvent): void => event.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      data-drag-handle
      className={[
        'group flex h-full w-full cursor-grab flex-col items-stretch outline-none transition-shadow active:cursor-grabbing',
        isSelected ? 'shadow-[inset_0_0_0_2px_var(--color-primary)]' : '',
      ].join(' ')}
      style={{ backgroundColor: `${accent}0f` }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span
          className="font-mono text-xs tracking-wide opacity-70"
          style={{ color: accent }}
        >
          {`panel-${id}`}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full transition-opacity"
            style={{
              backgroundColor: accent,
              opacity: isSelected ? 1 : 0,
            }}
          />
          <svg
            className="h-4 w-4 cursor-grab text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-60"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="9" cy="6" r="1.6" />
            <circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" />
            <circle cx="15" cy="18" r="1.6" />
          </svg>
          {closable ? (
            <button
              type="button"
              onClick={handleClose}
              onMouseDown={stopDrag}
              onPointerDown={stopDrag}
              aria-label={closeLabel.replace('{{id}}', id)}
              className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-error/15 hover:text-error"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-3">
        <span className="text-lg font-semibold text-on-surface-variant">
          {label}
        </span>
        {showOverflowContent ? (
          <div
            className="flex h-[200px] w-[360px] shrink-0 items-center justify-center rounded-lg border border-dashed text-center font-mono text-xs"
            style={{
              borderColor: `${accent}66`,
              backgroundColor: `${accent}0f`,
              color: accent,
            }}
          >
            360 × 200
          </div>
        ) : null}
      </div>
    </div>
  );
}
