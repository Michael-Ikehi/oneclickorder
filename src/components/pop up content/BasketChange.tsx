'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { FaMapMarkerAlt } from 'react-icons/fa';

import { RootState } from '@/lib/store/store';
import { StoreDetails } from '../landing-page/LandingPage';
import SavedAddress from '../confirm/SavedAddress';
import Address from '../profile/Address';
import BottomPopup from '../reUse/BottomPopup';
import Popup from '../reUse/PopUp';
// import { setOrderTypeAndSchedule } from '@/lib/store/orderTypeSlice';

interface BasketChangeProps {
  storeDetails: StoreDetails;
}

const BasketChange = ({ storeDetails }: BasketChangeProps) => {
  const [popupType, setPopupType] = useState<'change' | 'add' | null>(null);

  const selectedAddress = useSelector((state: RootState) => state.address.selectedAddress);
  // const orderType = useSelector((state: RootState) => state.orderType.orderType);
  const token = useSelector((state: RootState) => state.auth.token);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleAddressClick = (type: 'change' | 'add') => setPopupType(type);
  const closeAddressPopup = () => setPopupType(null);

  // const displayOrderType = (type: string) => {
  //   const map: Record<string, string> = {
  //     take_away: 'Pick up',
  //     delivery: 'Delivery',
  //     dine_in: 'Eat In',
  //   };
  //   return map[type] || type;
  // };

  const renderAddressContent = () => {
    if (popupType === 'change') return <SavedAddress />;
    if (popupType === 'add') return <Address storeDetails={storeDetails} />;
    return null;
  };

  return (
    <div className="mt-5 space-y-5">
      {/* Address Section */}
      <div className="bg-white shadow-md rounded-sm px-4">
        <div className="flex items-center justify-between p-2 border-b border-gray-300">
          <div className="flex items-center gap-x-4">
            <FaMapMarkerAlt className="text-[#C1BCBC]" size={20} />
            <h1 className="text-lg text-[#141111] font-semibold leading-[150%]">Address</h1>
          </div>
          <div className="flex gap-x-4">
            {token ? (
              <>
                <p
                  className="text-[#DC2626] cursor-pointer"
                  onClick={() => handleAddressClick('change')}
                >
                  Select
                </p>
                <p
                  className="text-[#DC2626] cursor-pointer"
                  onClick={() => handleAddressClick('add')}
                >
                  Add New
                </p>
              </>
            ) : (
              <p className="text-red-500">Login to select</p>
            )}
          </div>
        </div>
        <div className="flex flex-col p-2 gap-y-2">
          <h1 className="text-[#141111] font-semibold leading-[150%] text-md">
            {selectedAddress?.name || 'No address selected'}
          </h1>
          <p className="text-[#9E9494] font-normal leading-[150%] text-sm">
            {selectedAddress ? `${selectedAddress.address} | ${selectedAddress.phone}` : ''}
          </p>
        </div>

        {popupType && isMobile ? (
          <BottomPopup isOpen={!!popupType} onClose={closeAddressPopup}>
            {renderAddressContent()}
          </BottomPopup>
        ) : popupType ? (
          <Popup
            width="600px"
            height={popupType === 'add' ? '300px' : '240px'}
            content={renderAddressContent()}
            onClose={closeAddressPopup}
          />
        ) : null}
      </div>

      {/* Order Type Section */}
      {/* Order Type Section */}
      {/* <div className="bg-white shadow-md rounded-sm px-4">
        <div className="flex items-center justify-between p-2 border-b border-gray-300">
          <div className="flex items-center gap-x-4">
            <FaListAlt className="text-[#C1BCBC]" size={20} />
            <h1 className="text-lg text-[#141111] font-semibold leading-[150%]">Order Type</h1>
          </div>
        </div>

        <div className="flex flex-col p-2 gap-y-2">
          <h1 className="text-[#141111] font-semibold leading-[150%] text-md">
            {orderType ? displayOrderType(orderType) : 'No order type selected'}
          </h1>

          <div className="mt-2 space-y-2 border-t pt-3 border-gray-200">
            {['delivery', 'take_away', 'dine_in'].map((type) => (
              <div
                key={type}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() =>
                  dispatch(
                    setOrderTypeAndSchedule({
                      orderType: type,
                    })
                  )
                }
              >
                <div
                  className={`w-5 h-5 rounded-full ${
                    orderType === type ? 'bg-[#FF4D4D]' : 'bg-gray-200'
                  }`}
                />
                <h1 className="text-[#141111] font-normal text-md">{displayOrderType(type)}</h1>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BasketChange;
