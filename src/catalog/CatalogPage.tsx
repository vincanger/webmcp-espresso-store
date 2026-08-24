import { useState } from "react";
import { getProducts, useQuery } from "wasp/client/operations";
import { CATEGORY_LABELS } from "../shared/format";
import { ProductCard } from "./ProductCard";

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export function CatalogPage() {
  const [category, setCategory] = useState<string | null>(null);
  const { data: products, isLoading, error } = useQuery(getProducts, {
    ...(category ? { category } : {}),
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Espresso machines &amp; gear</h1>
      <p className="mb-6 text-stone-500">
        Real machines, researched specs — compare before you buy.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={!category} onClick={() => setCategory(null)}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      {isLoading && <p className="text-stone-500">Loading catalog…</p>}
      {error && <p className="text-red-600">{String(error)}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-sm transition " +
        (active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-300 bg-white text-stone-600 hover:bg-stone-100")
      }
    >
      {children}
    </button>
  );
}
