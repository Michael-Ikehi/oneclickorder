'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  useCreate3DSPaymentIntentMutation,
  useCreateActivityLogMutation,
  useGetCustomerInfoQuery,
  useGetDistanceDataQuery,
  useLazyInitiatePaystackPaymentQuery,
  useLazyStripePaymentIntentQuery,
  usePlaceCustomerOrderMutation,
} from '@/lib/services/api';
import { StoreDetails } from '../landing-page/LandingPage';
import OrderSummaryView from './OrderSummaryView';
import { stripePromise } from '@/lib/stripe';
import { Coupon, getDeliveryFee } from '../reUse/getDeliveryFee';
import { PaymentRequestError } from '@/lib/services/apiTypes';
import { useRouter } from 'next/navigation';

import { clearActivities, logActivity } from '@/lib/store/activityLogSlice';
import { clearBasket } from '@/lib/store/basketSlice';
import { clearTipAmount } from '@/lib/store/restaurantTipSlice';
import { clearSelectedCard } from '@/lib/store/selectedCardSlice';
import { clearSelectedAddress } from '@/lib/store/addressSlice';
import { clearOrderType } from '@/lib/store/orderTypeSlice';
import { clearOrderNote } from '@/lib/store/orderNoteSlice';
import { clearPaymentMethod } from '@/lib/store/paymentMethodSlice';

