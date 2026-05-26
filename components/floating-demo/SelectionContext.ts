'use client';

import { createContext } from 'react';

export interface SelectionContextValue {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  closePanel: (id: string) => void;
  closable: boolean;
  closeLabel: string;
}

export const SelectionContext = createContext<SelectionContextValue>({
  selectedId: null,
  setSelectedId: () => {},
  closePanel: () => {},
  closable: false,
  closeLabel: '',
});
