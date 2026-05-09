import { StoreShell } from "@/components/storefront/store-shell";
import { SearchResultsClient } from "@/components/storefront/search-results-client";
import { searchCatalogProducts } from "@/core/services/catalog";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscaPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchCatalogProducts(query) : [];

  return (
    <StoreShell>
      <SearchResultsClient query={query} results={results} />
    </StoreShell>
  );
}
