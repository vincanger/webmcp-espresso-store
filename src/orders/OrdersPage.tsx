import { Link } from "react-router";
import { getMyGear, useQuery } from "wasp/client/operations";
import { formatEur, timeAgo } from "../shared/format";

export function OrdersPage() {
  const { data, isLoading, error } = useQuery(getMyGear);

  if (isLoading) return <p className="text-stone-500">Loading orders…</p>;
  if (error) return <p className="text-red-600">{String(error)}</p>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Your orders</h1>
      {!data?.orders.length && (
        <p className="text-stone-500">No orders yet.</p>
      )}
      <div className="space-y-6">
        {data?.orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-semibold">
                Order #{order.id}{" "}
                <span className="font-normal text-stone-500">
                  · {timeAgo(order.placedAt)}
                </span>
              </h2>
              <span className="font-semibold">
                {formatEur(order.totalCents)}
              </span>
            </div>
            <ul className="space-y-1">
              {order.items.map((item) => (
                <li key={item.slug} className="flex justify-between text-sm">
                  <Link
                    to={`/product/${item.slug}`}
                    className="hover:underline"
                  >
                    {item.name}
                    {item.color ? ` (${item.color})` : ""}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </Link>
                  <span className="text-stone-500">
                    {formatEur(item.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
