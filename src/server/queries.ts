import type { Product } from "wasp/entities";
import { HttpError } from "wasp/server";
import type {
  CheckCompatibility,
  CompareProducts,
  GetCompareList,
  GetMyGear,
  GetProduct,
  GetProducts,
} from "wasp/server/operations";
import { checkAgainstGear, type CompatProduct } from "../shared/compatibility";
import { MACHINE_SPEC_KEYS } from "../shared/machineSpecKeys";

const CATEGORIES = [
  "MACHINE",
  "GRINDER",
  "PORTAFILTER",
  "BASKET",
  "TAMPER",
  "PUCK_SCREEN",
  "DOSING_FUNNEL",
  "WDT_TOOL",
  "WATER_FILTER",
  "ACCESSORY",
] as const;
type CategoryName = (typeof CATEGORIES)[number];

function validateCategory(category: string): CategoryName {
  if (!CATEGORIES.includes(category as CategoryName)) {
    throw new HttpError(
      400,
      `Unknown category '${category}'. Valid categories: ${CATEGORIES.join(", ")}.`,
    );
  }
  return category as CategoryName;
}

export type ProductSummary = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  currency: string;
  shortBlurb: string;
  imageUrl: string;
  colorOptions: string[];
  inStock: boolean;
  basketMm: number | null;
  pfStandards: string[];
  pfMaybeStandards: string[];
  espressoCapable: boolean | null;
  compatibleMachineSlugs: string[];
  isUniversal: boolean;
};

export function toSummary(p: Product): ProductSummary {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    priceCents: p.priceCents,
    currency: p.currency,
    shortBlurb: p.shortBlurb,
    imageUrl: p.imageUrl,
    colorOptions: p.colorOptions,
    inStock: p.inStock,
    basketMm: p.basketMm,
    pfStandards: p.pfStandards,
    pfMaybeStandards: p.pfMaybeStandards,
    espressoCapable: p.espressoCapable,
    compatibleMachineSlugs: p.compatibleMachineSlugs,
    isUniversal: p.isUniversal,
  };
}

async function findProductOrThrow(
  Product: { findUnique: (args: any) => Promise<Product | null> },
  slug: string,
): Promise<Product> {
  const product = await Product.findUnique({ where: { slug } });
  if (!product) {
    throw new HttpError(
      400,
      `Unknown product slug '${slug}'. Use search_products to find valid slugs.`,
    );
  }
  return product;
}

export const getProducts = (async (args, context) => {
  const { query } = args ?? {};
  const category =
    args?.category !== undefined ? validateCategory(args.category) : undefined;
  const products = await context.entities.Product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { shortBlurb: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: "asc" }, { priceCents: "desc" }],
  });
  return products.map(toSummary);
}) satisfies GetProducts<{ query?: string; category?: string }>;

export const getProduct = (async (args, context) => {
  if (!args?.slug) throw new HttpError(400, "Missing required argument 'slug'.");
  return findProductOrThrow(context.entities.Product, args.slug);
}) satisfies GetProduct<{ slug: string }>;

type SpecJson = Record<
  string,
  { label: string; value: string; unit?: string; group: string }
>;

export type CompareRow = {
  key: string;
  label: string;
  group: string;
  unit?: string;
  values: string[];
  differs: boolean;
};

export const compareProducts = (async (args, context) => {
  const slugs = args?.slugs;
  if (!Array.isArray(slugs) || slugs.length < 2 || slugs.length > 3) {
    throw new HttpError(
      400,
      "compare_products needs 2–3 product slugs in 'slugs'.",
    );
  }
  const products = await Promise.all(
    slugs.map((slug) => findProductOrThrow(context.entities.Product, slug)),
  );

  const specsPer = products.map((p) => (p.specs ?? {}) as SpecJson);
  const allMachines = products.every((p) => p.category === "MACHINE");

  // Machines share an identical key set, in canonical order. For mixed
  // comparisons, fall back to the union of keys in first-seen order.
  const keys = allMachines
    ? MACHINE_SPEC_KEYS.map((k) => k.key)
    : [...new Set(specsPer.flatMap((s) => Object.keys(s)))];

  const rows: CompareRow[] = keys.map((key) => {
    const template = specsPer.find((s) => s[key]);
    const entry = template?.[key];
    const values = specsPer.map((s) => s[key]?.value ?? "—");
    return {
      key,
      label: entry?.label ?? key,
      group: entry?.group ?? "Specs",
      ...(entry?.unit ? { unit: entry.unit } : {}),
      values,
      differs: new Set(values).size > 1,
    };
  });

  return { products: products.map(toSummary), rows };
}) satisfies CompareProducts<{ slugs: string[] }>;

