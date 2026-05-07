import { StoreShell } from "@/components/storefront/store-shell";
import { CheckoutClient } from "@/components/storefront/checkout-client";

export default function CheckoutPage() {
  return (
    <StoreShell>
      <CheckoutClient />
    </StoreShell>
  );
}
