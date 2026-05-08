'use client';

import { useEffect, useState } from 'react';

import { runUserCode } from '@/components/js-te-demo/runner';
import type { RunResult } from '@/components/js-te-demo/runner';

interface Scenario {
  id: string;
  title: string;
  source: string;
}

const scenarios: Scenario[] = [
  {
    id: 'pass',
    title: '1. pass — describe / test / expect.toBe',
    source: `
describe('math', () => {
  test('add', () => {
    console.log('inside add');
    expect(1 + 2).toBe(3);
  });
});
`.trim(),
  },
  {
    id: 'fail',
    title: '2. fail — assertion mismatch',
    source: `
test('wrong sum', () => {
  expect(1 + 2).toBe(4);
});
`.trim(),
  },
  {
    id: 'throw',
    title: '3. throw — toThrow pass + toThrow fail',
    source: `
describe('toThrow', () => {
  test('catches matching error', () => {
    expect(() => { throw new Error('boom'); }).toThrow('boom');
  });
  test('fails when nothing throws', () => {
    expect(() => 42).toThrow();
  });
});
`.trim(),
  },
  {
    id: 'fn',
    title: '4. fn — mock helpers',
    source: `
test('fn tracks calls', () => {
  const f = fn();
  f(1, 2);
  f('hello');
  expect(f).toHaveBeenCalledTimes(2);
  expect(f).toHaveBeenCalledWith(1, 2);
});

test('mockReturnValue', () => {
  const f = fn().mockReturnValue(42);
  expect(f()).toBe(42);
});
`.trim(),
  },
  {
    id: 'each',
    title: '5. test.each — placeholder formatting',
    source: `
test.each([[1, 1, 2], [2, 3, 5]])('add(%s,%s)=%s', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
`.trim(),
  },
  {
    id: 'mock-detection',
    title: '6. node-only mock() detection (informational)',
    source: `
mock('./some-module', () => ({}));
test('still runs', () => {
  expect(true).toBe(true);
});
`.trim(),
  },
];

interface ScenarioState {
  result?: RunResult;
  error?: string;
}

const renderTree = (
  nodes: RunResult['tree'],
  depth = 0,
): React.ReactNode => nodes.map((node) => (
  <div key={node.id} style={{ paddingLeft: depth * 16 }}>
    <div
      style={{
        color: node.status === 'pass' ? '#1f7a1f' : '#b00020',
        fontWeight: node.type === 'describe' ? 600 : 400,
      }}
    >
      {node.type === 'describe' ? '▾' : node.status === 'pass' ? '✓' : '✗'}
      {' '}
      {node.name}
      {node.type === 'test' ? ` (${node.durationMs}ms)` : ''}
    </div>
    {node.type === 'test' && node.error ? (
      <div style={{ paddingLeft: 16, color: '#b00020', fontFamily: 'monospace', fontSize: 12 }}>
        {node.error.message}
      </div>
    ) : null}
    {node.type === 'test' && node.consoleLogs.length > 0 ? (
      <div style={{ paddingLeft: 16, color: '#555', fontFamily: 'monospace', fontSize: 12 }}>
        {node.consoleLogs.map((entry, i) => (
          <div key={`${node.id}-log-${i}`}>
            [{entry.level}] {entry.args.join(' ')}
          </div>
        ))}
      </div>
    ) : null}
    {node.type === 'describe' ? renderTree(node.children, depth + 1) : null}
  </div>
));

export function RunnerCheck() {
  const [states, setStates] = useState<Record<string, ScenarioState>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const scenario of scenarios) {
        try {
          const result = await runUserCode(scenario.source);
          if (cancelled) return;
          setStates((prev) => ({ ...prev, [scenario.id]: { result } }));
        } catch (err) {
          if (cancelled) return;
          setStates((prev) => ({
            ...prev,
            [scenario.id]: { error: err instanceof Error ? err.message : String(err) },
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Phase 4 — runner verification
      </h1>
      <p style={{ marginBottom: 24, color: '#555', fontSize: 14 }}>
        Temporary page. Will be removed at the end of Phase 5.
      </p>
      {scenarios.map((scenario) => {
        const state = states[scenario.id];
        return (
          <section
            key={scenario.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {scenario.title}
            </h2>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                marginBottom: 12,
              }}
            >
              {scenario.source}
            </pre>
            {!state ? (
              <div style={{ color: '#888' }}>running…</div>
            ) : state.error ? (
              <div style={{ color: '#b00020' }}>error: {state.error}</div>
            ) : state.result ? (
              <div>
                <div style={{ marginBottom: 8, fontSize: 14 }}>
                  passed: <strong>{state.result.passed}</strong>{' '}
                  · failed: <strong>{state.result.failed}</strong>{' '}
                  · usedNodeOnlyMock:{' '}
                  <strong>{String(state.result.usedNodeOnlyMock)}</strong>{' '}
                  · {state.result.durationMs}ms
                </div>
                {state.result.runtimeError ? (
                  <div style={{ color: '#b00020', fontFamily: 'monospace', fontSize: 12 }}>
                    runtime error: {state.result.runtimeError.message}
                  </div>
                ) : null}
                {renderTree(state.result.tree)}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