// Everything the user has previously bought, with purchase dates.
export const getMyGear = (async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to see past purchases.");
  }
  const orders = await context.entities.Order.findMany({
    where: { userId: context.user.id },
    orderBy: { placedAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  const gearBySlug = new Map<
    string,
    ProductSummary & { purchasedAt: Date; orderId: number }
  >();
  for (const order of orders) {
    for (const item of order.items) {
      if (!gearBySlug.has(item.product.slug)) {
        gearBySlug.set(item.product.slug, {
          ...toSummary(item.product),
          purchasedAt: order.placedAt,
          orderId: order.id,
        });
      }
    }
  }

  return {
    gear: [...gearBySlug.values()],
    orders: orders.map((o) => ({
      id: o.id,
      placedAt: o.placedAt,
      totalCents: o.totalCents,
      couponCode: o.couponCode,
      items: o.items.map((i) => ({
        slug: i.product.slug,
        name: i.product.name,
        category: i.product.category,
        quantity: i.quantity,
        priceCents: i.priceCents,
        color: i.color,
      })),
    })),
  };
}) satisfies GetMyGear;

const REGION_VOLTAGE: Record<string, number> = { EU: 230, US: 120 };

export const checkCompatibility = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to check compatibility.");
  }
  if (!args?.candidateSlug) {
    throw new HttpError(400, "Missing required argument 'candidateSlug'.");
  }
  const catalog = await context.entities.Product.findMany();
  const candidate = catalog.find((p) => p.slug === args.candidateSlug);
  if (!candidate) {
    throw new HttpError(
      400,
      `Unknown product slug '${args.candidateSlug}'. Use search_products to find valid slugs.`,
    );
  }

  let gear: Product[];
  if (args.againstSlugs && args.againstSlugs.length > 0) {
    gear = args.againstSlugs.map((slug) => {
      const p = catalog.find((c) => c.slug === slug);
      if (!p) {
        throw new HttpError(
          400,
          `Unknown product slug '${slug}'. Use search_products to find valid slugs.`,
        );
      }
      return p;
    });
  } else {
    const orders = await context.entities.Order.findMany({
      where: { userId: context.user.id },
      include: { items: true },
    });
    const productIds = [
      ...new Set(orders.flatMap((o) => o.items.map((i) => i.productId))),
    ];
    gear = catalog.filter((p) => productIds.includes(p.id));
  }

  const result = checkAgainstGear(
    candidate as CompatProduct,
    gear as CompatProduct[],
    catalog as CompatProduct[],
  );

  const regionVoltage = REGION_VOLTAGE[context.user.region] ?? 230;
  const regionVoltageOk =
    candidate.voltage == null || candidate.voltage === regionVoltage;

  const suggestedFixes = result.suggestedFixes.map((fix) => {
    const p = catalog.find((c) => c.slug === fix.fixSlug)!;
    return {
      forOwnedSlug: fix.forOwnedSlug,
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
    };
  });

  return {
    candidate: toSummary(candidate),
    overall: result.overall,
    items: result.items,
    suggestedFixes,
    regionVoltageOk,
  };
}) satisfies CheckCompatibility<{
  candidateSlug: string;
  againstSlugs?: string[];
}>;

export const getCompareList = (async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to have a compare list.");
  }
  const items = await context.entities.CompareItem.findMany({
    where: { userId: context.user.id },
    orderBy: { position: "asc" },
    include: { product: true },
  });
  return items.map((i) => toSummary(i.product));
}) satisfies GetCompareList;
