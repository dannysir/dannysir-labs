'use client';

import { createContext } from 'react';

export interface SelectionContextValue {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
}

export const SelectionContext = createContext<SelectionContextValue>({
  selectedId: null,
  setSelectedId: () => {},
});
