'use client';
import React, { useState } from 'react';
import { Heart, ChevronRight, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { clearTipAmount } from '@/lib/store/restaurantTipSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import Popup from '../reUse/PopUp';
import RestaurantTipPop from '../pop up content/restaurant-tip/RestaurantTipPop';

const RestaurantTip = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const tipAmount = useSelector((state: RootState) => state.restaurantTip.amount);
  const dispatch = useDispatch();
  const timestamp = new Date().toLocaleString();

  const handleAddClick = () => {
    dispatch(logActivity(`User clicked on Add tip at ${timestamp}`));
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleCancelTip = () => {
    dispatch(clearTipAmount());
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tipAmount ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <Heart className={`w-4 h-4 ${tipAmount ? 'text-pink-500 fill-pink-500' : 'text-gray-500'}`} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Tip Restaurant</h2>
            {tipAmount ? (
              <p className="text-sm text-pink-600 font-medium">£{tipAmount} tip added</p>
            ) : (
              <p className="text-sm text-gray-500">Show your appreciation (optional)</p>
            )}
          </div>
        </div>
        
        {tipAmount ? (
          <button
            onClick={handleCancelTip}
            className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-sm"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        ) : (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Add Tip
            <ChevronRight className="w-4 h-4" />
            </button>
        )}
      </div>

      {isPopupOpen && (
        <Popup
          width="420px"
          height="auto"
          content={
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Tip</h3>
              <RestaurantTipPop onClose={closePopup} />
            </div>
          }
          onClose={closePopup}
        />
      )}
    </section>
  );
};

export default RestaurantTip;
