"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/contexts/store";
import { AuthProvider } from "@/contexts/auth";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreHeader } from "@/components/storefront/store-header";

type StoreShellProps = {
  children: ReactNode;
};

export function StoreShell({ children }: StoreShellProps) {
  return (
    <AuthProvider>
      <StoreProvider>
        <AnnouncementBar />
        <StoreHeader />
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden pt-[68px]">{children}</div>
        <StoreFooter />
        <CartDrawer />
        <SearchOverlay />
      </StoreProvider>
    </AuthProvider>
  );
}
