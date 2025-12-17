'use client';
import React, { useEffect, useMemo, useState } from 'react';
// import { Check } from 'lucide-react';
import { useGetCustomerOrderInfoQuery } from '@/lib/services/api';
import { Check } from 'lucide-react';

type Props = {
  orderId: string;
  otp: string;
};

type StatusStep =
  | 'orderPlaced'
  | 'orderAccepted'
  | 'preparingYourOrder'
  | 'ready'
  | 'pickedUp'
  | 'delivered'
  | 'cancelled';

const statusSteps: StatusStep[] = [
  'orderPlaced',
  'orderAccepted',
  'preparingYourOrder',
  'ready',
  'pickedUp',
  'delivered',
  'cancelled',
];

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

const mapStatus = (status: string): StatusStep => {
  const map: Record<string, StatusStep> = {
    pending: 'orderPlaced',
    confirmed: 'orderAccepted',
    processing: 'preparingYourOrder',
    handover: 'ready',
    picked_up: 'pickedUp',
    delivered: 'delivered',
    canceled: 'cancelled',
  };

  if (status in map) {
    return map[status];
  }

  return 'orderPlaced';
};

const TrackOrder = ({ orderId, otp }: Props) => {
  const [enabled] = useState(true);
  const { data: order, refetch } = useGetCustomerOrderInfoQuery(orderId, {
    skip: !enabled,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const currentStatus = useMemo(
    () => (order ? mapStatus(order.order_status) : 'orderPlaced'),
    [order]
  );
  const currentIndex = statusSteps.indexOf(currentStatus);

  const statusTimestamps = useMemo(
    () => ({
      orderPlaced: order?.pending,
      orderAccepted: order?.confirmed,
      preparingYourOrder: order?.processing,
      ready: order?.handover,
      pickedUp: order?.picked_up,
      delivered: order?.delivered,
      cancelled: order?.canceled,
    }),
    [order]
  );

  const isCancelled = !!order?.canceled;

  const isCompleted = (index: number) =>
    index <= currentIndex && (!isCancelled || statusSteps[index] === 'cancelled');

  const stepDescriptions = useMemo(() => {
    const isTakeAway = order?.order_type === 'take_away';

    return {
      orderPlaced: 'We have received your order.',
      orderAccepted: 'Your order has been confirmed.',
      preparingYourOrder: 'Preparing your delicious meal.',
      ready: 'Order is ready for pickup.',
      pickedUp: isTakeAway ? 'Order has been handed over' : 'Rider has picked up your order',
      delivered: 'Enjoy your meal!',
      cancelled: 'This order was cancelled.',
    };
  }, [order?.order_type]);

  if (!order) return <div>Loading order info...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Ongoing Orders</h2>
      <hr className="border-gray-300 mb-4" />
      <div className="flex justify-between text-sm mb-1">
        <span>Order ID</span>
        <span className="font-medium">FH{orderId}</span>
      </div>
      <div className="flex justify-between text-sm mb-4">
        <span>Order OTP</span>
        <span className="font-semibold text-lg text-[#FF4D4D]">{otp}</span>
      </div>
      <hr className="border-gray-300 mb-4" />

      <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
      <div className=" ml-4 pl-4">
        {statusSteps.map((step, index) => {
          if (step === 'cancelled' && !isCancelled) return null;

          const completed = isCompleted(index);
          const isLast =
            index === statusSteps.length - 1 ||
            (statusSteps[index + 1] === 'cancelled' && !isCancelled);

          return (
            <div key={step} className="relative flex gap-4 pb-8 last:pb-0">
              <div className="relative">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    completed ? 'bg-[#FF4D4D] border-[#FF4D4D]' : 'border-gray-400 bg-white'
                  } text-white text-xs absolute -left-[1.2rem] top-0`}
                >
                  {completed && <Check className="w-4 h-4" />}
                </div>

                {!isLast && (
                  <div
                    className={`absolute top-5 left-[0.25rem] w-px h-[calc(100%-1.25rem)] ${
                      isCompleted(index + 1) ? 'bg-[#FF4D4D]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              <div>
                <span
                  className={`text-sm bg-[#7C6F6F] rounded-sm py-2 px-1 font-semibold capitalize ${completed ? 'text-white' : 'text-gray-400'}`}
                >
                  {step}
                </span>
                <p className={`text-xs mt-1 ${completed ? 'text-gray-700' : 'text-gray-400'}`}>
                  {stepDescriptions[step]}
                </p>
                {statusTimestamps[step] && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {formatTime(statusTimestamps[step]!)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-black font-semibold">
        <p>To get a live track, download our app:</p>
        <div className="flex gap-3 mt-3">
          <a
            href="https://play.google.com/store/apps/details?id=com.foodhutz.users"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-12"
            />
          </a>
          <a
            href="https://apps.apple.com/ng/app/foodhutz/id6446799967"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-12"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
