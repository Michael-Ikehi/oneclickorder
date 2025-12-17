'use client';
import React, { useState } from 'react';
import { CreditCard, Check, Wallet, Building2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setPaymentMethod } from '@/lib/store/paymentMethodSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import { StoreDetails } from '../landing-page/LandingPage';
import SavedCards from '../profile/SavedCards';
import CardDetails from '../profile/CardDetails';
import Popup from '../reUse/PopUp';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

interface PaymentProps {
  storeDetails: StoreDetails;
}

const PaymentMethod = ({ storeDetails }: PaymentProps) => {
  const dispatch = useDispatch();
  const selectedMethod = useSelector((state: RootState) => state.paymentMethod.selectedMethod);
  const [isSavedCardsPopupOpen, setIsSavedCardsPopupOpen] = useState(false);
  const [isCardDetailsPopupOpen, setIsCardDetailsPopupOpen] = useState(false);
  const timestamp = new Date().toLocaleString();

  const handleSelect = (method: 'paystack' | 'card' | 'paypal') => {
    dispatch(setPaymentMethod(method));
    dispatch(logActivity(`User selected ${method} as payment method at ${timestamp}`));
  };

  const isPaystack = storeDetails.zone_id === 5;

  const paymentOptions = isPaystack
    ? [{ id: 'paystack', label: 'Paystack', icon: Building2 }]
    : [
        { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
        { id: 'paypal', label: 'PayPal', icon: Wallet },
      ];

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedMethod ? 'bg-green-100' : 'bg-gray-100'}`}>
            <CreditCard className={`w-4 h-4 ${selectedMethod ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Payment Method</h2>
        </div>
        
        {selectedMethod === 'card' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSavedCardsPopupOpen(true)}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Saved Cards
            </button>
            <button
              onClick={() => setIsCardDetailsPopupOpen(true)}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Add Card
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMethod === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id as 'paystack' | 'card' | 'paypal')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </div>
              
              {isSelected && (
                <div className="w-5 h-5 bg-[#FF4D4D] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Saved Cards Popup */}
      {isSavedCardsPopupOpen && (
        <Popup
          width="500px"
          height="auto"
          content={
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Card</h3>
              <SavedCards onCardSelect={() => setIsSavedCardsPopupOpen(false)} />
            </div>
          }
          onClose={() => setIsSavedCardsPopupOpen(false)}
        />
      )}

      {/* Add Card Popup */}
      {isCardDetailsPopupOpen && (
        <Popup
          width="480px"
          height="auto"
          content={
            <div className="p-5">
              <Elements stripe={stripePromise}>
                <CardDetails onSuccess={() => setIsCardDetailsPopupOpen(false)} />
              </Elements>
            </div>
          }
          onClose={() => setIsCardDetailsPopupOpen(false)}
          mobileFullscreen={true}
        />
      )}
    </section>
    );
};

export default PaymentMethod;
