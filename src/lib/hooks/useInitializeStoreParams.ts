'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStoreParams } from '@/lib/store/storeParamsSlice';
import { RootState } from '@/lib/store/store';

export const useInitializeStoreParams = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);

  useEffect(() => {
    if (
      (!city || !area || !storeName) &&
      typeof params.city === 'string' &&
      typeof params.area === 'string' &&
      typeof params.storeName === 'string'
    ) {
      dispatch(
        setStoreParams({
          city: params.city,
          area: params.area,
          storeName: params.storeName,
        })
      );
    }
  }, [params, city, area, storeName, dispatch]);
};
