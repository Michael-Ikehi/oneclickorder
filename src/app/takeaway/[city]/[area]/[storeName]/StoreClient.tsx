'use client';
import React, { useEffect } from 'react';
import StoreFeedPage from '@/components/feed/StoreFeedPage';
import { useGetStoreDetailsQuery } from '@/lib/services/api';
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

export interface CityData {
  id: number;
  city_id: number;
  country_id: number;
  name: string;
  slug: string;
  meta_description: string | null;
  meta_title: string | null;
  meta_image: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface AreaData {
  id: number;
  city_id: number;
  country_id: number;
  name: string;
  slug: string;
  meta_description: string;
  meta_title: string;
  meta_image: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface StoreClientProps {
  city: string;
  area: string;
  storeName: string;
}

export default function StoreClient({ city, area, storeName }: StoreClientProps) {
  const dispatch = useDispatch();
  const { prevStoreName } = useSelector((state: RootState) => state.storeParams);

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

    if (city && area && storeName) {
      dispatch(setStoreParams({ city, area, storeName }));
    }
  }, [city, area, storeName, dispatch, prevStoreName]);

  const { data: storeDetails, isLoading, error, refetch } = useGetStoreDetailsQuery(storeName ?? '');

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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Unable to load store
          </h1>
          <p className="text-gray-400 mb-6">
            We couldn&apos;t fetch the store details. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // URL validation
  const citySlugFromData = storeDetails.cityData?.slug;
  const areaSlugFromData = storeDetails.areaData?.slug;

  if (!city || !area || !storeName) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">
            Invalid URL
          </h1>
          <p className="text-gray-400">
            Missing required route parameters.
          </p>
        </div>
      </div>
    );
  }

  if (city !== citySlugFromData || area !== areaSlugFromData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Location Mismatch
          </h1>
          <p className="text-gray-400">
            This URL doesn&apos;t match the store&apos;s location.
          </p>
        </div>
      </div>
    );
  }

  // Render the Instagram-style feed
  return <StoreFeedPage store={storeDetails} />;
}
