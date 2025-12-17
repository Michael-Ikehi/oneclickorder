'use client';
import { useCreate3DSSetupIntentMutation, useSaveStripeCardMutation, useGetStripeCardsQuery } from '@/lib/services/api';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from "react";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/lib/hooks';
import { setSelectedCard } from '@/lib/store/selectedCardSlice';
import { CreditCard, Lock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

type CardDetailsProps = {
  onSuccess?: (cardId: string) => void;
};

const stripeElementStyle = {
  base: {
    fontSize: '16px',
    color: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    '::placeholder': {
      color: '#9ca3af',
    },
  },
  invalid: {
    color: '#FF4D4D',
    iconColor: '#FF4D4D',
  },
};

const CardDetails: React.FC<CardDetailsProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [is3DSProcessing, setIs3DSProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [create3DSSetupIntent] = useCreate3DSSetupIntentMutation();
  const [saveStripeCard] = useSaveStripeCardMutation();
  const { refetch: refetchCards } = useGetStripeCardsQuery();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    cardholderName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    state: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  function isSerializedError(error: unknown): error is SerializedError {
    return typeof error === 'object' && error !== null && 'message' in error;
  }

  /**
   * 3D Secure + Token-Based Card Saving Flow
   * 1. Create Setup Intent from backend → get client_secret
   * 2. Use stripe.confirmCardSetup() with card details (handles 3DS)
   * 3. If 3DS required, Stripe automatically shows verification popup
   * 4. After 3DS passes, create token with stripe.createToken()
   * 5. Save card to backend with saveStripeCard({ source: token.id })
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // Step 1: Create Setup Intent to get client_secret
      const setupIntentResponse = await create3DSSetupIntent().unwrap();
      
      if (!setupIntentResponse.success || !setupIntentResponse.data?.client_secret) {
        throw new Error('Failed to create setup intent');
      }

      const clientSecret = setupIntentResponse.data.client_secret;

      // Step 2: Confirm card setup with 3DS support
      // This will show the 3DS popup if the bank requires it
      setIs3DSProcessing(true);
      
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.cardholderName || undefined,
            address: {
              line1: formData.addressLine1 || undefined,
              line2: formData.addressLine2 || undefined,
              city: formData.city || undefined,
              state: formData.state || undefined,
              postal_code: formData.postalCode || undefined,
              country: formData.country || undefined,
            },
          },
        },
      });

      setIs3DSProcessing(false);

      if (setupError) {
        // 3DS failed or user cancelled
        setStatusMessage({ 
          type: 'error', 
          text: setupError.message || 'Card verification failed. Please try again.' 
        });
        return;
      }

      if (setupIntent?.status !== 'succeeded') {
        setStatusMessage({ 
          type: 'error', 
          text: `Card verification status: ${setupIntent?.status}. Please try again.` 
        });
        return;
      }

      // Step 3: 3DS passed! Now create token to save card
      const { token, error: tokenError } = await stripe.createToken(cardElement, {
        name: formData.cardholderName || undefined,
        address_line1: formData.addressLine1 || undefined,
        address_line2: formData.addressLine2 || undefined,
        address_city: formData.city || undefined,
        address_state: formData.state || undefined,
        address_zip: formData.postalCode || undefined,
        address_country: formData.country || undefined,
      });

      if (tokenError || !token?.id) {
        setStatusMessage({ 
          type: 'error', 
          text: tokenError?.message || 'Failed to create card token' 
        });
        return;
      }

      // Step 4: Save card to backend using the token
      const saveResponse = await saveStripeCard({ source: token.id }).unwrap();
      
      // Card saved successfully!
      setStatusMessage({ type: 'success', text: 'Card added successfully!' });
      
      // Use the card from the save response or refetch to get the new card
      const savedCardId = saveResponse.card?.id;
      
      if (savedCardId) {
        dispatch(setSelectedCard(savedCardId));
        if (onSuccess) {
          onSuccess(savedCardId);
        }
      } else {
        // Fallback: Refetch cards to get the new card's ID
        const cardsResult = await refetchCards();
        const newCard = cardsResult.data?.cards?.data?.[0];
        
        if (newCard?.id) {
          dispatch(setSelectedCard(newCard.id));
          if (onSuccess) {
            onSuccess(newCard.id);
          }
        } else if (onSuccess) {
          // Card was saved but we couldn't get the ID, still call success
          onSuccess('');
        }
      }
    } catch (err: unknown) {
      setIs3DSProcessing(false);
      if (isFetchBaseQueryError(err)) {
        const errorData = err.data as { message?: string };
        setStatusMessage({ type: 'error', text: errorData?.message || 'Failed to save card' });
      } else if (isSerializedError(err)) {
        setStatusMessage({ type: 'error', text: err.message || 'Unexpected error occurred' });
      } else if (err instanceof Error) {
        setStatusMessage({ type: 'error', text: err.message });
      } else {
        setStatusMessage({ type: 'error', text: 'An unknown error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
          <p className="text-sm text-gray-500">Securely save your card for faster checkout</p>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {statusMessage.type === 'success' 
            ? <CheckCircle className="w-5 h-5" /> 
            : <AlertCircle className="w-5 h-5" />
          }
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cardholder Name
        </label>
        <input
          type="text"
          name="cardholderName"
          value={formData.cardholderName}
          onChange={handleChange}
          placeholder="Name on card"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Card Number
        </label>
        <div className="border border-gray-300 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all bg-white">
          <CardNumberElement options={{ style: stripeElementStyle, showIcon: true }} />
        </div>
      </div>

      {/* Expiry & CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expiry Date
          </label>
          <div className="border border-gray-300 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all bg-white">
            <CardExpiryElement options={{ style: stripeElementStyle }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CVC
          </label>
          <div className="border border-gray-300 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all bg-white">
            <CardCvcElement options={{ style: stripeElementStyle }} />
          </div>
        </div>
      </div>

      {/* Billing Address Toggle */}
      <button
        type="button"
        onClick={() => setShowBilling(!showBilling)}
        className="w-full flex items-center justify-between py-3 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="text-sm font-medium">Billing Address (Optional)</span>
        {showBilling ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Billing Address Fields */}
      {showBilling && (
        <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="Address Line 1"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Address Line 2"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State/County"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* 3DS Processing Overlay */}
      {is3DSProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Verification</h3>
            <p className="text-gray-600 text-sm">
              Please complete the verification in the popup from your bank.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !stripe || is3DSProcessing}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all ${
          loading || !stripe || is3DSProcessing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r bg-[#FF4D4D] hover:from-red-500 hover:to-red-500 shadow-lg shadow-red-500/25 active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {is3DSProcessing ? 'Verifying with bank...' : 'Saving Card...'}
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Save Card with 3D Secure
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Protected by 3D Secure bank verification
      </p>
    </form>
  );
};

export default CardDetails;
