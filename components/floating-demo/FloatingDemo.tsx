'use client';

import { TreeLayout, useLayoutTree } from '@dannysir/floating-components';
import type { LayoutNode } from '@dannysir/floating-components';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import { DemoPanel } from './DemoPanel';
import { SelectionContext } from './SelectionContext';
import { Toolbar } from './Toolbar';
import { TreeInspector } from './TreeInspector';

interface FloatingDemoProps {
  dict: Dictionary['floating'];
}

const formatLabel = (template: string, id: string): string =>
  template.replace('{{id}}', id);

const buildInitialTree = (panelLabelTemplate: string): LayoutNode => ({
  type: 'split',
  direction: 'horizontal',
  size: 1,
  children: [
    {
      type: 'panel',
      id: 'a',
      size: 1,
      component: (
        <DemoPanel id="a" label={formatLabel(panelLabelTemplate, 'a')} />
      ),
    },
    {
      type: 'split',
      direction: 'vertical',
      size: 2,
      children: [
        {
          type: 'panel',
          id: 'b',
          size: 1,
          component: (
            <DemoPanel id="b" label={formatLabel(panelLabelTemplate, 'b')} />
          ),
        },
        {
          type: 'panel',
          id: 'c',
          size: 1,
          component: (
            <DemoPanel id="c" label={formatLabel(panelLabelTemplate, 'c')} />
          ),
        },
      ],
    },
  ],
});

export function FloatingDemo({ dict }: FloatingDemoProps): React.ReactElement {
  const initialTree = useMemo(
    () => buildInitialTree(dict.panelLabel),
    [dict.panelLabel],
  );
  const {
    tree,
    setTree,
    resizeBorder,
    movePanel,
    splitPanel,
    insertPanel,
    panelIds,
  } = useLayoutTree(initialTree);

  const [selectedId, setSelectedIdRaw] = useState<string | null>('a');
  const counterRef = useRef(0);

  const setSelectedId = useCallback((id: string) => {
    setSelectedIdRaw(id);
  }, []);

  const nextId = useCallback((): string => {
    counterRef.current += 1;
    let candidate = `n${counterRef.current}`;
    while (panelIds.includes(candidate)) {
      counterRef.current += 1;
      candidate = `n${counterRef.current}`;
    }
    return candidate;
  }, [panelIds]);

  const makeContent = useCallback(
    (id: string) => (
      <DemoPanel id={id} label={formatLabel(dict.panelLabel, id)} />
    ),
    [dict.panelLabel],
  );

  const handleSplitH = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    splitPanel(selectedId, 'horizontal', {
      newPanel: { id, component: makeContent(id) },
    });
    setSelectedIdRaw(id);
  }, [selectedId, splitPanel, nextId, makeContent]);

  const handleSplitV = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    splitPanel(selectedId, 'vertical', {
      newPanel: { id, component: makeContent(id) },
    });
    setSelectedIdRaw(id);
  }, [selectedId, splitPanel, nextId, makeContent]);

  const handleAddPanel = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    insertPanel({
      panel: { id, component: makeContent(id) },
      at: { anchorId: selectedId, position: 'right' },
    });
    setSelectedIdRaw(id);
  }, [selectedId, insertPanel, nextId, makeContent]);

  const handleReset = useCallback(() => {
    counterRef.current = 0;
    setTree(initialTree);
    setSelectedIdRaw('a');
  }, [setTree, initialTree]);

  const selectionValue = useMemo(
    () => ({ selectedId, setSelectedId }),
    [selectedId, setSelectedId],
  );

  return (
    <SelectionContext.Provider value={selectionValue}>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col">
          <Toolbar
            selectedId={selectedId}
            dict={dict.toolbar}
            onSplitH={handleSplitH}
            onSplitV={handleSplitV}
            onAddPanel={handleAddPanel}
            onReset={handleReset}
          />
          <div className="h-[480px] overflow-hidden rounded-b-lg border border-outline-variant/30">
            <TreeLayout
              tree={tree}
              onResizeBorder={resizeBorder}
              onMovePanel={movePanel}
              dragHandleSelector="[data-drag-handle]"
              backgroundColor="#060e20"
              padding={4}
              resizerColor="#3c494c"
              resizerHoverColor="#8aebff"
            />
          </div>
        </div>
        <TreeInspector tree={tree} title={dict.inspector.title} />
      </div>
    </SelectionContext.Provider>
  );
}
