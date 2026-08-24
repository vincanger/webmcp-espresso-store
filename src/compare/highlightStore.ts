import { create } from "zustand";

type HighlightState = {
  keys: string[];
  note: string | null;
  set: (keys: string[], note?: string | null) => void;
  clear: () => void;
};

export const useHighlightStore = create<HighlightState>((set) => ({
  keys: [],
  note: null,
  set: (keys, note = null) => set({ keys, note }),
  clear: () => set({ keys: [], note: null }),
}));
