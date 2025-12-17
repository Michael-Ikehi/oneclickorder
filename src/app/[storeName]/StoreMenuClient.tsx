'use client';
import React, { useEffect } from 'react';
import Basket from '@/components/landing-page/basket/Basket';
import LandingPage from '@/components/landing-page/LandingPage';
import { useGetStoreDetailsQuery } from '@/lib/services/api';
import { StoreDetails } from '@/components/landing-page/LandingPage';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '@/components/Loader';
import { setStoreParams, setStoreDetails } from '@/lib/store/storeParamsSlice';
import { clearBasket } from '@/lib/store/basketSlice';
import { RootState } from '@/lib/store/store';
import { clearSelectedCard } from '@/lib/store/selectedCardSlice';
import { clearSelectedAddress } from '@/lib/store/addressSlice';
import { clearOrderType } from '@/lib/store/orderTypeSlice';
import { clearOrderNote } from '@/lib/store/orderNoteSlice';
import { clearPaymentMethod } from '@/lib/store/paymentMethodSlice';
import { clearTipAmount } from '@/lib/store/restaurantTipSlice';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StoreMenuClientProps {
  storeName: string;
}

export default function StoreMenuClient({ storeName }: StoreMenuClientProps) {
  const dispatch = useDispatch();
  const { prevStoreName } = useSelector((state: RootState) => state.storeParams);

  const { data: storeDetails, isLoading, error, refetch } = useGetStoreDetailsQuery(storeName ?? '');

  // Get city/area from store details
  const city = storeDetails?.cityData?.slug;
  const area = storeDetails?.areaData?.slug;

  // Clear basket and related state when changing stores
  useEffect(() => {
    if (!storeName) return;
    if (prevStoreName && prevStoreName !== storeName) {
      dispatch(clearBasket());
      dispatch(clearSelectedCard());
      dispatch(clearSelectedAddress());
      dispatch(clearOrderType());
      dispatch(clearOrderNote());
      dispatch(clearPaymentMethod());
      dispatch(clearTipAmount());
    }

    // Set store params from fetched data
    if (city && area && storeName) {
      dispatch(setStoreParams({ city, area, storeName }));
    }
  }, [city, area, storeName, dispatch, prevStoreName]);

  // Store the store details in Redux for Header access
  useEffect(() => {
    if (storeDetails) {
      dispatch(setStoreDetails({
        id: storeDetails.id,
        name: storeDetails.name,
        logo: storeDetails.logo,
      }));
    }
  }, [storeDetails, dispatch]);

  // Loading State
  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Error State
  if (error || !storeDetails) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-light flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="font-heading text-xl font-bold text-secondary-900 mb-2">
            Unable to load store
          </h1>
          <p className="text-secondary-500 mb-6">
            We couldn&apos;t fetch the store details. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary inline-flex"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Type guard for store details
  const isValidStoreDetails = (data: unknown): data is StoreDetails => {
    const store = data as StoreDetails;
    return (
      typeof store === 'object' &&
      store !== null &&
      typeof store.id === 'number' &&
      typeof store.name === 'string' &&
      store.zone_currency?.currency_symbol !== undefined &&
      Array.isArray(store.items)
    );
  };

  if (!isValidStoreDetails(storeDetails)) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-heading text-xl font-bold text-secondary-900 mb-2">
            Invalid store data
          </h1>
          <p className="text-secondary-500">
            The store information is not available in the expected format.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Store Content - Main Area */}
      <main className="flex-1 w-full md:w-[75%]">
        <LandingPage storeDetails={storeDetails} />
      </main>

      {/* Sidebar Basket - Desktop Only */}
      <aside className="hidden md:block w-full md:w-[25%] max-w-[400px]">
        <div className="sticky top-[68px] h-[calc(100vh-68px)] overflow-hidden border-l border-border bg-white">
          <Basket storeDetails={storeDetails} />
        </div>
      </aside>
    </div>
  );
}

