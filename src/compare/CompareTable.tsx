import { Fragment } from "react";
import { Link } from "react-router";
import {
  checkCompatibility,
  useQuery,
} from "wasp/client/operations";
import { AddToCartButton } from "../cart/AddToCartButton";
import { formatEur } from "../shared/format";
import { useHighlightStore } from "./highlightStore";

type Row = {
  key: string;
  label: string;
  group: string;
  values: string[];
  differs: boolean;
};

type Product = {
  slug: string;
  name: string;
  brand: string;
  priceCents: number;
  imageUrl: string;
};

export function CompareTable({
  products,
  rows,
  loggedIn,
}: {
  products: Product[];
  rows: Row[];
  loggedIn: boolean;
}) {
  const { keys: highlightKeys, note, clear } = useHighlightStore();
  const highlighting = highlightKeys.length > 0;

  const groups: Array<[string, Row[]]> = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last[0] === row.group) last[1].push(row);
    else groups.push([row.group, [row]]);
  }

  return (
    <div>
      {note && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-amber-900">
            <span className="mr-2">🤖</span>
            {note}
          </p>
          <button
            onClick={clear}
            className="rounded-lg border border-amber-300 px-3 py-1 text-sm text-amber-800 hover:bg-amber-100"
          >
            Clear highlights
          </button>
        </div>
      )}
      {highlighting && !note && (
        <div className="mb-4 text-right">
          <button
            onClick={clear}
            className="rounded-lg border border-stone-300 px-3 py-1 text-sm text-stone-600 hover:bg-stone-100"
          >
            Clear highlights
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-base">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="w-56 px-4 py-3" />
              {products.map((p) => (
                <th key={p.slug} className="px-4 py-3 align-top">
                  <Link to={`/product/${p.slug}`} className="hover:underline">
                    <div className="font-bold leading-snug">{p.name}</div>
                  </Link>
                  <div className="text-sm font-normal text-stone-500">
                    {formatEur(p.priceCents)}
                  </div>
                  {loggedIn && <FitBadge slug={p.slug} />}
                  <div className="mt-2">
                    <AddToCartButton slug={p.slug} compact />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([group, groupRows]) => {
              const visibleWhenHighlighting = groupRows.some((r) =>
                highlightKeys.includes(r.key),
              );
              return (
                <Fragment key={group}>
                  <tr
                    className="bg-stone-100 transition-all duration-[250ms] motion-reduce:transition-none"
                    style={
                      highlighting && !visibleWhenHighlighting
                        ? { opacity: 0.35 }
                        : undefined
                    }
                  >
                    <th
                      colSpan={products.length + 1}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      {group}
                    </th>
                  </tr>
                  {groupRows.map((row) => {
                    const highlighted = highlightKeys.includes(row.key);
                    const dimmed = highlighting && !highlighted;
                    return (
                      <tr
                        key={row.key}
                        data-spec-key={row.key}
                        className={
                          "border-t border-stone-100 transition-all duration-[250ms] motion-reduce:transition-none " +
                          (highlighted ? "bg-amber-50" : "")
                        }
                        style={{
                          opacity: dimmed ? 0.4 : 1,
                          fontSize: dimmed ? "0.8rem" : undefined,
                          boxShadow: highlighted
                            ? "inset 2px 0 0 0 var(--color-amber-600, #d97706)"
                            : undefined,
                        }}
                      >
                        <td
                          className={
                            "px-4 text-stone-500 transition-all duration-[250ms] motion-reduce:transition-none " +
                            (dimmed ? "py-1" : "py-2.5")
                          }
                        >
                          {row.label}
                          {row.differs && (
                            <span
                              className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle"
                              title="Values differ"
                            />
                          )}
                        </td>
                        {row.values.map((value, i) => (
                          <td
                            key={i}
                            className={
                              "px-4 transition-all duration-[250ms] motion-reduce:transition-none " +
                              (dimmed ? "py-1" : "py-2.5") +
                              (highlighted ? " font-bold" : "")
                            }
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FitBadge({ slug }: { slug: string }) {
  const { data } = useQuery(checkCompatibility, { candidateSlug: slug });
  if (!data) return null;

  const problems = data.items.filter((i) => i.status === "INCOMPATIBLE");
  const unknowns = data.items.filter((i) => i.status === "UNKNOWN");

  let text: string;
  let tone: string;
  if (problems.length > 0) {
    text = `⚠ ${problems.length} item${problems.length > 1 ? "s" : ""} won't fit`;
    tone = "bg-red-100 text-red-800";
  } else if (unknowns.length > 0) {
    text = "? Check fit";
    tone = "bg-amber-100 text-amber-800";
  } else {
    text = "✓ Fits all your gear";
    tone = "bg-green-100 text-green-800";
  }

  const tooltip = [...problems, ...unknowns]
    .map((i) => `${i.ownedName}: ${i.reason}`)
    .join("\n");

  return (
    <span
      title={tooltip || "Compatible with everything you own."}
      className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {text}
    </span>
  );
}
