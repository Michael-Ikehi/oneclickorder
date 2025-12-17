'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToBasket, removeFromBasket } from '@/lib/store/basketSlice';
import { RootState } from '@/lib/store/store';
import { Props } from './basketType';
import { Minus, Plus, Trash2 } from 'lucide-react';

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const sumAddons = (addons?: { price: number }[]) =>
  addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;

const Basketcard: React.FC<Props> = ({ item, storeDetails }) => {
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);

  const basketItem = useSelector((state: RootState) =>
    state.basket.items.find((i) => i.key === item.key)
  );

  const imageUrl = item.image 
    ? `${baseImage}/uploads/product/${item.image}`
    : '/images/placeholder.png';

  const currencySymbol = storeDetails?.zone_currency?.currency_symbol || '£';

  const handleIncrease = () => {
    if (!basketItem) return;

    const newQuantity = basketItem.quantity + 1;

    dispatch(
      addToBasket({
        ...basketItem,
        quantity: newQuantity,
        freeQuantity: basketItem.is_buy_get_free ? newQuantity : undefined,
        totalPrice:
          (basketItem.price + (basketItem.variationPrice || 0) + sumAddons(basketItem.addons)) *
          newQuantity,
      })
    );
  };

  const handleDecrease = () => {
    if (!basketItem) return;

    const newQuantity = basketItem.quantity - 1;

    if (newQuantity <= 0) {
      dispatch(removeFromBasket({ key: item.key }));
      return;
    }

    dispatch(
      addToBasket({
        ...basketItem,
        quantity: newQuantity,
        freeQuantity: basketItem.is_buy_get_free ? newQuantity : undefined,
        totalPrice:
          (basketItem.price + (basketItem.variationPrice || 0) + sumAddons(basketItem.addons)) *
          newQuantity,
      })
    );
  };

  const handleRemove = () => {
    dispatch(removeFromBasket({ key: item.key }));
  };

  const quantity = basketItem?.quantity ?? 0;
  const totalPrice = (item.price + (item.variationPrice || 0) + sumAddons(item.addons)) * quantity;
  const addons = basketItem?.addons ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="flex gap-3">
        {/* Item Image */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            className={`object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Discount Badge */}
          {item.discount && item.discount > 0 && (
            <div className="absolute top-1 left-1 bg-[#FF4D4D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{Math.round(item.discount * 100)}%
      </div>
          )}
          </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
            {item.name}
          </h3>

          {/* Variations */}
          {basketItem?.variations && Object.keys(basketItem.variations).length > 0 && (
            <div className="text-xs text-gray-500 mb-1">
              {Object.entries(basketItem.variations)
                .filter(([label]) => label.toLowerCase() !== 'addons')
                .map(([, values]) => values.join(', '))
                .join(' • ')}
            </div>
          )}

          {/* Addons */}
          {addons.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {addons.slice(0, 3).map((addon) => (
                  <span
                    key={addon.id}
                  className="inline-flex items-center bg-gray-100 text-gray-600 text-[13px] px-1.5 py-0.5 rounded"
                  >
                  +{addon.name}
                  </span>
                ))}
              {addons.length > 3 && (
                <span className="text-[10px] text-gray-400">+{addons.length - 3} more</span>
              )}
            </div>
          )}

          {/* Bottom Row: Quantity Controls & Price */}
          <div className="flex items-center justify-between mt-auto">
            {/* Quantity Controls */}
            <div className="flex items-center gap-0 bg-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center text-[#FF4D4D] hover:bg-red-50 active:bg-red-100 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <span className="font-bold text-[#FF4D4D] text-sm">
                {currencySymbol}{totalPrice.toFixed(2)}
              </span>
              {basketItem?.freeQuantity !== undefined && 
               basketItem?.freeQuantity !== null && 
               Number(basketItem.freeQuantity) > 0 && (
                <span className="block text-[13px] text-green-600 font-medium">
                  +{basketItem.freeQuantity} free
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Basketcard;
