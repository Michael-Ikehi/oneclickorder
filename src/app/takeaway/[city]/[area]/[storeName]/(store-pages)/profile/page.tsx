'use client';

import React from 'react';
import Profile from '@/components/profile/Profile';
import { useGetStoreDetailsQuery } from '@/lib/services/api';
import { useParams } from 'next/navigation';
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams';
import Loader from '@/components/Loader';

const Page = () => {
  useInitializeStoreParams();
  const { storeName } = useParams() as { storeName: string };
  const { data: storeDetails, isLoading, error } = useGetStoreDetailsQuery(storeName);

  if (!storeName) return <p className="min-h-screen mt-[15%]">Store not found.</p>;
  if (isLoading) return <Loader fullScreen />;
  if (error) return <p className="min-h-screen mt-[15%]">Failed to load store details.</p>;
  if (!storeDetails) return <p className="min-h-screen mt-[15%]">Store details not found.</p>;
  return (
    <div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Profile storeDetails={storeDetails as any} />
    </div>
  );
};

export default Page;
