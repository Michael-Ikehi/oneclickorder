'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCreateActivityLogMutation, useGetCustomerOrderInfoQuery } from '@/lib/services/api';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { triggerRefetch } from '@/lib/store/refetchSlice';
import { useInitializeStoreParams } from '@/lib/hooks/useInitializeStoreParams';
import Loader from '@/components/Loader';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Hash, 
  MapPin, 
  Truck, 
  Home,
  Copy,
  Check,
  Package,
  CreditCard
} from 'lucide-react';

const Complete = () => {
  useInitializeStoreParams();
  const [otpCopied, setOtpCopied] = useState(false);
  const { orderId } = useParams();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);
  const [createActivityLog] = useCreateActivityLogMutation();
  const dispatch = useDispatch();
  const [hover, setHover] = useState(false)
  
  const {
    data: order,
    isLoading,
    isError,
  } = useGetCustomerOrderInfoQuery(orderId as string, {
    skip: typeof orderId !== 'string' || isNaN(Number(orderId)),
  });

  useEffect(() => {
    dispatch(triggerRefetch());
  }, [dispatch]);

  const logActivity = async () => {
    try {
      await createActivityLog({
        activity: `User Clicked on track order ${new Date().toLocaleString()}`,
      }).unwrap();
    } catch (error) {
      console.error('Failed to log activity', error);
    }
  };

  const parsedAddress = useMemo(() => {
    if (!order?.delivery_address) return null;
    try {
      return JSON.parse(order.delivery_address);
    } catch {
      return null;
    }
  }, [order?.delivery_address]);


  const copyOtp = async () => {
    if (order?.otp) {
      try {
        await navigator.clipboard.writeText(order.otp);
        setOtpCopied(true);
        setTimeout(() => setOtpCopied(false), 2000);
      } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = order.otp;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setOtpCopied(true);
        setTimeout(() => setOtpCopied(false), 2000);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-700';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-center mb-6">We couldn&apos;t find the details for this order.</p>
        <Link
          href={`/takeaway/${city}/${area}/${storeName}`}
          className="px-6 py-3 text-white rounded-xl font-medium hover:bg-red-700 transition-colors" style={{ backgroundColor: '#FF4D4D' }}
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const total = (order.order_amount || 0) + (order.delivery_charge || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">Thank you for your order. We&apos;re on it!</p>
        </div>

        {/* OTP Card */}
        {order.otp && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 mb-6 shadow-lg shadow-red-500/20">
            <div className="flex items-center gap-2 text-white/90 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Order Verification Code</span>
            </div>
            <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <span className="text-3xl font-bold text-white tracking-widest">{order.otp}</span>
              <button
                onClick={copyOtp}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-red-600 font-medium hover:bg-white/90 transition-colors"
              >
                {otpCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-white/80 text-sm mt-3">
              Share this code with your delivery person to verify your order.
            </p>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Order Details</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Order Number */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-600">Order Number</span>
              </div>
              <span className="font-semibold text-gray-900" style={{ color: '#111827' }}>#{order.id}</span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-600">Order Date</span>
              </div>
              <span className="font-medium text-gray-900 text-sm" style={{ color: '#111827' }}>
                {dayjs(order.created_at).format('MMM D, YYYY • h:mm A')}
              </span>
            </div>

            {/* Delivery Address */}
            {parsedAddress?.address && (
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-gray-600">Deliver To</span>
                </div>
                <span className="font-medium text-gray-900 text-sm text-right max-w-[180px]" style={{ color: '#111827' }}>
                  {parsedAddress.address}
                </span>
              </div>
            )}

            {/* Payment Status */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-600">Payment</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                {order.payment_status || 'Pending'}
              </span>
            </div>

            {/* Order Status */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-600">Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                {order.order_status || 'Processing'}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="p-5 bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-red-600">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/app"
            onClick={logActivity}
            className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-xl font-semibold hover:bg-[#FF4D4D] transition-colors shadow-lg shadow-red-500/20" style={{
              backgroundColor: hover ? '#E63939' : '#FF4D4D',
              color: hover ? 'white' : 'black',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Truck className="w-5 h-5" />
            Track Your Order
          </Link>

          <Link
            href={`/takeaway/${city}/${area}/${storeName}`}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Need help? <a href="https://www.foodhutz.co.uk/contact" className="text-red-500 hover:underline">Contact Support</a>
        </p>
      </div>

    </div>
  );
};

export default Complete;
