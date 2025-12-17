'use client';
import React from 'react';
import { useGetRunningOrdersQuery } from '@/lib/services/api';
import { Loader2, AlertCircle } from 'lucide-react';
import OngoingOrders from '../static/OngoingOrders';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

const MyOrders = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  
  const { data: orderData, isLoading, error } = useGetRunningOrdersQuery(
    { limit: 50, offset: 1 },
    { skip: !token }
  );

  const orders = orderData?.orders || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-gray-700 font-medium">Failed to load orders</p>
        <p className="text-gray-500 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return <OngoingOrders orders={orders} showHeader={true} />;
};

export default MyOrders;
