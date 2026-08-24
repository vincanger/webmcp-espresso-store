// All WebMCP tool registrations, mounted once in the root component.
//
// IMPORTANT: `execute` functions must not close over React state
// (use-webmcp-tool doesn't re-register when `execute` changes). They read
// everything through Wasp operations, useHighlightStore.getState(), and the
// module-level navigateRef.
import { useWebMCP } from "use-webmcp-tool";
import { useAuth } from "wasp/client/auth";
import {
  addToCart,
  applyCoupon,
  checkCompatibility,
  compareProducts,
  getCart,
  getCompareList,
  getMyCoupons,
  getMyGear,
  getProduct,
  getProducts,
  placeOrder,
  removeFromCart,
  setCompareList,
  updateCartQuantity,
} from "wasp/client/operations";
import { celebrateOrder } from "../cart/celebrate";
import { useHighlightStore } from "../compare/highlightStore";
import { navigateRef } from "../navigation";
import { MACHINE_SPEC_KEY_NAMES } from "../shared/machineSpecKeys";
import {
  addToCartSchema,
  applyCouponSchema,
  checkCompatibilitySchema,
  compareProductsSchema,
  emptySchema,
  getProductDetailsSchema,
  highlightDifferencesSchema,
  removeFromCartSchema,
  searchProductsSchema,
  setCompareListSchema,
  updateCartQuantitySchema,
} from "./schemas";

// use-webmcp-tool aborts the browser's async registerTool() on unmount
// (StrictMode double-mounts, `enabled` flips), and Chrome rejects that promise
// with an AbortError nothing awaits. Expected lifecycle noise — keep it out of
// the console, but only when it comes from the library itself.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as Error | undefined;
    if (
      reason?.name === "AbortError" &&
      String(reason.stack ?? "").includes("use-webmcp-tool")
    ) {
      event.preventDefault();
    }
  });
}

const readOnly = { readOnlyHint: true };
const mutating = { readOnlyHint: false };

// Display metadata for the badge's hover popover. MUST stay in the same order
// as the useWebMCP() calls below — the two lists are zipped by index.
const TOOL_META: Array<{ name: string; auth: boolean; writes: boolean }> = [
  { name: "search_products", auth: false, writes: false },
  { name: "get_product_details", auth: false, writes: false },
  { name: "compare_products", auth: false, writes: false },
  { name: "get_my_gear", auth: true, writes: false },
  { name: "check_compatibility", auth: true, writes: false },
  { name: "get_compare_list", auth: true, writes: false },
  { name: "set_compare_list", auth: true, writes: true },
  { name: "highlight_differences", auth: true, writes: true },
  { name: "clear_highlights", auth: true, writes: true },
  { name: "get_cart", auth: true, writes: false },
  { name: "add_to_cart", auth: true, writes: true },
  { name: "update_cart_quantity", auth: true, writes: true },
  { name: "remove_from_cart", auth: true, writes: true },
  { name: "get_my_coupons", auth: true, writes: false },
  { name: "apply_coupon", auth: true, writes: true },
  { name: "checkout", auth: true, writes: true },
];

function goToCompare() {
  if (window.location.pathname !== "/compare") {
    navigateRef.current?.("/compare");
  }
}

