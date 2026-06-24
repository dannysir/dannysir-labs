'use client';

import {
  TreeLayout,
  useLayoutTree,
  createComponentStore,
  getPanelIds,
} from '@dannysir/floating-components';
import type { LayoutNode } from '@dannysir/floating-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import { ActivityLog, type LogEntry, type LogKind } from './ActivityLog';
import { DemoPanel } from './DemoPanel';
import { SelectionContext } from './SelectionContext';
import { Toolbar } from './Toolbar';
import { TreeInspector } from './TreeInspector';
import {
  applyPanelConstraints,
  getPanelConstraints,
  getParentSplitDirection,
  type PanelConstraints,
} from './treeConstraints';

interface FloatingDemoProps {
  dict: Dictionary['floating'];
}

const MAX_LOG_ENTRIES = 50;

const STORAGE_KEY = 'floating-demo:tree:v2';

const PRESET_MIN_PX = 160;
const PRESET_MAX_PX = 320;

const formatLabel = (template: string, id: string): string =>
  template.replace('{{id}}', id);

const formatConstraintEvent = (
  template: string,
  parts: { field: string; value: number | string; id: string },
): string =>
  template
    .replace('{{field}}', parts.field)
    .replace('{{value}}', String(parts.value))
    .replace('{{id}}', parts.id);

const nowTime = (): string => {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
};

const INITIAL_PANEL_IDS = ['a', 'b', 'c'] as const;

const buildInitialTree = (): LayoutNode => ({
  type: 'split',
  direction: 'horizontal',
  size: 1,
  children: [
    { type: 'panel', id: 'a', size: 1, componentKey: 'a' },
    {
      type: 'split',
      direction: 'vertical',
      size: 2,
      children: [
        { type: 'panel', id: 'b', size: 1, componentKey: 'b' },
        { type: 'panel', id: 'c', size: 1, componentKey: 'c' },
      ],
    },
  ],
});

