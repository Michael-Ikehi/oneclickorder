'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { use } from 'react';
import { useLazyVerifyPaystackPaymentQuery } from '@/lib/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { clearBasket } from '@/lib/store/basketSlice';
import { clearTipAmount } from '@/lib/store/restaurantTipSlice';
import { clearSelectedCard } from '@/lib/store/selectedCardSlice';
import { clearSelectedAddress } from '@/lib/store/addressSlice';
import { clearOrderType } from '@/lib/store/orderTypeSlice';
import { clearOrderNote } from '@/lib/store/orderNoteSlice';
import { clearPaymentMethod } from '@/lib/store/paymentMethodSlice';

const PaystackCallbackPage = ({ params }: { params: Promise<{ orderId: string }> }) => {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);
  const trxref = searchParams.get('trxref');
  const reference = searchParams.get('reference');

  const [verifyPayment] = useLazyVerifyPaystackPaymentQuery();
  const dispatch = useDispatch();
  useEffect(() => {
    const verify = async () => {
      if (orderId && trxref && reference) {
        try {
          const res = await verifyPayment(orderId).unwrap();

          if (
            res.message === 'Verification successful' ||
            (typeof res.data === 'object' &&
              res.data !== null &&
              'status' in res.data &&
              (res.data as { status?: string }).status === 'success')
          ) {
            dispatch(clearBasket());
            dispatch(clearSelectedCard());
            dispatch(clearSelectedAddress());
            dispatch(clearOrderType());
            dispatch(clearOrderNote());
            dispatch(clearPaymentMethod());
            dispatch(clearTipAmount());
            router.push(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
          } else {
            console.error('Payment not successful:', res.message);
            router.push(`/takeaway/${city}/${area}/${storeName}/failed`);
          }
        } catch (error) {
          console.error('Verification failed:', error);
          // Optionally show user-friendly error
        }
      }
    };

    verify();
  }, [orderId, trxref, reference, verifyPayment, router, storeName, city, area]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-semibold">Processing your payment...</p>
    </div>
  );
};

export default PaystackCallbackPage;
