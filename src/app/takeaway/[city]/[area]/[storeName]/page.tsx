import StoreClient from './StoreClient';

interface PageProps {
  params: Promise<{
    city: string;
    area: string;
    storeName: string;
  }>;
}

export default async function Page({ params: paramPromise }: PageProps) {
  const params = await paramPromise;
  return (
      <StoreClient city={params.city} area={params.area} storeName={params.storeName} />
  );
}
