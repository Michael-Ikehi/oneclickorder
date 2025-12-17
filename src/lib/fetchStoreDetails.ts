interface StoreDetails {
  id: number;
  name: string;
  description: string;
  image: string;
  zone_id: number;
}

export async function fetchStoreDetails(storeName: string): Promise<StoreDetails> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stores/details/${storeName}`, {
    // Optional caching control
    next: { revalidate: 60 }, // or cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch store details');
  }

  const data: StoreDetails = await res.json();
  return data;
}