export function FloatingDemo({ dict }: FloatingDemoProps): React.ReactElement {
  const initialTree = useMemo(() => buildInitialTree(), []);

  const store = useMemo(() => {
    const renderPanel = (id: string) => (
      <DemoPanel id={id} label={formatLabel(dict.panelLabel, id)} />
    );
    return createComponentStore(
      Object.fromEntries(INITIAL_PANEL_IDS.map((id) => [id, renderPanel(id)])),
    );
  }, [dict.panelLabel]);

  const {
    tree,
    setTree,
    resizeBorder,
    movePanel,
    splitPanel,
    insertPanel,
    removePanel,
    panelIds,
  } = useLayoutTree(initialTree);

  const [selectedId, setSelectedIdRaw] = useState<string | null>('a');
  const [overflowPanelId, setOverflowPanelId] = useState<string | null>(null);
  const counterRef = useRef(0);
  const logCounterRef = useRef(0);
  const events = dict.activityLog.events;

  const parentDir = useMemo(
    () => (selectedId ? getParentSplitDirection(tree, selectedId) : undefined),
    [tree, selectedId],
  );
  const currentConstraints = useMemo<PanelConstraints>(
    () => (selectedId ? getPanelConstraints(tree, selectedId) : {}),
    [tree, selectedId],
  );

  const makeEntry = useCallback(
    (kind: LogKind, message: string): LogEntry => {
      logCounterRef.current += 1;
      return { id: logCounterRef.current, time: nowTime(), kind, message };
    },
    [],
  );

  const [log, setLog] = useState<LogEntry[]>(() => [
    { id: 0, time: nowTime(), kind: 'init', message: events.init },
  ]);

  const pushLog = useCallback(
    (kind: LogKind, message: string): void => {
      setLog((prev) => {
        if (kind === 'resize' && prev[0]?.kind === 'resize') {
          return [makeEntry('resize', message), ...prev.slice(1)];
        }
        return [makeEntry(kind, message), ...prev].slice(0, MAX_LOG_ENTRIES);
      });
    },
    [makeEntry],
  );

  const clearLog = useCallback((): void => setLog([]), []);

  const setSelectedId = useCallback((id: string) => {
    setSelectedIdRaw(id);
  }, []);

  const handleResizeBorder = useCallback<typeof resizeBorder>(
    (...args) => {
      resizeBorder(...args);
      pushLog('resize', events.resize);
    },
    [resizeBorder, pushLog, events.resize],
  );

  const handleMovePanel = useCallback<typeof movePanel>(
    (...args) => {
      movePanel(...args);
      pushLog('move', events.move);
    },
    [movePanel, pushLog, events.move],
  );

  const nextId = useCallback((): string => {
    counterRef.current += 1;
    let candidate = `n${counterRef.current}`;
    while (panelIds.includes(candidate)) {
      counterRef.current += 1;
      candidate = `n${counterRef.current}`;
    }
    return candidate;
  }, [panelIds]);

  const registerPanel = useCallback(
    (id: string) => {
      store.register(
        id,
        <DemoPanel id={id} label={formatLabel(dict.panelLabel, id)} />,
      );
    },
    [store, dict.panelLabel],
  );

  const formatEvent = useCallback(
    (template: string, id: string): string => template.replace('{{id}}', id),
    [],
  );

  const [hydrated, setHydrated] = useState(false);

  // Restore the saved layout once on mount. Runs after the first render so the
  // server and initial client render both use the default tree (no hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const restored = JSON.parse(saved) as LayoutNode;
        getPanelIds(restored).forEach(registerPanel);
        setTree(restored);
        const ids = getPanelIds(restored);
        const maxN = Math.max(
          0,
          ...ids
            .map((id) => /^n(\d+)$/.exec(id)?.[1])
            .filter((n): n is string => n != null)
            .map(Number),
        );
        counterRef.current = maxN;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 사전 존재 위반, 별도 리팩토링 예정
        setSelectedIdRaw(ids[0] ?? null);
      }
    } catch {
      // Corrupt/incompatible saved data — fall back to the default tree.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  }, [tree, hydrated]);

  const handleSplitH = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    registerPanel(id);
    splitPanel(selectedId, 'horizontal', {
      newPanel: { id, componentKey: id },
    });
    setSelectedIdRaw(id);
    pushLog('split', formatEvent(events.split, id));
  }, [selectedId, splitPanel, nextId, registerPanel, pushLog, formatEvent, events.split]);

  const handleSplitV = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    registerPanel(id);
    splitPanel(selectedId, 'vertical', {
      newPanel: { id, componentKey: id },
    });
    setSelectedIdRaw(id);
    pushLog('split', formatEvent(events.split, id));
  }, [selectedId, splitPanel, nextId, registerPanel, pushLog, formatEvent, events.split]);

  const handleAddPanel = useCallback(() => {
    if (!selectedId) return;
    const id = nextId();
    registerPanel(id);
    insertPanel({
      panel: { id, componentKey: id },
      at: { anchorId: selectedId, position: 'right' },
    });
    setSelectedIdRaw(id);
    pushLog('add', formatEvent(events.add, id));
  }, [selectedId, insertPanel, nextId, registerPanel, pushLog, formatEvent, events.add]);

  const handleReset = useCallback(() => {
    counterRef.current = 0;
    setTree(initialTree);
    setSelectedIdRaw('a');
    if (overflowPanelId) {
      store.register(
        overflowPanelId,
        <DemoPanel
          id={overflowPanelId}
          label={formatLabel(dict.panelLabel, overflowPanelId)}
        />,
      );
      setOverflowPanelId(null);
    }
    pushLog('reset', events.reset);
  }, [
    setTree,
    initialTree,
    pushLog,
    events.reset,
    overflowPanelId,
    store,
    dict.panelLabel,
  ]);

  const handleSetConstraint = useCallback(
    (field: keyof PanelConstraints, value: number | undefined) => {
      if (!selectedId) return;
      setTree((prev) => {
        const next: PanelConstraints = {
          ...getPanelConstraints(prev, selectedId),
          [field]: value,
        };
        return applyPanelConstraints(prev, selectedId, next);
      });
      if (value !== undefined) {
        pushLog(
          'constraint',
          formatConstraintEvent(dict.constraints.events.set, {
            field,
            value,
            id: selectedId,
          }),
        );
      }
    },
    [selectedId, setTree, pushLog, dict.constraints.events.set],
  );

  const handleClearConstraints = useCallback(() => {
    if (!selectedId) return;
    setTree((prev) => applyPanelConstraints(prev, selectedId, {}));
    pushLog(
      'constraint',
      dict.constraints.events.clear.replace('{{id}}', selectedId),
    );
  }, [selectedId, setTree, pushLog, dict.constraints.events.clear]);

  const handlePreset = useCallback(() => {
    if (!selectedId) return;
    const dir = getParentSplitDirection(tree, selectedId);
    if (!dir) return;
    const next: PanelConstraints =
      dir === 'horizontal'
        ? { minWidth: PRESET_MIN_PX, maxWidth: PRESET_MAX_PX }
        : { minHeight: PRESET_MIN_PX, maxHeight: PRESET_MAX_PX };
    setTree((prev) => applyPanelConstraints(prev, selectedId, next));
    const minField = dir === 'horizontal' ? 'minWidth' : 'minHeight';
    const maxField = dir === 'horizontal' ? 'maxWidth' : 'maxHeight';
    pushLog(
      'constraint',
      formatConstraintEvent(dict.constraints.events.set, {
        field: minField,
        value: PRESET_MIN_PX,
        id: selectedId,
      }),
    );
    pushLog(
      'constraint',
      formatConstraintEvent(dict.constraints.events.set, {
        field: maxField,
        value: PRESET_MAX_PX,
        id: selectedId,
      }),
    );
  }, [selectedId, tree, setTree, pushLog, dict.constraints.events.set]);

  const handleToggleOverflow = useCallback(() => {
    if (!selectedId) return;
    const turningOn = overflowPanelId !== selectedId;
    if (overflowPanelId && overflowPanelId !== selectedId) {
      store.register(
        overflowPanelId,
        <DemoPanel
          id={overflowPanelId}
          label={formatLabel(dict.panelLabel, overflowPanelId)}
        />,
      );
    }
    store.register(
      selectedId,
      <DemoPanel
        id={selectedId}
        label={formatLabel(dict.panelLabel, selectedId)}
        showOverflowContent={turningOn}
      />,
    );
    setOverflowPanelId(turningOn ? selectedId : null);
  }, [selectedId, overflowPanelId, store, dict.panelLabel]);

  const handleClosePanel = useCallback(
    (id: string) => {
      removePanel(id);
      setSelectedIdRaw((prev) => {
        if (prev !== id) return prev;
        const remaining = panelIds.filter((pid) => pid !== id);
        return remaining[0] ?? null;
      });
      pushLog('close', formatEvent(events.close, id));
    },
    [removePanel, panelIds, pushLog, formatEvent, events.close],
  );

  const selectionValue = useMemo(
    () => ({
      selectedId,
      setSelectedId,
      closePanel: handleClosePanel,
      closable: panelIds.length > 1,
      closeLabel: dict.closePanel,
    }),
    [selectedId, setSelectedId, handleClosePanel, panelIds.length, dict.closePanel],
  );

  return (
    <SelectionContext.Provider value={selectionValue}>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="glass-card flex h-[600px] flex-col overflow-hidden rounded-xl">
          <Toolbar
            selectedId={selectedId}
            dict={dict.toolbar}
            constraintsDict={dict.constraints}
            liveCanvasLabel={dict.liveCanvas}
            parentDirection={parentDir}
            constraints={currentConstraints}
            overflowOn={overflowPanelId !== null && overflowPanelId === selectedId}
            onSplitH={handleSplitH}
            onSplitV={handleSplitV}
            onAddPanel={handleAddPanel}
            onReset={handleReset}
            onSetConstraint={handleSetConstraint}
            onClearConstraints={handleClearConstraints}
            onPreset={handlePreset}
            onToggleOverflow={handleToggleOverflow}
          />
          <div className="relative flex-1 overflow-hidden bg-surface-lowest bg-[radial-gradient(#222a3d_1px,transparent_1px)] [background-size:24px_24px]">
            <TreeLayout
              tree={tree}
              components={store}
              onResizeBorder={handleResizeBorder}
              onMovePanel={handleMovePanel}
              dragHandleSelector="[data-drag-handle]"
              backgroundColor="transparent"
              padding={4}
              resizerColor="#3c494c"
              resizerHoverColor="#8aebff"
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <TreeInspector tree={tree} title={dict.inspector.title} />
          <ActivityLog
            entries={log}
            dict={dict.activityLog}
            onClear={clearLog}
          />
        </div>
      </div>
    </SelectionContext.Provider>
  );
}
