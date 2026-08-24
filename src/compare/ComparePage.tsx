import { Link, useSearchParams } from "react-router";
import { useAuth } from "wasp/client/auth";
import {
  compareProducts,
  getCompareList,
  useQuery,
} from "wasp/client/operations";
import { CompareTable } from "./CompareTable";

export function ComparePage() {
  const { data: user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: compareList, isLoading: listLoading } = useQuery(
    getCompareList,
    undefined,
    { enabled: !!user },
  );

  // Logged in → the user's saved compare list; logged out → ?slugs=a,b.
  const urlSlugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const slugs = user ? (compareList ?? []).map((p) => p.slug) : urlSlugs;

  const {
    data: comparison,
    isLoading: compareLoading,
    error,
  } = useQuery(
    compareProducts,
    { slugs },
    { enabled: slugs.length >= 2 && slugs.length <= 3 },
  );

  if (authLoading || (user && listLoading)) {
    return <p className="text-stone-500">Loading…</p>;
  }

  if (slugs.length < 2) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-bold">Compare</h1>
        <p className="text-stone-500">
          {user
            ? "Add 2–3 products to your compare list from the catalog."
            : "Pass ?slugs=a,b in the URL, or log in to use your compare list."}{" "}
          <Link to="/" className="underline">
            Browse the catalog
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Compare</h1>
      {compareLoading && <p className="text-stone-500">Loading comparison…</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      {comparison && (
        <CompareTable
          products={comparison.products}
          rows={comparison.rows}
          loggedIn={!!user}
        />
      )}
    </div>
  );
}
