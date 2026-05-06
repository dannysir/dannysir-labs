'use client';

import type { LayoutNode } from '@dannysir/floating-components';

interface TreeInspectorProps {
  tree: LayoutNode;
  title: string;
}

interface SerializableNode {
  type: 'panel' | 'split';
  id?: string;
  direction?: 'horizontal' | 'vertical';
  size: number;
  children?: SerializableNode[];
}

const stripComponents = (node: LayoutNode): SerializableNode => {
  if (node.type === 'panel') {
    return { type: 'panel', id: node.id, size: node.size };
  }
  return {
    type: 'split',
    direction: node.direction,
    size: node.size,
    children: node.children.map(stripComponents),
  };
};

export function TreeInspector({
  tree,
  title,
}: TreeInspectorProps): React.ReactElement {
  const serialized = JSON.stringify(stripComponents(tree), null, 2);
  return (
    <aside className="flex flex-col rounded-lg border border-stone bg-cream/40">
      <div className="border-b border-stone px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cocoa">
        {title}
      </div>
      <pre className="max-h-[480px] overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-onyx">
        {serialized}
      </pre>
    </aside>
  );
}
