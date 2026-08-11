"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AccountNav, { type AccountTab } from "@/components/account/AccountNav";
import OrderCard from "@/components/account/OrderCard";
import WishlistCard from "@/components/account/WishlistCard";
import PreferencesPanel from "@/components/account/PreferencesPanel";
import AddressBook from "@/components/account/AddressBook";
import ProfilePanel from "@/components/account/ProfilePanel";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getAllProducts, getOrdersForUser } from "@/lib/api";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Order, Product } from "@/types";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<AccountTab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const savedIds = useWishlistStore((s) => s.productIds);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/account/login");
  }, [status, router]);

  const accessToken = (session as unknown as { accessToken?: string })
    ?.accessToken;

  const reloadOrders = () => {
    if (accessToken) getOrdersForUser(accessToken).then(setOrders);
  };

  useEffect(() => {
    if (!session?.user) return;
    // GET /orders is scoped by bearer token, not a userId path param —
    // see lib/auth.ts, which stores the backend's accessToken on the
    // NextAuth session.
    reloadOrders();
    getAllProducts().then(setProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (status === "loading" || !session) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-40 w-full max-w-sm rounded-soft" />
        </div>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => savedIds.includes(p.id));

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <AccountNav
          active={tab}
          onChange={setTab}
          userName={session.user?.name ?? "there"}
        />

        <div>
          {tab === "profile" && <ProfilePanel />}

          {tab === "orders" && (
            <div>
              <h2 className="font-display text-fluid-h2 italic text-foreground">
                Order history
              </h2>
              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Pieces you order will show up here, with tracking and return options."
                  action={
                    <a
                      href="/shop"
                      className="font-mono-price text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
                    >
                      Start shopping
                    </a>
                  }
                />
              ) : (
                <div className="mt-6 space-y-5">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onChange={reloadOrders}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && <AddressBook />}

          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-fluid-h2 italic text-foreground">
                Wishlist
              </h2>
              {wishlistProducts.length === 0 ? (
                <EmptyState
                  title="Nothing saved yet"
                  description="Hearts you add from product pages will land here."
                  action={
                    <a
                      href="/shop"
                      className="font-mono-price text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
                    >
                      Browse pieces
                    </a>
                  }
                />
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
                  {wishlistProducts.map((product, i) => (
                    <WishlistCard
                      key={product.id}
                      product={product}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "preferences" && <PreferencesPanel />}
        </div>
      </div>
    </div>
  );
}
