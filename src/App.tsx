import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { logout, useAuth } from "wasp/client/auth";
import { getCart, getCompareList, useQuery } from "wasp/client/operations";
import "./Main.css";
import { CartDrawer } from "./cart/CartDrawer";
import { useCartUiStore } from "./cart/cartUiStore";
import { navigateRef } from "./navigation";
import { WebMCPTools } from "./webmcp/WebMCPTools";

export default function App() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { data: compareList } = useQuery(getCompareList, undefined, {
    enabled: !!user,
  });
  const { data: cart } = useQuery(getCart, undefined, { enabled: !!user });
  const openDrawer = useCartUiStore((s) => s.openDrawer);
  const cartCount =
    cart?.lines.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            ☕ Crema&nbsp;&amp;&nbsp;Co.
          </Link>
          <Link to="/" className="text-stone-600 hover:text-stone-900">
            Catalog
          </Link>
          <Link
            to="/compare"
            className="relative text-stone-600 hover:text-stone-900"
          >
            Compare
            {!!compareList?.length && (
              <span className="absolute -right-4 -top-1 rounded-full bg-amber-600 px-1.5 text-xs font-semibold text-white">
                {compareList.length}
              </span>
            )}
          </Link>
          {user && (
            <Link to="/orders" className="text-stone-600 hover:text-stone-900">
              Orders
            </Link>
          )}
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <button
                onClick={openDrawer}
                className="relative text-stone-600 hover:text-stone-900"
                aria-label="Open cart"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 rounded-full bg-amber-600 px-1.5 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            {user ? (
              <>
                <span className="text-sm text-stone-500">
                  Hi, {user.displayName ?? "there"}
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      <CartDrawer />
      <WebMCPTools />
    </div>
  );
}
