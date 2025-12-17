'use client';
import React, { useState } from 'react';
import SavedCardsCard from './SavedCardsCard';
import { useGetStripeCardsQuery, useRemoveStripeCardMutation } from '@/lib/services/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setSelectedCard, clearSelectedCard } from '@/lib/store/selectedCardSlice';
import Popup from '../reUse/PopUp';
import CardDetails from './CardDetails';
import { stripePromise } from '@/lib/stripe';
import { Elements } from '@stripe/react-stripe-js';
import { logActivity } from '@/lib/store/activityLogSlice';
import { CreditCard, Plus, Loader2, AlertCircle } from 'lucide-react';

type SavedCardsProps = {
  onCardSelect?: () => void;
};

const SavedCards = ({ onCardSelect }: SavedCardsProps) => {
  const dispatch = useAppDispatch();
  const selectedCardId = useAppSelector((state) => state.selectedCard.cardId);
  const timestamp = new Date().toLocaleString();

  const {
    data: cards,
    isLoading,
    isError,
    refetch,
  } = useGetStripeCardsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [removeCard] = useRemoveStripeCardMutation();
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleSelect = (cardId: string) => {
    dispatch(setSelectedCard(cardId));
    dispatch(logActivity(`User selected a card from saved cards at ${timestamp}`));
    if (onCardSelect) onCardSelect();
  };

  const handleDelete = async (cardId: string) => {
    setDeletingCardId(cardId);
    try {
      await removeCard({ cardId }).unwrap();
      if (selectedCardId === cardId) dispatch(clearSelectedCard());
      refetch();
    } catch (error) {
      console.error('Failed to delete card', error);
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleAddClick = () => {
    dispatch(logActivity(`User clicked on add new card at ${timestamp}`));
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const cardList = cards?.cards?.data || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Saved Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your payment methods</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Card</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#FF4D4D] animate-spin mb-3" />
          <p className="text-gray-500">Loading cards...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load cards</p>
          <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        </div>
      ) : cardList.length > 0 ? (
        <div className="space-y-3">
          {cardList.map((card) => (
          <SavedCardsCard
            key={card.id}
              cardId={card.id}
            cardType={card.brand}
              cardNumber={`•••• •••• •••• ${card.last4}`}
            expiry={`${String(card.exp_month).padStart(2, '0')}/${card.exp_year.toString().slice(-2)}`}
            selected={card.id === selectedCardId}
            onSelect={() => handleSelect(card.id)}
            onDelete={() => handleDelete(card.id)}
              isDeleting={deletingCardId === card.id}
          />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No cards saved</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Add a card for faster checkout</p>
          <button
            onClick={handleAddClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Card
          </button>
        </div>
      )}

      {/* Mobile Add Button */}
      {cardList.length > 0 && (
        <div className="mt-6 sm:hidden">
          <button
            onClick={handleAddClick}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors"
          >
            <Plus className="w-5 h-5" />
        Add New Card
      </button>
        </div>
      )}

      {/* Popup */}
      {isPopupOpen && (
        <Popup
          width="480px"
          height="auto"
          content={
            <div className="p-5">
              <Elements stripe={stripePromise}>
                <CardDetails
                  onSuccess={(cardId) => {
                    setIsPopupOpen(false);
                    dispatch(setSelectedCard(cardId));
                    refetch();
                  }}
                />
              </Elements>
            </div>
          }
          onClose={closePopup}
          mobileFullscreen={true}
        />
      )}
    </div>
  );
};

export default SavedCards;
