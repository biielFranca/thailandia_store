// The /admin/produtos/novo path is handled by the dynamic [slug] route.
// This file exists only to satisfy Next.js routing — it should never be reached
// because the [slug] route catches "novo" before this can match.
// If this page somehow renders, redirect to the correct path.
export { default } from "@/app/admin/produtos/[slug]/page";
