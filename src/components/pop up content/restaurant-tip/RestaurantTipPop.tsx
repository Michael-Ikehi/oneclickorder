// pop up content/restaurant tip/RestaurantTipPop.tsx
import { logActivity } from '@/lib/store/activityLogSlice';
import { setTipAmount } from '@/lib/store/restaurantTipSlice';
import React, { useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

const RestaurantTipPop = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState('');

  const timestamp = new Date().toLocaleString();

  const handleTip = () => {
    if (amount) {
      dispatch(logActivity(`User Added a tip of ${amount} at ${timestamp}`));
      dispatch(setTipAmount(Number(amount)));
      onClose();
    }
  };

  return (
    <div className="p-4 min-w-full max-w-md">
      <h1 className="text-md font-bold pb-2 border-b border-gray-200 mb-4">Tip The Store</h1>

      <div className="mb-4">
        <label htmlFor="tipAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Amount
        </label>
        <input
          type="number"
          id="tipAmount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex items-start gap-2 bg-[#A2FEFE] text-sm text-gray-800 p-3 rounded-md mb-4">
        <FaRegBell className="mt-1" />
        <span>This is an optional payment</span>
      </div>

      <button
        className="w-full bg-[#FF4D4D] text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
        onClick={handleTip}
      >
        Tip
      </button>
    </div>
  );
};

export default RestaurantTipPop;
