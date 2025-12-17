"use client";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import GetFreecard from "./GetFreecard";
import AdvancedSlider from "@/components/reUse/AdvancedSlider";
import { StoreDetails, StoreItem } from "../LandingPage";
import ItemDetailModal from '../body/ItemDetailModal';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { addToBasket, removeFromBasket } from '@/lib/store/basketSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import { showToast } from '@/components/reUse/ToastNotification';

interface FreeProps {
  storeDetails: StoreDetails;
}

export type FoodVariationValue = {
  label: string;
  optionPrice: number;
};

export type FoodVariation = {
  name: string;
  type: 'multi' | 'single';
  min: number;
  max: number;
  required: boolean;
  values: FoodVariationValue[];
};

export type AddOn = {
  id: number;
  label: string;
  name: string;
  price: number;
};

type RawFoodVariationValue = {
  label: string;
  optionPrice: string | number;
};

type RawFoodVariation = {
  name: string;
  type: 'multi' | 'single';
  min: string | number;
  max: string | number;
  required: 'on' | 'off' | boolean;
  values: RawFoodVariationValue[];
};

const GetFree = ({ storeDetails }: FreeProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<StoreItem | null>(null);
  const [selectedFoodVariations, setSelectedFoodVariations] = useState<FoodVariation[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const dispatch = useDispatch();
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const timestamp = new Date().toLocaleString();

  const filteredItems = storeDetails.items?.filter((item) => Boolean(item.is_buy_get_free)) || [];

  if (filteredItems.length === 0) return null;

  // Check if store is active and open
  const isStoreActive = storeDetails.active;
  const isStoreOpen = storeDetails.open;

  // Get quantity of an item in basket
  const getItemQuantity = (itemId: number): number => {
    const itemKey = `${itemId}-no-options`;
    const basketItem = basketItems.find(item => item.key === itemKey);
    return basketItem?.quantity || 0;
  };

  // Parse variations and addons for an item
  const parseItemOptions = (card: StoreItem) => {
    let foodVariations: FoodVariation[] = [];
    let addOns: AddOn[] = [];

    try {
      const raw = JSON.parse(card.food_variations || '[]') as RawFoodVariation[];
      foodVariations = raw.map((variation) => ({
        name: variation.name,
        type: variation.type,
        min: Number(variation.min),
        max: Number(variation.max),
        required: variation.required === 'on' || variation.required === true,
        values: variation.values.map((v) => ({
          label: v.label,
          optionPrice: Number(v.optionPrice),
        })),
      }));

      if (Array.isArray(card.add_ons_data)) {
        addOns = card.add_ons_data;
      }
    } catch (error) {
      console.error('Failed to parse food variations or add-ons:', error);
    }

    return { foodVariations, addOns };
  };

  // Open detail modal
  const openDetailModal = (card: StoreItem) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    dispatch(logActivity(`User clicked on B1G1 item "${card.name}" at ${timestamp}`));
    const { foodVariations, addOns } = parseItemOptions(card);
    setSelectedCard(card);
    setSelectedFoodVariations(foodVariations);
    setSelectedAddOns(addOns);
    setIsPopupOpen(true);
  };

  // Increase quantity for items without addons
  const handleIncrease = (card: StoreItem) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    
    const { foodVariations, addOns } = parseItemOptions(card);
    const hasAddons = foodVariations.length > 0 || addOns.length > 0;

    if (hasAddons) {
      openDetailModal(card);
      return;
    }

    const itemKey = `${card.id}-no-options`;
    const currentQty = getItemQuantity(card.id);

    dispatch(
      addToBasket({
        id: card.id,
        key: itemKey,
        name: card.name,
        price: card.price,
        totalPrice: card.price * (currentQty + 1),
        quantity: currentQty + 1,
        image: card.image,
        is_buy_get_free: true,
        freeQuantity: currentQty + 1,
      })
    );
  };

  // Decrease quantity
  const handleDecrease = (card: StoreItem) => {
    const itemKey = `${card.id}-no-options`;
    const currentQty = getItemQuantity(card.id);

    if (currentQty <= 1) {
      dispatch(removeFromBasket({ key: itemKey }));
    } else {
      dispatch(
        addToBasket({
          id: card.id,
          key: itemKey,
          name: card.name,
          price: card.price,
          totalPrice: card.price * (currentQty - 1),
          quantity: currentQty - 1,
          image: card.image,
          is_buy_get_free: true,
          freeQuantity: currentQty - 1,
        })
      );
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="px-3 md:px-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-md font-bold text-green-700">Buy 1 Get 1 Free</h2>
      </div>

      <AdvancedSlider
        PrevButton={(canScrollLeft) => (
          <FaChevronLeft
            size={25}
            className={`p-2 rounded-full hidden md:block ${
              canScrollLeft
                ? 'bg-[#FF4D4D] text-white cursor-pointer'
                : 'bg-gray-300 text-gray-400 cursor-default'
            }`}
          />
        )}
        NextButton={(canScrollRight) => (
          <FaChevronRight
            size={25}
            className={`p-2 rounded-full hidden md:block ${
              canScrollRight
                ? 'bg-[#FF4D4D] text-white cursor-pointer'
                : 'bg-gray-300 text-gray-400 cursor-default'
            }`}
          />
        )}
      >
        {filteredItems.map((item, index) => {
          const { foodVariations, addOns } = parseItemOptions(item);
          const hasAddons = foodVariations.length > 0 || addOns.length > 0;
          const quantity = hasAddons ? 0 : getItemQuantity(item.id);

          return (
            <GetFreecard
              key={index}
              name={item.name}
              img={item.image}
              currency={storeDetails?.zone_currency?.currency_symbol}
              price={item.price}
              quantity={quantity}
              hasAddons={hasAddons}
              onImageClick={() => openDetailModal(item)}
              onIncrease={() => handleIncrease(item)}
              onDecrease={() => handleDecrease(item)}
            />
          );
        })}
      </AdvancedSlider>

      {/* Item Detail Modal */}
      {isPopupOpen && selectedCard && (
        <ItemDetailModal
          item={selectedCard}
          currency={storeDetails?.zone_currency?.currency_symbol ?? '£'}
          quantity={getItemQuantity(selectedCard.id)}
          hasAddons={selectedFoodVariations.length > 0 || selectedAddOns.length > 0}
          foodVariations={selectedFoodVariations}
          addOns={selectedAddOns}
          onClose={closePopup}
          onAddToCart={(qty, selectedVariations, selectedAddonsFromModal) => {
            const hasAddons = selectedFoodVariations.length > 0 || selectedAddOns.length > 0;

            if (hasAddons && selectedVariations) {
              // Item with addons
              const variationKey = Object.entries(selectedVariations)
                .map(([k, v]) => `${k}:${v.join(',')}`)
                .join('|');
              const addonKey = selectedAddonsFromModal?.map(a => a.id).join(',') || '';
              const itemKey = `${selectedCard.id}-${variationKey}-${addonKey}`;

              let totalUnitPrice = selectedCard.price;

              Object.entries(selectedVariations).forEach(([variationName, values]) => {
                const variation = selectedFoodVariations.find(v => v.name === variationName);
                if (variation) {
                  values.forEach(val => {
                    const option = variation.values.find(v => v.label === val);
                    if (option) totalUnitPrice += option.optionPrice;
                  });
                }
              });

              selectedAddonsFromModal?.forEach(addon => {
                totalUnitPrice += addon.price || 0;
              });

              dispatch(
                addToBasket({
                  id: selectedCard.id,
                  key: itemKey,
                  name: selectedCard.name,
                  price: totalUnitPrice,
                  totalPrice: totalUnitPrice * qty,
                  quantity: qty,
                  image: selectedCard.image,
                  variations: selectedVariations,
                  addons: selectedAddonsFromModal,
                  variationPrice: totalUnitPrice - selectedCard.price,
                  is_buy_get_free: true,
                  freeQuantity: qty,
                })
              );
            } else {
              // Simple item
              const itemKey = `${selectedCard.id}-no-options`;

              dispatch(
                addToBasket({
                  id: selectedCard.id,
                  key: itemKey,
                  name: selectedCard.name,
                  price: selectedCard.price,
                  totalPrice: selectedCard.price * qty,
                  quantity: qty,
                  image: selectedCard.image,
                  is_buy_get_free: true,
                  freeQuantity: qty,
                })
              );
            }

            dispatch(logActivity(`User added ${qty}x B1G1 "${selectedCard.name}" to basket at ${timestamp}`));
          }}
        />
      )}
    </div>
  );
};

export default GetFree;
