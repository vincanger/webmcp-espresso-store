import { useAuth } from "wasp/client/auth";
import {
  getCompareList,
  setCompareList,
  useQuery,
} from "wasp/client/operations";

export function CompareToggle({ slug }: { slug: string }) {
  const { data: user } = useAuth();
  const { data: list } = useQuery(getCompareList, undefined, {
    enabled: !!user,
  });

  if (!user) return null;

  const slugs = (list ?? []).map((p) => p.slug);
  const inList = slugs.includes(slug);
  const full = !inList && slugs.length >= 3;

  const toggle = async () => {
    const next = inList ? slugs.filter((s) => s !== slug) : [...slugs, slug];
    await setCompareList({ slugs: next });
  };

  return (
    <button
      onClick={toggle}
      disabled={full}
      title={full ? "Compare list is full (3 max)" : undefined}
      className={
        "rounded-lg border px-2.5 py-1 text-sm transition " +
        (inList
          ? "border-amber-600 bg-amber-50 text-amber-800"
          : "border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-40")
      }
    >
      {inList ? "✓ Comparing" : "+ Compare"}
    </button>
  );
}
