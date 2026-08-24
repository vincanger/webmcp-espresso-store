import { Link } from "react-router";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CompareToggle } from "../compare/CompareToggle";
import { CATEGORY_LABELS, formatEur } from "../shared/format";

type CardProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  shortBlurb: string;
  imageUrl: string;
};

export function ProductCard({ product }: { product: CardProduct }) {
  return (
    <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="flex-1">
       
        <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-semibold leading-snug">{product.name}</h3>
          <div className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </div>
        </div>
   
        <img
          src={product.imageUrl}
          alt=""
          className="my-4 h-36 w-full rounded-lg bg-stone-100 object-contain py-6"
        />
        {/* <p className="my-2 line-clamp-1 text-sm text-stone-500">
          {product.shortBlurb}
        </p> */}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-lg text-stone-700 font-semibold">{formatEur(product.priceCents)}</span>
        <span className="flex items-center gap-2">
          <CompareToggle slug={product.slug} />
          <AddToCartButton slug={product.slug} compact />
        </span>
      </div>
    </div>
  );
}
