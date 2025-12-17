// 'use client';
// import React, { useState, useMemo } from 'react';
// import { useParams } from 'next/navigation';
// import {
//   FaCheckCircle, FaExclamationTriangle, FaClock,
//   FaFileAlt, FaMapMarkerAlt, FaCreditCard
// } from 'react-icons/fa';
// import Popup from '../reUse/PopUp';
// import TrackOrder from '../pop up content/order-track/TrackOrder';
// import { useGetCustomerOrderInfoQuery } from '@/lib/services/api';
// import dayjs from 'dayjs';

// const Complete = () => {
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const { orderId } = useParams();
//   const numericOrderId = Number(orderId);

//   const { data: order, isLoading, isError } = useGetCustomerOrderInfoQuery(numericOrderId, {
//     skip: isNaN(numericOrderId),
//   });

//   const parsedAddress = useMemo(() => {
//     if (!order?.delivery_address) return null;
//     try {
//       return JSON.parse(order.delivery_address);
//     } catch {
//       return null;
//     }
//   }, [order?.delivery_address]);

//   const handleAddClick = () => setIsPopupOpen(true);
//   const closePopup = () => setIsPopupOpen(false);

//   if (isLoading) {
//     return <div className="w-full h-screen flex justify-center items-center">Loading...</div>;
//   }

//   if (isError || !order) {
//     return <div className="w-full h-screen flex justify-center items-center">Failed to load order details.</div>;
//   }

//   return (
//     <div className='w-full min-h-screen flex justify-center items-center bg-[#F4F4F4] pt-[64px]'>
//       <div className='w-full max-w-[600px] space-y-6'>
//         {/* Success Message */}
//         <div className='text-center space-y-2'>
//           <FaCheckCircle className='text-green-500 text-4xl mx-auto' />
//           <h2 className='text-lg font-semibold'>Thank you for your order</h2>
//           <p className='text-sm text-gray-600'>Your order is confirmed and will be processed shortly.</p>
//         </div>

//         {/* OTP Notice */}
//         {order.otp && (
//           <div className='bg-[#FCDEDE] p-4 rounded-sm space-y-2'>
//             <div className='flex items-center space-x-2'>
//               <FaExclamationTriangle className='text-red-500' />
//               <h3 className='font-semibold'>Important Notice: Delivery OTP</h3>
//             </div>
//             <p className='text-2xl font-bold text-center text-[#FF4D4D]'>{order.otp}</p>
//             <p className='text-sm text-gray-600'>Please keep this safe. The rider will need it to verify delivery.</p>
//           </div>
//         )}

//         {/* Order Details */}
//         <div className='space-y-3 text-gray-700 bg-white px-3'>
//           <div className='flex justify-between border-b py-2 border-gray-200 text-[#574D4D] text-xs'>
//             <div className='flex items-center space-x-2'><FaClock /> <span>Order Date & Time</span></div>
//             <span>{dayjs(order.created_at).format('MMMM D, YYYY - h:mm A')}</span>
//           </div>
//           <div className='flex justify-between border-b py-2 border-gray-200 text-[#574D4D] text-xs'>
//             <div className='flex items-center space-x-2'><FaFileAlt /> <span>Order Number</span></div>
//             <span>#{order.id}</span>
//           </div>
//           <div className='flex justify-between border-b py-2 border-gray-200 text-[#574D4D] text-xs'>
//             <div className='flex items-center space-x-2'><FaMapMarkerAlt /> <span>Deliver to</span></div>
//             <span>{parsedAddress?.address || 'Not Available'}</span>
//           </div>
//           <div className='flex justify-between border-b py-2 border-gray-200 text-[#574D4D] text-xs'>
//             <div className='flex items-center space-x-2'><FaCreditCard /> <span>Paid with</span></div>
//             <span>{order.payment_method.replace('_', ' ')}</span>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className='space-y-3'>
//           <button className='w-full py-2 bg-[#DC2626] text-white rounded-sm cursor-pointer' onClick={handleAddClick}>Track your Order</button>
//           <button className='w-full py-2 text-gray-800 rounded-sm'>Go Home</button>
//         </div>
//       </div>

//       {isPopupOpen && (
//         <Popup
//           width='450px'
//           height='600px'
//           content={<TrackOrder  />}
//           onClose={closePopup}
//         />
//       )}
//     </div>
//   );
// };

// export default Complete;
