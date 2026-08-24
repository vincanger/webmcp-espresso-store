import { useState } from "react";
import { useAuth } from "wasp/client/auth";
import { addToCart } from "wasp/client/operations";

export function AddToCartButton({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const { data: user } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const add = async () => {
    setBusy(true);
    try {
      await addToCart({ slug });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={add}
      disabled={busy}
      className={
        "rounded-lg bg-stone-100 text-white transition hover:bg-stone-200 disabled:opacity-50 " +
        (compact ? "px-2.5 py-1 text-sm" : "px-3 py-1.5 text-sm")
      }
    >
      🛒
    </button>
  );
}
