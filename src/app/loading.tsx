import { LoadingScreen } from "@/components/storefront/loading-screen";

/**
 * Root-level loading UI. Next.js App Router shows this automatically
 * during route transitions and while server components are streaming.
 */
export default function Loading() {
  return <LoadingScreen />;
}
