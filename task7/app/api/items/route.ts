import { seedItems } from "@/lib/api/seed";

// Public, read-only catalog. The service worker caches this response
// (network-first) so the list still works offline.
export const dynamic = "force-static";

export function GET() {
  return Response.json(seedItems);
}
