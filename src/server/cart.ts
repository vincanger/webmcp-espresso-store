import { HttpError } from "wasp/server";
import type {
  AddToCart,
  ApplyCoupon,
  GetCart,
  GetMyCoupons,
  PlaceOrder,
  RemoveFromCart,
  UpdateCartQuantity,
} from "wasp/server/operations";

type CartEntities = {
  CartItem: any;
  Product: any;
  UserCoupon: any;
  Coupon: any;
};

export type CartView = {
  lines: Array<{
    slug: string;
    name: string;
    color: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    imageUrl: string;
  }>;
  subtotalCents: number;
  coupon: { code: string; percentOff: number; discountCents: number } | null;
  totalCents: number;
};

// Builds the cart response every cart query/action returns.
async function buildCart(
  entities: CartEntities,
  userId: number,
): Promise<CartView> {
  const items = await entities.CartItem.findMany({
    where: { userId },
    orderBy: { id: "asc" },
    include: { product: true },
  });
  const lines = items.map((i: any) => ({
    slug: i.product.slug,
    name: i.product.name,
    color: i.color,
    quantity: i.quantity,
    unitPriceCents: i.product.priceCents,
    lineTotalCents: i.product.priceCents * i.quantity,
    imageUrl: i.product.imageUrl,
  }));
  const subtotalCents = lines.reduce(
    (sum: number, l: (typeof lines)[number]) => sum + l.lineTotalCents,
    0,
  );

  const applied = await entities.UserCoupon.findFirst({
    where: { userId, applied: true, usedAt: null },
    include: { coupon: true },
  });
  const coupon =
    applied && subtotalCents > 0
      ? {
          code: applied.couponCode,
          percentOff: applied.coupon.percentOff,
          discountCents: Math.round(
            (subtotalCents * applied.coupon.percentOff) / 100,
          ),
        }
      : null;

  return {
    lines,
    subtotalCents,
    coupon,
    totalCents: subtotalCents - (coupon?.discountCents ?? 0),
  };
}

function requireUser(context: { user?: { id: number } | null }): number {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to use the cart.");
  }
  return context.user.id;
}

async function findProductOrThrow(Product: any, slug: string) {
  const product = await Product.findUnique({ where: { slug } });
  if (!product) {
    throw new HttpError(
      400,
      `Unknown product slug '${slug}'. Use search_products to find valid slugs.`,
    );
  }
  return product;
}

// Resolves the color for a cart line. Returns the color to store plus whether
// we defaulted it (so tools can report that back to the agent).
function resolveColor(
  product: { name: string; colorOptions: string[] },
  requested: string | undefined,
): { color: string; defaulted: boolean } {
  if (product.colorOptions.length === 0) {
    return { color: "", defaulted: false };
  }
  if (requested === undefined || requested === "") {
    return { color: product.colorOptions[0], defaulted: true };
  }
  const match = product.colorOptions.find(
    (c) => c.toLowerCase() === requested.toLowerCase(),
  );
  if (!match) {
    throw new HttpError(
      400,
      `'${requested}' is not a color option for ${product.name}. Valid colors: ${product.colorOptions.join(", ")}.`,
    );
  }
  return { color: match, defaulted: false };
}

export const getCart = (async (_args, context) => {
  const userId = requireUser(context);
  return buildCart(context.entities, userId);
}) satisfies GetCart;

export const getMyCoupons = (async (_args, context) => {
  const userId = requireUser(context);
  const coupons = await context.entities.UserCoupon.findMany({
    where: { userId },
    include: { coupon: true },
  });
  return coupons.map((uc) => ({
    code: uc.couponCode,
    percentOff: uc.coupon.percentOff,
    description: uc.coupon.description,
    applied: uc.applied,
    usedAt: uc.usedAt,
  }));
}) satisfies GetMyCoupons;

export const addToCart = (async (args, context) => {
  const userId = requireUser(context);
  if (!args?.slug) throw new HttpError(400, "Missing required argument 'slug'.");
  const quantity = args.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
    throw new HttpError(400, "'quantity' must be an integer between 1 and 9.");
  }
  const product = await findProductOrThrow(context.entities.Product, args.slug);
  if (!product.inStock) {
    throw new HttpError(400, `${product.name} is out of stock.`);
  }
  const { color, defaulted } = resolveColor(product, args.color);

  const existing = await context.entities.CartItem.findUnique({
    where: {
      userId_productId_color: { userId, productId: product.id, color },
    },
  });
  if (existing) {
    await context.entities.CartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(existing.quantity + quantity, 9) },
    });
  } else {
    await context.entities.CartItem.create({
      data: { userId, productId: product.id, quantity, color },
    });
  }

  const cart = await buildCart(context.entities, userId);
  return {
    ...cart,
    ...(defaulted
      ? {
          note: `No color given for ${product.name}; defaulted to '${color}' (options: ${product.colorOptions.join(", ")}).`,
        }
      : {}),
  };
}) satisfies AddToCart<{ slug: string; quantity?: number; color?: string }>;

