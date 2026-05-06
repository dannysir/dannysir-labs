'use client';

import { useContext } from 'react';

import { SelectionContext } from './SelectionContext';

const PANEL_PALETTE = [
  { bg: '#FFFFEA', fg: '#261D12', accent: '#BF9A54' },
  { bg: '#CBBDA0', fg: '#261D12', accent: '#4D3A25' },
  { bg: '#A1A680', fg: '#FFFFEA', accent: '#31401A' },
  { bg: '#656643', fg: '#FFFFEA', accent: '#BF9A54' },
  { bg: '#31401A', fg: '#FFFFEA', accent: '#A1A680' },
  { bg: '#4D3A25', fg: '#FFFFEA', accent: '#BF9A54' },
];

const colorForId = (id: string): { bg: string; fg: string; accent: string } => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PANEL_PALETTE[hash % PANEL_PALETTE.length];
};

interface DemoPanelProps {
  id: string;
  label: string;
}

export function DemoPanel({ id, label }: DemoPanelProps): React.ReactElement {
  const { selectedId, setSelectedId } = useContext(SelectionContext);
  const color = colorForId(id);
  const isSelected = selectedId === id;
  return (
    <button
      type="button"
      onClick={() => setSelectedId(id)}
      className={[
        'flex h-full w-full min-w-1/2 cursor-pointer flex-col items-stretch border-0 p-0 text-left outline-none',
        isSelected ? 'shadow-[inset_0_0_0_2px_var(--color-gold)]' : '',
      ].join(' ')}
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: color.accent,
          color: color.bg,
        }}
        data-drag-handle
      >
        <span>{label}</span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px]"
          style={{
            backgroundColor: color.bg,
            color: color.accent,
            visibility: isSelected ? 'visible' : 'hidden',
          }}
        >
          ●
        </span>
      </div>
      <div className="flex-1 px-3 py-2 text-xs leading-relaxed">
        <p className="font-mono opacity-80">id: {id}</p>
      </div>
    </button>
  );
}
