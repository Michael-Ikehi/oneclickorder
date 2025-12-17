import StoreMenuClient from './StoreMenuClient';

interface PageProps {
  params: Promise<{ storeName: string }>;
}

export default async function StoreHomePage({ params }: PageProps) {
  const { storeName } = await params;
  return <StoreMenuClient storeName={storeName} />;
}