export function WebMCPTools() {
  const { data: user, isLoading } = useAuth();
  const loggedIn = !!user;

  const results = [
    useWebMCP({
      name: "search_products",
      description:
        "Search the store catalog by free text and/or category. Returns product slugs, names, prices and key compatibility fields. Use the returned slugs with other tools.",
      inputSchema: searchProductsSchema,
      annotations: readOnly,
      execute: (args: { query?: string; category?: string }) =>
        getProducts(args ?? {}),
    }),

    useWebMCP({
      name: "get_product_details",
      description:
        "Full specification sheet for one product, including fields not shown on the product page, and the source the specs came from.",
      inputSchema: getProductDetailsSchema,
      annotations: readOnly,
      execute: (args: { slug: string }) => getProduct({ slug: args.slug }),
    }),

    useWebMCP({
      name: "compare_products",
      description:
        "Side-by-side spec matrix for 2–3 products. Each row has a `differs` flag; focus on rows where `differs` is true.",
      inputSchema: compareProductsSchema,
      annotations: readOnly,
      execute: (args: { slugs: string[] }) =>
        compareProducts({ slugs: args.slugs }),
    }),

    useWebMCP({
      name: "get_my_gear",
      description:
        "Everything the user has previously bought from this store, with purchase dates. Use it to check what they already own before recommending anything.",
      inputSchema: emptySchema,
      annotations: readOnly,
      enabled: loggedIn,
      execute: () => getMyGear(),
    }),

    useWebMCP({
      name: "check_compatibility",
      description:
        "Check whether a product works with the user's existing gear (default) or with specific products. Returns per-item COMPATIBLE / INCOMPATIBLE / UNKNOWN / NOT_APPLICABLE with a reason and, for incompatibilities, the slug of a product that fixes it. Always call this for each machine before recommending one.",
      inputSchema: checkCompatibilitySchema,
      annotations: readOnly,
      enabled: loggedIn,
      execute: (args: { candidate_slug: string; against_slugs?: string[] }) =>
        checkCompatibility({
          candidateSlug: args.candidate_slug,
          ...(args.against_slugs ? { againstSlugs: args.against_slugs } : {}),
        }),
    }),

    useWebMCP({
      name: "get_compare_list",
      description:
        "The products the user currently has open in the Compare view. Call this first when the user says 'these two' or 'which one'.",
      inputSchema: emptySchema,
      annotations: readOnly,
      enabled: loggedIn,
      execute: () => getCompareList(),
    }),

    useWebMCP({
      name: "set_compare_list",
      description: "Replace the products shown in the Compare view.",
      inputSchema: setCompareListSchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: async (args: { slugs: string[] }) => {
        const list = await setCompareList({ slugs: args.slugs });
        goToCompare();
        return list;
      },
    }),

    useWebMCP({
      name: "highlight_differences",
      description:
        "Visually highlight specific rows in the user's Compare view and dim the rest, so they can see why you recommend what you recommend. Use the `key` values from compare_products. Optional `note` is shown above the table. Call this when you've decided which specs matter for the user's needs.",
      inputSchema: highlightDifferencesSchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: (args: { spec_keys: string[]; note?: string }) => {
        const invalid = args.spec_keys.filter(
          (k) => !MACHINE_SPEC_KEY_NAMES.includes(k),
        );
        if (invalid.length > 0) {
          throw new Error(
            `Unknown spec keys: ${invalid.join(", ")}. Use the 'key' values returned by compare_products.`,
          );
        }
        useHighlightStore.getState().set(args.spec_keys, args.note ?? null);
        goToCompare();
        return {
          highlighted: args.spec_keys,
          note: args.note ?? null,
          view: "/compare",
          effect:
            "Highlighted rows are tinted and bold; all other rows are dimmed.",
        };
      },
    }),

    useWebMCP({
      name: "clear_highlights",
      description: "Remove highlighting from the Compare view.",
      inputSchema: emptySchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: () => {
        useHighlightStore.getState().clear();
        return { cleared: true, effect: "Compare table restored to full view." };
      },
    }),

    useWebMCP({
      name: "get_cart",
      description:
        "The user's current cart: lines with color and quantity, subtotal, applied coupon and total.",
      inputSchema: emptySchema,
      annotations: readOnly,
      enabled: loggedIn,
      execute: () => getCart(),
    }),

    useWebMCP({
      name: "add_to_cart",
      description:
        "Add a product to the cart. If the product has color options and none is given, the first option is used and reported back. Returns the full updated cart.",
      inputSchema: addToCartSchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: (args: { slug: string; quantity?: number; color?: string }) =>
        addToCart(args),
    }),

    useWebMCP({
      name: "update_cart_quantity",
      description:
        "Change the quantity of a cart line (0 removes it). Returns the full updated cart.",
      inputSchema: updateCartQuantitySchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: (args: { slug: string; color?: string; quantity: number }) =>
        updateCartQuantity(args),
    }),

    useWebMCP({
      name: "remove_from_cart",
      description:
        "Remove a product from the cart. Returns the full updated cart.",
      inputSchema: removeFromCartSchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: (args: { slug: string; color?: string }) => removeFromCart(args),
    }),

    useWebMCP({
      name: "get_my_coupons",
      description:
        "Discount codes available to this user. Call before apply_coupon.",
      inputSchema: emptySchema,
      annotations: readOnly,
      enabled: loggedIn,
      execute: () => getMyCoupons(),
    }),

    useWebMCP({
      name: "apply_coupon",
      description:
        "Apply one of the user's coupon codes to the cart. Returns the full updated cart including the discount.",
      inputSchema: applyCouponSchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: (args: { code: string }) => applyCoupon(args),
    }),

    useWebMCP({
      name: "checkout",
      description:
        "Place the order for everything in the cart. Irreversible. Only call when the user explicitly asks to buy / check out / place the order.",
      inputSchema: emptySchema,
      annotations: mutating,
      enabled: loggedIn,
      execute: async () => {
        const result = await placeOrder();
        void celebrateOrder(result);
        return {
          ...result,
          effect: `Order #${result.orderId} placed; the cart is now empty.`,
        };
      },
    }),
  ];

  const supported = results.some((r) => r.supported);
  const registeredCount = results.filter((r) => r.registered).length;
  const tools = TOOL_META.map((meta, i) => ({
    ...meta,
    registered: results[i]?.registered ?? false,
  }));
  const publicTools = tools.filter((t) => !t.auth);
  const authTools = tools.filter((t) => t.auth);

  if (isLoading) return null;

  return (
    <div className="group fixed bottom-3 right-3 z-50">
      {supported && (
        <div
          className="pointer-events-none absolute bottom-full right-0 mb-2 w-[27rem] max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 opacity-0 shadow-xl transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 motion-reduce:transition-none"
          role="tooltip"
        >
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-bold">WebMCP tools</span>
            <span className="text-xs text-stone-400">
              {registeredCount} of {tools.length} registered
            </span>
          </div>
          <ToolGroup title="Always available" tools={publicTools} />
          <ToolGroup
            title={loggedIn ? "Logged in" : "Requires login"}
            tools={authTools}
          />
          <p className="mt-2 border-t border-stone-100 pt-2 text-[11px] leading-snug text-stone-400">
            ● registered with the browser · ○ hidden until login ·{" "}
            <span className="font-medium">✎</span> can change things
          </p>
        </div>
      )}
      <div className="rounded-full border border-stone-300 bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-600 shadow">
        {supported
          ? `WebMCP · ${registeredCount} tool${registeredCount === 1 ? "" : "s"}${loggedIn ? "" : " (log in for more)"}`
          : "WebMCP unavailable"}
      </div>
    </div>
  );
}

function ToolGroup({
  title,
  tools,
}: {
  title: string;
  tools: Array<{ name: string; writes: boolean; registered: boolean }>;
}) {
  return (
    <div className="mt-2">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
        {title}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {tools.map((t) => (
          <li
            key={t.name}
            className={
              "flex items-center gap-1.5 font-mono text-[12px] " +
              (t.registered ? "text-stone-700" : "text-stone-400")
            }
          >
            <span
              className={t.registered ? "text-green-600" : "text-stone-300"}
            >
              {t.registered ? "●" : "○"}
            </span>
            <span>{t.name}</span>
            {t.writes && <span className="text-stone-400">✎</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