const OrderSummaryLogic = ({ storeDetails }: { storeDetails: StoreDetails }) => {
  const [triggerStripeIntent] = useLazyStripePaymentIntentQuery();
  const [create3DSPaymentIntent] = useCreate3DSPaymentIntentMutation();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [is3DSProcessing, setIs3DSProcessing] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const basketItems = useSelector((state: RootState) => state.basket.items);
  
  // Get coupon from Redux
  const appliedCoupon = useSelector((state: RootState) => state.coupon.appliedCoupon);
  const coupon = appliedCoupon?.code || '';
  const validCouponData: Coupon | undefined = appliedCoupon ? {
    discount: appliedCoupon.discount,
    discount_type: appliedCoupon.discount_type,
    min_purchase: appliedCoupon.min_purchase,
    order_type: appliedCoupon.order_type,
  } : undefined;
  const restaurantTip = useSelector((state: RootState) => state.restaurantTip.amount);
  const paymentMethod = useSelector((state: RootState) => state.paymentMethod.selectedMethod);
  const selectedCardId = useSelector((state: RootState) => state.selectedCard.cardId);
  // NEW: Get setup intent ID for 3DS payments
  const setupIntentId = useSelector((state: RootState) => state.selectedCard.setupIntentId);
  const addressMethod = useSelector((state: RootState) => state.address.selectedAddress);
  const orderMethod = useSelector((state: RootState) => state.orderType?.orderType)?.toLowerCase();
  const orderNoticeMethod = useSelector((state: RootState) => state.orderNote.note) as string;
  const activityLogs = useSelector((state: RootState) => state.activityLog.logs);
  const [createActivityLog] = useCreateActivityLogMutation();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);

  const { data: distanceData, error: distanceError } = useGetDistanceDataQuery({
    destination_lat: storeDetails.latitude ? Number(storeDetails?.latitude) : 0,
    destination_lng: storeDetails.longitude ? Number(storeDetails?.longitude) : 0,
    origin_lat: addressMethod?.latitude ? Number(addressMethod.latitude) : 0,
    origin_lng: addressMethod?.longitude ? Number(addressMethod.longitude) : 0,
    mode: 'driving',
  });

  const [triggerPayment, { isFetching }] = useLazyInitiatePaystackPaymentQuery();
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceCustomerOrderMutation();
  const { data: customerInfo } = useGetCustomerInfoQuery();
  const dispatch = useDispatch();
  const walletBalance = customerInfo?.wallet_balance;
  const walletCurrency = customerInfo?.user_currency_symbol;
  const storeCurrency = storeDetails?.zone_currency?.currency_symbol;

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [orderError, setOrderError] = useState<string | null>(null);

  const totalItems = basketItems.reduce(
    (acc, item) => acc + item.quantity + (item.freeQuantity ?? 0),
    0
  );

  const totalPrice = basketItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const timestamp = new Date().toLocaleString();

  let discountAmount = 0;
  if (validCouponData) {
    const { discount_type, discount } = validCouponData;

    if (discount_type === 'percent') {
      discountAmount = (discount / 100) * totalPrice;
    } else if (discount_type === 'amount') {
      discountAmount = discount;
    }
  }
  discountAmount = Math.min(discountAmount, totalPrice);

  const distance = !distanceError
    ? (distanceData?.rows?.[0]?.elements?.[0]?.distance?.value ?? 0)
    : 0;
  const distanceInMiles = distance / 1609.34;
  const distanceInKm = distance / 1000;
  const distanceUnit = storeDetails?.zone_data?.distance_in?.toLowerCase();
  const finalDistance = parseFloat(
    (distanceUnit === 'miles' ? distanceInMiles : distanceInKm).toFixed(2)
  );
  //delivery charge logic
  const deliveryFee =
    storeDetails && distance && orderMethod === 'delivery'
      ? getDeliveryFee(storeDetails, distance, validCouponData)
      : 0;

  const serviceCharge = Number(storeDetails.zone_service_charge ?? 0);

  const customFee = parseFloat(storeDetails.custom_fee_amount ?? '');
  const validCustomFee = isNaN(customFee) ? 0 : customFee;

  const isWalletCurrencyValid = walletCurrency === storeCurrency;
  const hasWalletCredit = (walletBalance ?? 0) > 0 && isWalletCurrencyValid;
  const walletCreditAmount = hasWalletCredit ? walletBalance! : 0;

  const totalWithTip =
    Number(totalPrice) +
    Number(deliveryFee) +
    Number(serviceCharge) +
    Number(validCustomFee) +
    Number(restaurantTip ?? 0);

  const rawFinalTotal = totalWithTip - discountAmount;
  // const finalTotal = hasWalletCredit
  //   ? Math.max(0, rawFinalTotal - walletCreditAmount)
  //   : rawFinalTotal;

  const buildOrderPayload = () => {
    const formattedCart = basketItems.map((item) => ({
      item_id: item.id,
      item_campaign_id: null,
      variant: '',
      price: item.price.toString(),
      quantity: item.quantity,
      variation: item.variations,
      add_on_ids: item.addons?.map((addon: { id: number }) => addon.id) ?? [],
      add_on_qtys: item.addons?.map(() => item.quantity) ?? [],
      add_ons: item.addons ?? [],
    }));

    const payload = {
      cart: JSON.stringify(formattedCart),
      coupon_discount_amount: discountAmount,
      distance: finalDistance,
      schedule_at: null,
      order_amount: rawFinalTotal,
      order_note: orderNoticeMethod,
      order_type: orderMethod,
      payment_method: 'digital_payment',
      coupon_code: coupon?.trim() !== '' ? coupon.trim() : null,
      store_id: storeDetails.id,
      delivery_charge: orderMethod === 'delivery' ? deliveryFee : 0,
      address: addressMethod?.address ?? '',
      latitude: addressMethod?.latitude ?? 0,
      longitude: addressMethod?.longitude ?? 0,
      address_type: addressMethod?.address_type ?? '',
      contact_person_name: addressMethod?.name ?? '',
      contact_person_number: addressMethod?.phone ?? '',
      street_number: addressMethod?.street_number ?? '',
      house: addressMethod?.house ?? '',
      floor: addressMethod?.floor ?? '',
      discount_amount: discountAmount ?? 0,
      tax_amount: 0,
      receiver_details: null,
      store_tips: restaurantTip ?? 0,
      cutlery: 0,
      unavailable_item_note: null,
      delivery_instruction: null,
      service_charge: serviceCharge,
      partial_payment: hasWalletCredit ? 1 : 0,
      wallet_credit: hasWalletCredit ? Math.min(walletCreditAmount, rawFinalTotal) : 0,
      moduleId: storeDetails.module_id ?? null,
      zoneId: storeDetails.zone_id,
      payment_method_id: paymentMethod === 'card' ? selectedCardId : undefined,
    };

    if (paymentMethod === 'card') {
      payload.payment_method_id = selectedCardId;
    }

    return payload;
  };

  const handlePlaceOrder = async () => {
    const errors: string[] = [];

    if (!storeDetails.active) {
      setOrderError('This store is temporarily unavailable. Please try again later.');
      return;
    }
    if (!storeDetails.open) {
      setOrderError('This store is currently closed. Please check back during opening hours.');
      return;
    }
    if (!paymentMethod) errors.push('Please select a payment method.');
    if (paymentMethod === 'card' && !selectedCardId) {
      errors.push('Please select a card or add a new one.');
    }
    if (!orderMethod) errors.push('Please select an order type.');
    if (!addressMethod && orderMethod === 'delivery')
      errors.push('Please select a delivery address.');
    if (validCouponData?.min_purchase && totalPrice < validCouponData.min_purchase) {
      setFormErrors(['Coupon no longer valid. Minimum purchase not met.']);
      return;
    }
    if (rawFinalTotal < 0) {
      setOrderError('Total amount is invalid. Please review your order.');
      return;
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    try {
      const payload = buildOrderPayload();
      //   if (!payload.order_amount || isNaN(payload.order_amount)) {
      //   console.error('Invalid order_amount in payload:', payload.order_amount);
      //   setOrderError('Something went wrong: order amount is missing or invalid.');
      //   return;
      // }
      const response = await placeOrder(payload).unwrap();

      const orderId = response.order?.id;
      if (!orderId) {
        throw new Error('No order ID returned from order placement');
      }
      try {
        // Send each activity log
        await Promise.all(activityLogs.map((activity) => createActivityLog({ activity }).unwrap()));

        // Clear the activity logs after successful send
        dispatch(clearActivities());
      } catch (error) {
        console.error('Failed to send activity logs:', error);
      }

      const host = window.location.origin;

      const intentResponse = await triggerStripeIntent({ orderId, host }).unwrap();
      const clientSecret = intentResponse.intent_client_secret;

      if (!clientSecret) {
        throw new Error('No client secret returned from PaymentIntent');
      }
      if (paymentMethod === 'paypal') {
        const stripe = await stripePromise;
        setIsRedirecting(true);
        const result = await stripe?.confirmPayPalPayment(clientSecret, {
          return_url: `${host}/hook/stripe/${orderId}`,
        });

        if (result?.error) {
          console.error('Stripe PayPal payment error:', result.error.message);
          setOrderError(result.error.message || 'PayPal payment failed');
          setIsRedirecting(false);
          return;
        }

        return;
      }

      // Paystack flow
      if (paymentMethod === 'paystack') {
        try {
          setIsRedirecting(true);
          const host = window.location.origin;
          const paystackResponse = await triggerPayment({ orderId, host }).unwrap();

          const authorizationUrl = paystackResponse.data?.data?.authorization_url;
          if (authorizationUrl) {
            window.location.href = authorizationUrl;
          } else {
            throw new Error('No authorization URL returned from Paystack');
          }
        } catch (e) {
          const error = e as PaymentRequestError;

          const apiErrorMessage = error?.data?.errors?.[0]?.message;
          setOrderError(apiErrorMessage || '');
          setIsRedirecting(false);
        }
      }

      // NEW: 3D Secure Card Payment Flow
      if (paymentMethod === 'card') {
        setIsRedirecting(true);
        
        // Check if we have a setup_intent_id (card saved with 3DS)
        if (!setupIntentId) {
          setOrderError('Please add a card first. Your saved card may need to be re-added for secure payments.');
          setIsRedirecting(false);
          return;
        }

        try {
          // Get store currency (default to GBP)
          const currency = storeDetails?.zone_currency?.currency?.toLowerCase() || 'gbp';
          
          // Create 3DS Payment Intent
          const paymentIntentResponse = await create3DSPaymentIntent({
            amount: rawFinalTotal,
            currency: currency,
            setup_intent_id: setupIntentId,
          }).unwrap();

          if (!paymentIntentResponse.success) {
            throw new Error(paymentIntentResponse.message || 'Failed to create payment');
          }

          const { status, client_secret } = paymentIntentResponse.data;

          // Handle payment status
          if (status === 'succeeded') {
            // Payment completed without 3DS - success!
            dispatch(clearBasket());
            dispatch(clearSelectedCard());
            dispatch(clearSelectedAddress());
            dispatch(clearOrderType());
            dispatch(clearOrderNote());
            dispatch(clearPaymentMethod());
            dispatch(clearTipAmount());
            router.push(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
            return;
          }

          if (status === 'requires_action') {
            // 3DS verification required - show bank popup
            setIs3DSProcessing(true);
            const stripe = await stripePromise;
            
            if (!stripe) {
              throw new Error('Stripe not loaded');
            }

            const { paymentIntent, error } = await stripe.confirmCardPayment(client_secret);
            setIs3DSProcessing(false);

            if (error) {
              setOrderError(error.message || '3D Secure verification failed');
              setIsRedirecting(false);
              return;
            }

            if (paymentIntent?.status === 'succeeded') {
              // 3DS completed successfully!
              dispatch(clearBasket());
              dispatch(clearSelectedCard());
              dispatch(clearSelectedAddress());
              dispatch(clearOrderType());
              dispatch(clearOrderNote());
              dispatch(clearPaymentMethod());
              dispatch(clearTipAmount());
              router.push(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
              return;
            }

            // Payment didn't succeed after 3DS
            setOrderError(`Payment status: ${paymentIntent?.status}. Please try again.`);
            setIsRedirecting(false);
            return;
          }

          if (status === 'requires_payment_method') {
            // Card was declined or not valid
            setOrderError('Your card was declined. Please try a different card.');
            setIsRedirecting(false);
            return;
          }

          // Unknown status
          setOrderError(`Unexpected payment status: ${status}`);
          setIsRedirecting(false);
          return;
        } catch (error) {
          setIs3DSProcessing(false);
          setIsRedirecting(false);
          if (error instanceof Error) {
            setOrderError(error.message);
          } else {
            setOrderError('Payment failed. Please try again.');
          }
          return;
        }
      }

      setOrderError(null);
    } catch (e) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'data' in e &&
        typeof (e as { data: unknown }).data === 'object' &&
        e.data !== null
      ) {
        const errData = (e as { data: Record<string, unknown> }).data;

        if (
          'message' in errData &&
          typeof errData.message === 'string' &&
          'order_id' in errData &&
          typeof errData.order_id === 'number'
        ) {
          setOrderError(`${errData.message} (Order ID: ${errData.order_id})`);
        } else if (
          'errors' in errData &&
          Array.isArray(errData.errors) &&
          typeof errData.errors[0]?.message === 'string'
        ) {
          setOrderError(errData.errors[0].message);
        } else {
          setOrderError('An unknown API error occurred');
        }
      } else {
        console.error('Unexpected error format:', e);
        setOrderError('An unexpected error occurred');
      }
    } finally {
      setIsRedirecting(false);
    }
  };

  const handlePlaceOrderClick = () => {
    const errors: string[] = [];

    // Validations
    if (!paymentMethod) errors.push('Please select a payment method.');
    if (paymentMethod === 'card' && !selectedCardId) {
      errors.push('Please select a card or add a new one.');
    }
    if (!orderMethod) errors.push('Please select an order type.');
    if (!addressMethod && orderMethod === 'delivery')
      errors.push('Please select a delivery address.');

    if (errors.length > 0) {
      setFormErrors(errors); // show errors somewhere in your UI
      return; //  do NOT show popup if there are errors
    }

    setFormErrors([]); // clear previous errors

    // Only show popup if order type is delivery
    if (orderMethod === 'delivery') {
      setShowAddressPopup(true);
    } else {
      handlePlaceOrder(); // pickup orders go straight through
    }
  };

  const handleConfirmAddress = () => {
    setShowAddressPopup(false);
    handlePlaceOrder();
  };

  const handleCancelAddress = () => {
    setShowAddressPopup(false);
  };

  useEffect(() => {
    if (isRedirecting) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isRedirecting]);
  const closePopup = () => {
    setShowAddressPopup(false);
  };
  return (
    <OrderSummaryView
      totalItems={totalItems}
      totalPrice={totalPrice}
      deliveryFee={deliveryFee}
      restaurantTip={restaurantTip}
      rawFinalTotal={rawFinalTotal}
      discountAmount={discountAmount}
      paymentMethod={paymentMethod}
      isFetching={isFetching}
      isPlacingOrder={isPlacingOrder}
      handlePlaceOrder={handlePlaceOrder}
      storeDetails={storeDetails}
      formErrors={formErrors}
      orderError={orderError}
      serviceCharge={serviceCharge}
      validCustomFee={validCustomFee}
      validCouponData={validCouponData}
      orderMethod={orderMethod}
      walletBalance={hasWalletCredit ? walletCreditAmount : undefined}
      isRedirecting={isRedirecting}
      is3DSProcessing={is3DSProcessing}
      showAddressPopup={showAddressPopup}
      closePopup={closePopup}
      handleConfirmAddress={handleConfirmAddress}
      handleCancelAddress={handleCancelAddress}
      onPlaceOrderClick={handlePlaceOrderClick}
      addressMethod={addressMethod?.address}
    />
  );
};

export default OrderSummaryLogic;
