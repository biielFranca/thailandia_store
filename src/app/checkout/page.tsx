import { StoreShell } from "@/components/storefront/store-shell";
import { CheckoutClient, type CheckoutSavedData } from "@/components/storefront/checkout-client";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  let savedData: CheckoutSavedData | null = null;

  if (user) {
    const supabase = await createClient();
    const [{ data: profile }, { data: address }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
      supabase
        .from("addresses")
        .select("zip_code, street, number, complement, neighborhood, city, state")
        .eq("profile_id", user.id)
        .eq("is_default", true)
        .maybeSingle(),
    ]);

    savedData = {
      name: profile?.full_name ?? user.name,
      email: user.email,
      phone: profile?.phone ?? "",
      address: address
        ? {
            cep: address.zip_code,
            street: address.street,
            number: address.number,
            complement: address.complement ?? "",
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          }
        : null,
    };
  }

  return (
    <StoreShell>
      <CheckoutClient savedData={savedData} />
    </StoreShell>
  );
}
