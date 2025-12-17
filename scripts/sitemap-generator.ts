// scripts/sitemap-generator.ts

type Store = {
  city: string;
  area: string;
  storeName: string;
  updatedAt?: string;
};
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchStorePaths(): Promise<
  { loc: string; lastmod: string }[]
> {
  const res = await fetch(`${baseUrl}/stores/all`);
  const stores: Store[] = await res.json();

  return stores.map((store) => ({
    loc: `/takeaway/${store.city}/${store.area}/${store.storeName}`,
    lastmod: store.updatedAt || new Date().toISOString(),
  }));
}
