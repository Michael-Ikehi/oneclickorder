import { setOrderTypeAndSchedule } from '@/lib/store/orderTypeSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { StoreDetails } from '@/components/landing-page/LandingPage';

interface OrderTypePopProps {
  orderTypes?: string[];
  onSelect?: () => void;
  // scheduleOptions?: string[];
  storeDetails: StoreDetails;
}

const OrderTypePop: React.FC<OrderTypePopProps> = ({
  orderTypes = ['delivery', 'take_away', 'dine_in'],
  onSelect,
  storeDetails,
  // scheduleOptions = ['Now', 'Schedule time'],
}) => {
  const dispatch = useDispatch();
  const selectedOrderType = useSelector((state: RootState) => state.orderType.orderType);
  // const selectedSchedule = useSelector((state: RootState) => state.orderType.schedule);

  const handleOrderTypeChange = (type: string) => {
    dispatch(
      setOrderTypeAndSchedule({
        orderType: type,
        // schedule: selectedSchedule,
      })
    );
    onSelect?.();
  };

  // const handleScheduleChange = (schedule: string) => {
  //   dispatch(setOrderTypeAndSchedule({
  //     orderType: selectedOrderType,
  //     schedule,
  //   }));
  // };

  const getCircleClass = (isSelected: boolean) =>
    `w-5 h-5 rounded-full ${isSelected ? 'bg-[#FF4D4D]' : 'bg-gray-200'} cursor-pointer`;

  const displayOrderType = (type: string) => {
    const map: Record<string, string> = {
      take_away: 'Pick up',
      delivery: 'Delivery',
      dine_in: 'Eat In',
    };
    return map[type] || type;
  };
  const filteredOrderTypes = orderTypes.filter((type) => {
    if (type === 'delivery' && !storeDetails.delivery) return false;
    if (type === 'take_away' && !storeDetails.take_away) return false;
    if (type === 'dine_in' && storeDetails.dine_in_status !== 1) return false;
    return true;
  });

  return (
    <div className="px-3">
      <h1 className="text-[#141111] font-bold text-md">Order type</h1>

      <div className="mt-3 pb-2 border-b border-[#C1BCBC]">
        {filteredOrderTypes.map((type) => (
          <div
            key={type}
            className="flex items-center gap-3 cursor-pointer mt-2"
            onClick={() => handleOrderTypeChange(type)}
          >
            <div className={getCircleClass(selectedOrderType === type)} />
            <h1 className="text-[#141111] font-normal text-md">{displayOrderType(type)}</h1>
          </div>
        ))}
      </div>

      {/* 
      <div className='mt-7'>
        <div className='flex items-center gap-3'>
          <FaClock size={20} className='text-[#C1BCBC]' />
          <h1 className='text-[#141111] font-semibold text-md'>Order schedule</h1>
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          {scheduleOptions.map((schedule) => (
            <div
              key={schedule}
              className='flex items-center justify-between cursor-pointer'
              onClick={() => handleScheduleChange(schedule)}
            >
              <h1 className='text-[#141111] font-normal text-md'>{schedule}</h1>
              <div className={getCircleClass(selectedSchedule === schedule)} />
            </div>
          ))}
        </div>
      </div>
      */}
    </div>
  );
};

export default OrderTypePop;
