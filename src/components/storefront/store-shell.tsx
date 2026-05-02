import type { ReactNode } from "react";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreHeader } from "@/components/storefront/store-header";

type StoreShellProps = {
  children: ReactNode;
};

export function StoreShell({ children }: StoreShellProps) {
  return (
    <>
      <StoreHeader />
      <div className="min-h-screen pt-[72px]">{children}</div>
      <StoreFooter />
    </>
  );
}
