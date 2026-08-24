import { action, app, page, query, route } from "@wasp.sh/spec";

import App from "./src/App" with { type: "ref" };
import { LoginPage } from "./src/auth/LoginPage" with { type: "ref" };
import { SignupPage } from "./src/auth/SignupPage" with { type: "ref" };
import { CatalogPage } from "./src/catalog/CatalogPage" with { type: "ref" };
import { ProductPage } from "./src/catalog/ProductPage" with { type: "ref" };
import { ComparePage } from "./src/compare/ComparePage" with { type: "ref" };
import { OrdersPage } from "./src/orders/OrdersPage" with { type: "ref" };
import { setCompareList } from "./src/server/actions" with { type: "ref" };
import {
  addToCart,
  applyCoupon,
  getCart,
  getMyCoupons,
  placeOrder,
  removeFromCart,
  updateCartQuantity,
} from "./src/server/cart" with { type: "ref" };
import {
  checkCompatibility,
  compareProducts,
  getCompareList,
  getMyGear,
  getProduct,
  getProducts,
} from "./src/server/queries" with { type: "ref" };
import { demoReset, devSeed } from "./src/server/seed" with { type: "ref" };

export default app({
  name: "webmcpEspresso",
  wasp: { version: "^0.25.0" },
  title: "Crema & Co.",
  head: ["<link rel='icon' href='/favicon.ico' />"],
  auth: {
    userEntity: "User",
    methods: {
      usernameAndPassword: {},
    },
    onAuthFailedRedirectTo: "/login",
  },
  client: {
    rootComponent: App,
  },
  db: {
    seeds: [devSeed, demoReset],
  },
  spec: [
    // Pages
    route("CatalogRoute", "/", page(CatalogPage)),
    route("ProductRoute", "/product/:slug", page(ProductPage)),
    route("CompareRoute", "/compare", page(ComparePage)),
    route("LoginRoute", "/login", page(LoginPage)),
    route("SignupRoute", "/signup", page(SignupPage)),
    route("OrdersRoute", "/orders", page(OrdersPage, { authRequired: true })),

    // Operations — `entities` lists must be complete: they drive automatic
    // query invalidation, which is what makes the UI move after agent actions.
    query(getProducts, { entities: ["Product"] }),
    query(getProduct, { entities: ["Product"] }),
    query(compareProducts, { entities: ["Product"] }),
    query(getMyGear, { entities: ["Order", "OrderItem", "Product"] }),
    query(checkCompatibility, {
      entities: ["Order", "OrderItem", "Product", "User"],
    }),
    query(getCompareList, { entities: ["CompareItem", "Product"] }),
    action(setCompareList, { entities: ["CompareItem", "Product"] }),
    query(getCart, {
      entities: ["CartItem", "Product", "UserCoupon", "Coupon"],
    }),
    query(getMyCoupons, { entities: ["UserCoupon", "Coupon"] }),
    action(addToCart, {
      entities: ["CartItem", "Product", "UserCoupon", "Coupon"],
    }),
    action(updateCartQuantity, {
      entities: ["CartItem", "Product", "UserCoupon", "Coupon"],
    }),
    action(removeFromCart, {
      entities: ["CartItem", "Product", "UserCoupon", "Coupon"],
    }),
    action(applyCoupon, {
      entities: ["UserCoupon", "Coupon", "CartItem", "Product"],
    }),
    action(placeOrder, {
      entities: [
        "Order",
        "OrderItem",
        "CartItem",
        "UserCoupon",
        "Coupon",
        "Product",
      ],
    }),
  ],
});
