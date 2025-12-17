'use client';

import Confirm from '@/components/confirm/Confirm';
import OrderSummary from '@/components/confirm/OrderSummary';
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams';
import { useGetStoreDetailsQuery } from '@/lib/services/api';
import { useParams } from 'next/navigation';
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
    <div className="w-full min-h-screen bg-gray-50">
      <div className="md:flex w-full min-h-screen">
        <div className="w-full md:w-[60%] lg:w-[65%] xl:w-[70%] px-4 md:px-6 lg:px-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Confirm storeDetails={storeDetails as any} />
        </div>
        <div className="md:w-[40%] lg:w-[35%] xl:w-[30%] bg-white border-l border-gray-200 shadow-lg">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <OrderSummary storeDetails={storeDetails as any} />
        </div>
      </div>
    </div>
  );
};

export default Page;
