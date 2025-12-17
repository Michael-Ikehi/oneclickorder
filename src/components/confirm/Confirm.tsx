'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setLoading } from '@/lib/store/loadingSlice';
import { setOrderType } from '@/lib/store/orderTypeSlice';
import { StoreDetails } from '../landing-page/LandingPage';
import AddressDetail from './AddressDetail';
import PaymentMethod from './PaymentMethod';
import RestaurantTip from './RestaurantTip';
import Wallet from './Wallet';
import DiscountCode from './DiscountCode';
import { Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AddressDetailProps {
  storeDetails: StoreDetails;
}

const Confirm = ({ storeDetails }: AddressDetailProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const orderType = useSelector((state: RootState) => state.orderType?.orderType);
  const [selectedType, setSelectedType] = useState<string>(orderType || '');

  // Check store capabilities
  const hasDelivery = storeDetails.delivery;
  const hasPickup = storeDetails.take_away;

  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (orderType) {
      setSelectedType(orderType);
    }
  }, [orderType]);

  const handleSelectType = (type: 'delivery' | 'take_away') => {
    setSelectedType(type);
    dispatch(setOrderType(type));
  };

  return (
    <div className="py-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="space-y-4 md:mr-[9%]">
        {/* Order Type Section */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Order Type</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Delivery Option */}
            {hasDelivery && (
              <button
                onClick={() => handleSelectType('delivery')}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'delivery'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {selectedType === 'delivery' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF4D4D] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Image
                  src="/images/rider.svg"
                  alt="Delivery"
                  width={48}
                  height={48}
                  className="mb-2"
                />
                <span className={`font-medium ${selectedType === 'delivery' ? 'text-red-600' : 'text-gray-700'}`}>
                  Delivery
                </span>
              </button>
            )}

            {/* Pickup Option */}
            {hasPickup && (
              <button
                onClick={() => handleSelectType('take_away')}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'take_away'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {selectedType === 'take_away' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF4D4D] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Image
                  src="/images/pickup.svg"
                  alt="Pickup"
                  width={48}
                  height={48}
                  className="mb-2"
                />
                <span className={`font-medium ${selectedType === 'take_away' ? 'text-red-600' : 'text-gray-700'}`}>
                  Pickup
                </span>
              </button>
            )}
      </div>
        </section>

        {/* Delivery Address - Only show for delivery */}
        {selectedType === 'delivery' && (
          <AddressDetail storeDetails={storeDetails} />
        )}

        {/* Discount Code */}
        <DiscountCode storeDetails={storeDetails} />

        {/* Payment Method */}
        <PaymentMethod storeDetails={storeDetails} />

        {/* Wallet */}
        <Wallet storeDetails={storeDetails} />

        {/* Restaurant Tip */}
        <RestaurantTip />
      </div>
    </div>
  );
};

export default Confirm;
