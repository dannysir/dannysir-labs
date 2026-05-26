'use client';

import type { LayoutNode } from '@dannysir/floating-components';

import { DataObjectIcon } from '@/components/site/icons';

interface TreeInspectorProps {
  tree: LayoutNode;
  title: string;
}

export function TreeInspector({
  tree,
  title,
}: TreeInspectorProps): React.ReactElement {
  const serialized = JSON.stringify(tree, null, 2);
  return (
    <aside className="glass-card flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-outline-variant/10 px-4 py-3 text-primary">
        <DataObjectIcon className="h-4 w-4" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <pre className="max-h-[280px] overflow-auto bg-surface-lowest/60 px-4 py-3 font-mono text-[11px] leading-relaxed text-tertiary">
        {serialized}
      </pre>
    </aside>
  );
}
