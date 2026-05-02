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
      <div className="min-h-screen pt-[8.5rem] sm:pt-[8.75rem]">{children}</div>
      <StoreFooter />
    </>
  );
}