// Finds the user's cart line for a slug (+ optional color). If color is
// omitted and the product has exactly one line, that line is used.
async function findCartLine(
  entities: CartEntities,
  userId: number,
  slug: string,
  color: string | undefined,
) {
  const product = await findProductOrThrow(entities.Product, slug);
  const lines = await entities.CartItem.findMany({
    where: { userId, productId: product.id },
  });
  if (lines.length === 0) {
    throw new HttpError(400, `${product.name} is not in the cart.`);
  }
  if (color === undefined) {
    if (lines.length > 1) {
      throw new HttpError(
        400,
        `${product.name} is in the cart in multiple colors (${lines
          .map((l: any) => l.color)
          .join(", ")}); pass 'color' to pick one.`,
      );
    }
    return lines[0];
  }
  const line = lines.find(
    (l: any) => l.color.toLowerCase() === color.toLowerCase(),
  );
  if (!line) {
    throw new HttpError(
      400,
      `${product.name} in color '${color}' is not in the cart. In cart: ${lines
        .map((l: any) => l.color || "(no color)")
        .join(", ")}.`,
    );
  }
  return line;
}

export const updateCartQuantity = (async (args, context) => {
  const userId = requireUser(context);
  if (!args?.slug) throw new HttpError(400, "Missing required argument 'slug'.");
  const { quantity } = args;
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 9) {
    throw new HttpError(400, "'quantity' must be an integer between 0 and 9.");
  }
  const line = await findCartLine(context.entities, userId, args.slug, args.color);
  if (quantity === 0) {
    await context.entities.CartItem.delete({ where: { id: line.id } });
  } else {
    await context.entities.CartItem.update({
      where: { id: line.id },
      data: { quantity },
    });
  }
  return buildCart(context.entities, userId);
}) satisfies UpdateCartQuantity<{
  slug: string;
  color?: string;
  quantity: number;
}>;

export const removeFromCart = (async (args, context) => {
  const userId = requireUser(context);
  if (!args?.slug) throw new HttpError(400, "Missing required argument 'slug'.");
  const line = await findCartLine(context.entities, userId, args.slug, args.color);
  await context.entities.CartItem.delete({ where: { id: line.id } });
  return buildCart(context.entities, userId);
}) satisfies RemoveFromCart<{ slug: string; color?: string }>;

export const applyCoupon = (async (args, context) => {
  const userId = requireUser(context);
  if (!args?.code) throw new HttpError(400, "Missing required argument 'code'.");
  const code = args.code.toUpperCase();
  const userCoupon = await context.entities.UserCoupon.findUnique({
    where: { userId_couponCode: { userId, couponCode: code } },
    include: { coupon: true },
  });
  if (!userCoupon) {
    throw new HttpError(
      400,
      `You don't have the coupon '${code}'. Use get_my_coupons to see your coupons.`,
    );
  }
  if (userCoupon.usedAt) {
    throw new HttpError(400, `Coupon '${code}' has already been used.`);
  }
  // Only one coupon at a time: un-apply any other.
  await context.entities.UserCoupon.updateMany({
    where: { userId, applied: true, usedAt: null },
    data: { applied: false },
  });
  await context.entities.UserCoupon.update({
    where: { id: userCoupon.id },
    data: { applied: true },
  });
  return buildCart(context.entities, userId);
}) satisfies ApplyCoupon<{ code: string }>;

export const placeOrder = (async (_args, context) => {
  const userId = requireUser(context);
  const cart = await buildCart(context.entities, userId);
  if (cart.lines.length === 0) {
    throw new HttpError(400, "The cart is empty; add something first.");
  }

  const items = await context.entities.CartItem.findMany({
    where: { userId },
    include: { product: true },
  });
  const order = await context.entities.Order.create({
    data: {
      userId,
      totalCents: cart.totalCents,
      couponCode: cart.coupon?.code ?? null,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          priceCents: i.product.priceCents,
          color: i.color || null,
        })),
      },
    },
  });

  if (cart.coupon) {
    await context.entities.UserCoupon.update({
      where: {
        userId_couponCode: { userId, couponCode: cart.coupon.code },
      },
      data: { usedAt: new Date() },
    });
  }
  await context.entities.CartItem.deleteMany({ where: { userId } });

  return { orderId: order.id, totalCents: cart.totalCents };
}) satisfies PlaceOrder;
