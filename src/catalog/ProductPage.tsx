import { Fragment } from "react";
import { useParams } from "react-router";
import { useAuth } from "wasp/client/auth";
import {
  checkCompatibility,
  getProduct,
  useQuery,
} from "wasp/client/operations";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CompareToggle } from "../compare/CompareToggle";
import { CATEGORY_LABELS, formatEur } from "../shared/format";
import { MACHINE_SPEC_KEYS } from "../shared/machineSpecKeys";

type SpecEntry = { label: string; value: string; unit?: string; group: string };

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: user } = useAuth();
  const { data: product, isLoading, error } = useQuery(
    getProduct,
    { slug: slug! },
    { enabled: !!slug },
  );

  if (isLoading) return <p className="text-stone-500">Loading…</p>;
  if (error) return <p className="text-red-600">{String(error)}</p>;
  if (!product) return null;

  const specs = (product.specs ?? {}) as Record<string, SpecEntry>;
  // Machines render in canonical key order; other products in stored order.
  const orderedKeys =
    product.category === "MACHINE"
      ? MACHINE_SPEC_KEYS.map((k) => k.key).filter((k) => specs[k])
      : Object.keys(specs);

  const groups: Array<[string, string[]]> = [];
  for (const key of orderedKeys) {
    const group = specs[key].group;
    const last = groups[groups.length - 1];
    if (last && last[0] === group) last[1].push(key);
    else groups.push([group, [key]]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex gap-6">
        <img
          src={product.imageUrl}
          alt=""
          className="h-40 w-40 shrink-0 rounded-xl bg-stone-100 object-contain p-4"
        />
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-stone-500">{product.shortBlurb}</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-2xl font-bold">
              {formatEur(product.priceCents)}
            </span>
            <CompareToggle slug={product.slug} />
            <AddToCartButton slug={product.slug} />
          </div>
          {product.colorOptions.length > 0 && (
            <p className="mt-2 text-sm text-stone-500">
              Colors: {product.colorOptions.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* {user && <GearFitPanel slug={product.slug} />} */}

      <h2 className="mb-3 text-xl font-semibold">Specifications</h2>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <tbody>
            {groups.map(([group, keys]) => (
              <Fragment key={group}>
                <tr className="bg-stone-100">
                  <th
                    colSpan={2}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500"
                  >
                    {group}
                  </th>
                </tr>
                {keys.map((key) => (
                  <tr key={key} className="border-t border-stone-100">
                    <td className="w-1/2 px-4 py-2 text-stone-500">
                      {specs[key].label}
                    </td>
                    <td className="px-4 py-2">{specs[key].value}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {product.sourceUrl && (
        <p className="mt-4 text-sm text-stone-500">
          Spec source:{" "}
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline"
          >
            {new URL(product.sourceUrl).hostname}
          </a>{" "}
          <span className="text-stone-400">
            (prices approximate, Aug 2026)
          </span>
        </p>
      )}
    </div>
  );
}

function GearFitPanel({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery(checkCompatibility, {
    candidateSlug: slug,
  });

  if (isLoading || !data) return null;
  const relevant = data.items.filter((i) => i.status !== "NOT_APPLICABLE");
  if (relevant.length === 0) return null;

  const tone =
    data.overall === "INCOMPATIBLE"
      ? "border-red-200 bg-red-50"
      : data.overall === "UNKNOWN"
        ? "border-amber-200 bg-amber-50"
        : "border-green-200 bg-green-50";

  return (
    <div className={`mb-8 rounded-xl border p-4 ${tone}`}>
      <h2 className="mb-2 font-semibold">Works with your gear?</h2>
      <ul className="space-y-1 text-sm">
        {relevant.map((item) => (
          <li key={item.ownedSlug}>
            {item.status === "COMPATIBLE" && "✓"}
            {item.status === "INCOMPATIBLE" && "✗"}
            {item.status === "UNKNOWN" && "?"} <b>{item.ownedName}</b> —{" "}
            {item.reason}
          </li>
        ))}
      </ul>
      {data.suggestedFixes.length > 0 && (
        <p className="mt-2 text-sm">
          Fix:{" "}
          {data.suggestedFixes
            .map((f) => `${f.name} (${formatEur(f.priceCents)})`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
