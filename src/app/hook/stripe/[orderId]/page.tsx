'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { stripePromise } from '@/lib/stripe';
import { useLazyStripePaymentSuccessQuery } from '@/lib/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { clearBasket } from '@/lib/store/basketSlice';
import { clearTipAmount } from '@/lib/store/restaurantTipSlice';
import { clearSelectedCard } from '@/lib/store/selectedCardSlice';
import { clearSelectedAddress } from '@/lib/store/addressSlice';
import { clearOrderType } from '@/lib/store/orderTypeSlice';
import { clearOrderNote } from '@/lib/store/orderNoteSlice';
import { clearPaymentMethod } from '@/lib/store/paymentMethodSlice';

export default function StripeCallbackPage() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processingMessage, setProcessingMessage] = useState('Processing your payment...');

  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);

  const clientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status'); // For 3DS redirects
  const [verifyStripePayment] = useLazyStripePaymentSuccessQuery();

  const dispatch = useDispatch();
  
  const clearAllOrderState = () => {
    dispatch(clearBasket());
    dispatch(clearSelectedCard());
    dispatch(clearSelectedAddress());
    dispatch(clearOrderType());
    dispatch(clearOrderNote());
    dispatch(clearPaymentMethod());
    dispatch(clearTipAmount());
  };

  useEffect(() => {
    (async () => {
      // Handle direct redirect status (from 3DS redirect flow)
      if (redirectStatus === 'succeeded') {
        setProcessingMessage('Payment verified! Redirecting...');
        try {
          await verifyStripePayment(orderId).unwrap();
        } catch (e) {
          console.error('Verification API error:', e);
        }
        clearAllOrderState();
        return router.replace(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
      }

      if (redirectStatus === 'failed') {
        return router.replace(
          `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=3ds_failed`
        );
      }

      // 1 – Missing client secret → failed (generic)
      if (!clientSecret) {
        return router.replace(
          `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=missing_client_secret`
        );
      }

      // 2 – Make sure Stripe.js really loaded
      const stripe = await stripePromise;
      if (!stripe) {
        return router.replace(
          `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=stripe_unavailable`
        );
      }

      // 3 – Ask Stripe for the PaymentIntent status
      setProcessingMessage('Verifying payment status...');
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

      // 3a – Stripe returned an error
      if (error || !paymentIntent) {
        return router.replace(
          `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=stripe_api_error`
        );
      }

      // 3b – Succeeded 🎉
      if (paymentIntent.status === 'succeeded') {
        setProcessingMessage('Payment successful! Redirecting...');
        try {
          await verifyStripePayment(orderId).unwrap();
        } catch (e) {
          console.error('Verification API error:', e);
        }
        clearAllOrderState();
        return router.replace(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
      }

      // 3c – 3DS Required - attempt to confirm payment
      if (paymentIntent.status === 'requires_action') {
        setProcessingMessage('Completing 3D Secure verification...');
        const { paymentIntent: confirmedIntent, error: confirmError } = 
          await stripe.confirmCardPayment(clientSecret);
        
        if (confirmError) {
          return router.replace(
            `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=3ds_verification_failed`
          );
        }

        if (confirmedIntent?.status === 'succeeded') {
          setProcessingMessage('Payment successful! Redirecting...');
          try {
            await verifyStripePayment(orderId).unwrap();
          } catch (e) {
            console.error('Verification API error:', e);
          }
          clearAllOrderState();
          return router.replace(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
        }
      }

      // 3d – Anything else is a "soft-fail"
      router.replace(
        `/takeaway/${city}/${area}/${storeName}/failed/${orderId}?reason=${paymentIntent.status}`
      );
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, redirectStatus, orderId, router, city, area, storeName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="animate-spin h-8 w-8 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900">{processingMessage}</p>
        <p className="text-sm text-gray-500 mt-2">Please don&apos;t close this window</p>
      </div>
    </div>
  );
}
