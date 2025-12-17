'use client';
import { FaCheck } from 'react-icons/fa';
import Popup from '../reUse/PopUp';
import OrderTypePop from '../pop up content/confirm/OrderTypePop';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useMediaQuery } from 'react-responsive';
import BottomPopup from '../reUse/BottomPopup';
import { StoreDetails } from '../landing-page/LandingPage';

interface OrderProps {
  storeDetails: StoreDetails;
}

const OrderType = ({ storeDetails }: OrderProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const orderType = useSelector((state: RootState) => state.orderType.orderType);
  const isMobile = useMediaQuery({ maxWidth: 767 }); // Tailwind's md breakpoint

  const handleAddClick = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const displayOrderType = (type: string) => {
    const map: Record<string, string> = {
      take_away: 'Pick up',
      delivery: 'Delivery',
      dine_in: 'Eat In',
    };
    return map[type] || type;
  };

  return (
    <div className="mt-5 bg-white shadow-md rounded-sm px-4">
      <div className="flex items-center justify-between p-2 border-b border-gray-300">
        <div className="flex items-center gap-x-4">
          <FaCheck
            size={20}
            className={`text-white p-1 rounded-full ${orderType ? 'bg-green-400' : 'bg-[#FF4D4D]'}`}
          />
          <h1 className="text-lg text-[#141111] font-semibold leading-[150%]">Order Type</h1>
        </div>
        <p className="text-[#DC2626] cursor-pointer" onClick={handleAddClick}>
          Select
        </p>
      </div>

      <div className="flex flex-col p-2 gap-y-2">
        <h1 className="text-[#141111] font-semibold leading-[150%] text-md">
          {orderType ? displayOrderType(orderType) : 'No order type selected'}
        </h1>
      </div>

      {/* Conditional popup based on screen size */}
      {isPopupOpen && isMobile ? (
        <BottomPopup isOpen={isPopupOpen} onClose={closePopup}>
          <OrderTypePop onSelect={closePopup} storeDetails={storeDetails} />
        </BottomPopup>
      ) : isPopupOpen ? (
        <Popup
          width="600px"
          height="265px"
          content={<OrderTypePop onSelect={closePopup} storeDetails={storeDetails} />}
          onClose={closePopup}
        />
      ) : null}
    </div>
  );
};

export default OrderType;
