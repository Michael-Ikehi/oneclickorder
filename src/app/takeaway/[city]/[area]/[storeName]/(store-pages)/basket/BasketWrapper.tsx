'use client';

import Basket from '@/components/landing-page/basket/Basket';
import { useGetStoreDetailsQuery } from '@/lib/services/api';
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams';
import Loader from '@/components/Loader';
import { AlertCircle } from 'lucide-react';
const BasketWrapper = ({ storeName }: { storeName: string }) => {
  useInitializeStoreParams();
  const { data: storeDetails, isLoading, error } = useGetStoreDetailsQuery(storeName);

  if (isLoading) return <Loader fullScreen />;
  if (error || !storeDetails) return <div className="flex-1 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">
        Error loading store details
      </h1>
    </div>
  </div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Basket storeDetails={storeDetails as any} />;
};

export default BasketWrapper;
