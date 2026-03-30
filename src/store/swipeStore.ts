import { create } from 'zustand';

interface SwipeState {
  skippedIds: Set<string>;
  skip: (id: string) => void;
  hasSkipped: (id: string) => boolean;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  skippedIds: new Set(),
  skip: (id) => set((state) => ({ skippedIds: new Set([...state.skippedIds, id]) })),
  hasSkipped: (id) => get().skippedIds.has(id),
}));
