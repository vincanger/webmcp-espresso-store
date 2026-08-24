import { HttpError } from "wasp/server";
import type { SetCompareList } from "wasp/server/operations";
import { toSummary } from "./queries";

export const setCompareList = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to edit the compare list.");
  }
  const slugs = args?.slugs;
  if (!Array.isArray(slugs) || slugs.length > 3) {
    throw new HttpError(
      400,
      "set_compare_list takes 'slugs': an array of 0–3 product slugs.",
    );
  }
  const products = await Promise.all(
    slugs.map(async (slug) => {
      const p = await context.entities.Product.findUnique({ where: { slug } });
      if (!p) {
        throw new HttpError(
          400,
          `Unknown product slug '${slug}'. Use search_products to find valid slugs.`,
        );
      }
      return p;
    }),
  );

  const userId = context.user.id;
  await context.entities.CompareItem.deleteMany({ where: { userId } });
  for (const [position, product] of products.entries()) {
    await context.entities.CompareItem.create({
      data: { userId, productId: product.id, position },
    });
  }
  return products.map(toSummary);
}) satisfies SetCompareList<{ slugs: string[] }>;
