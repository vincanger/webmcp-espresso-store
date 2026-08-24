import type { DbSeedFn, PrismaClient } from "wasp/server";
import { sanitizeAndSerializeProviderData } from "wasp/server/auth";
import { CATALOG, DEMO_COMPARE_LIST, DEMO_ORDERS } from "./catalog.seed";

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

async function upsertCatalog(prisma: PrismaClient) {
  for (const p of CATALOG) {
    const data = {
      name: p.name,
      brand: p.brand,
      category: p.category,
      priceCents: p.priceCents,
      currency: "EUR",
      shortBlurb: p.shortBlurb,
      imageUrl: p.imageUrl,
      sourceUrl: p.sourceUrl,
      colorOptions: p.colorOptions ?? [],
      inStock: true,
      basketMm: p.basketMm ?? null,
      pfStandards: p.pfStandards ?? [],
      pfMaybeStandards: p.pfMaybeStandards ?? [],
      voltage: p.voltage ?? null,
      espressoCapable: p.espressoCapable ?? null,
      compatibleMachineSlugs: p.compatibleMachineSlugs ?? [],
      isUniversal: p.isUniversal ?? false,
      specs: p.specs,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
  }
}

async function createDemoUser(prisma: PrismaClient) {
  const existing = await prisma.user.findFirst({
    where: { displayName: "Vince" },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      displayName: "Vince",
      region: "EU",
      auth: {
        create: {
          identities: {
            create: {
              providerName: "username",
              providerUserId: "vince",
              providerData: await sanitizeAndSerializeProviderData<"username">({
                hashedPassword: "espresso123",
              }),
            },
          },
        },
      },
    },
  });
}

// `npm run demo:reset` — puts vince back in the canonical demo state:
// the 3 seeded orders, compare list = Linea Mini R + Bianca V3, BARISTA10
// granted and unused, cart empty.
export const demoReset: DbSeedFn = async (prisma) => {
  await upsertCatalog(prisma);
  const user = await createDemoUser(prisma);

  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  await prisma.orderItem.deleteMany({
    where: { order: { userId: user.id } },
  });
  await prisma.order.deleteMany({ where: { userId: user.id } });
  await seedOrders(prisma, user.id);
  await seedCompareList(prisma, user.id);
  await seedCoupons(prisma, user.id);

  console.log(
    "Demo reset: vince has 3 orders, compare list LM+Bianca, BARISTA10 unused, empty cart.",
  );
};

async function seedOrders(
  prisma: PrismaClient,
  userId: number,
): Promise<void> {
  const productBySlug = new Map(
    (await prisma.product.findMany()).map((p) => [p.slug, p]),
  );
  for (const o of DEMO_ORDERS) {
    const items = o.itemSlugs.map((slug) => {
      const p = productBySlug.get(slug);
      if (!p) throw new Error(`Seed error: no product '${slug}'`);
      return p;
    });
    await prisma.order.create({
      data: {
        userId,
        placedAt: monthsAgo(o.monthsAgo),
        totalCents: items.reduce((sum, p) => sum + p.priceCents, 0),
        items: {
          create: items.map((p) => ({
            productId: p.id,
            quantity: 1,
            priceCents: p.priceCents,
          })),
        },
      },
    });
  }
}

async function seedCompareList(
  prisma: PrismaClient,
  userId: number,
): Promise<void> {
  const productBySlug = new Map(
    (await prisma.product.findMany()).map((p) => [p.slug, p]),
  );
  await prisma.compareItem.deleteMany({ where: { userId } });
  for (const [position, slug] of DEMO_COMPARE_LIST.entries()) {
    await prisma.compareItem.create({
      data: { userId, productId: productBySlug.get(slug)!.id, position },
    });
  }
}

async function seedCoupons(prisma: PrismaClient, userId: number): Promise<void> {
  await prisma.coupon.upsert({
    where: { code: "BARISTA10" },
    create: {
      code: "BARISTA10",
      percentOff: 10,
      description: "Returning-customer discount",
    },
    update: {},
  });
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      percentOff: 10,
      description: "Welcome discount",
    },
    update: {},
  });
  await prisma.userCoupon.upsert({
    where: { userId_couponCode: { userId, couponCode: "BARISTA10" } },
    create: { userId, couponCode: "BARISTA10" },
    update: { applied: false, usedAt: null },
  });
}

export const devSeed: DbSeedFn = async (prisma) => {
  await upsertCatalog(prisma);
  const user = await createDemoUser(prisma);

  // Vince's three past orders (idempotent: skip if he already has orders).
  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  if (orderCount === 0) {
    await seedOrders(prisma, user.id);
  }
  await seedCompareList(prisma, user.id);
  await seedCoupons(prisma, user.id);

  console.log(
    `Seeded ${CATALOG.length} products, demo user 'vince', ${DEMO_ORDERS.length} orders, compare list, coupons.`,
  );
};
