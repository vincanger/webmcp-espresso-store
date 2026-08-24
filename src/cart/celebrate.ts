import { useCartUiStore } from "./cartUiStore";

// Called after a successful checkout (drawer button or WebMCP tool alike):
// shows the "Order #N placed" banner and fires confetti. Confetti is
// lazy-loaded and skipped when the user prefers reduced motion.
export async function celebrateOrder(order: {
  orderId: number;
  totalCents: number;
}): Promise<void> {
  useCartUiStore.getState().setOrderPlaced(order);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { default: confetti } = await import("canvas-confetti");
  confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
  setTimeout(
    () => confetti({ particleCount: 80, spread: 100, origin: { y: 0.4 } }),
    250,
  );
}
