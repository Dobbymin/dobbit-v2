import { create } from "zustand";
import { combine } from "zustand/middleware";

const initialState = { isOpen: true };

export const useSidebarStore = create(
  combine(initialState, (set) => ({
    setOpen: (isOpen: boolean) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  })),
);
