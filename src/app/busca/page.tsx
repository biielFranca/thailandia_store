import { StoreShell } from "@/components/storefront/store-shell";
import { SearchResultsClient } from "@/components/storefront/search-results-client";
import { Suspense } from "react";

export default function BuscaPage() {
  return (
    <StoreShell>
      <Suspense>
        <SearchResultsClient />
      </Suspense>
    </StoreShell>
  );
}
