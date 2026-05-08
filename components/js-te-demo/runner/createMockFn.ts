export interface MockFn {
  (...args: unknown[]): unknown;
  mock: { calls: unknown[][] };
  mockImplementation: (impl: (...args: unknown[]) => unknown) => MockFn;
  mockReturnValue: (value: unknown) => MockFn;
  mockReturnValueOnce: (...values: unknown[]) => MockFn;
  mockClear: () => MockFn;
}

interface MockState {
  curImplement: (...args: unknown[]) => unknown;
  returnQueue: unknown[];
  calls: unknown[][];
}

const allMockStates: MockState[] = [];

export const createMockFn = (implementation: (...args: unknown[]) => unknown = () => null): MockFn => {
  const state: MockState = {
    curImplement: implementation,
    returnQueue: [],
    calls: [],
  };
  allMockStates.push(state);

  const mockFn = ((...args: unknown[]): unknown => {
    state.calls.push(args);
    if (state.returnQueue.length > 0) {
      return state.returnQueue.shift();
    }
    return state.curImplement(...args);
  }) as MockFn;

  mockFn.mock = { calls: state.calls };

  mockFn.mockImplementation = (impl) => {
    state.curImplement = impl;
    return mockFn;
  };

  mockFn.mockReturnValue = (value) => {
    state.curImplement = () => value;
    return mockFn;
  };

  mockFn.mockReturnValueOnce = (...values) => {
    state.returnQueue.push(...values);
    return mockFn;
  };

  mockFn.mockClear = () => {
    state.returnQueue = [];
    state.curImplement = () => null;
    state.calls.length = 0;
    return mockFn;
  };

  return mockFn;
};

export const clearAllMocks = (): void => {
  for (const state of allMockStates) {
    state.returnQueue = [];
    state.curImplement = () => null;
    state.calls.length = 0;
  }
};

export const resetMockRegistry = (): void => {
  allMockStates.length = 0;
};
