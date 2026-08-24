import { create } from "zustand";

type CartUiState = {
  open: boolean;
  orderPlaced: { orderId: number; totalCents: number } | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOrderPlaced: (order: { orderId: number; totalCents: number }) => void;
  dismissOrder: () => void;
};

export const useCartUiStore = create<CartUiState>((set) => ({
  open: false,
  orderPlaced: null,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  setOrderPlaced: (orderPlaced) => set({ orderPlaced }),
  dismissOrder: () => set({ orderPlaced: null }),
}));
