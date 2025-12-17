'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { StoreMenuItem } from '@/lib/services/apiTypes';

interface FoodVariationValue {
  label: string;
  optionPrice: number;
}

interface FoodVariation {
  name: string;
  type: 'multi' | 'single';
  min: number;
  max: number;
  required: boolean;
  values: FoodVariationValue[];
}

interface AddOn {
  id: number;
  name: string;
  price: number;
}

interface FeedItemModalProps {
  item: StoreMenuItem;
  currency: string;
  onClose: () => void;
  onAddToCart: (qty: number, selectedVariations?: Record<string, string[]>, selectedAddons?: AddOn[]) => void;
}

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

export default function FeedItemModal({
  item,
  currency,
  onClose,
  onAddToCart,
}: FeedItemModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string[]>>({});
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = item.image 
    ? `${baseImage}/uploads/product/${item.image}` 
    : '/images/placeholder.png';

  // Parse food variations
  let foodVariations: FoodVariation[] = [];
  let addOns: AddOn[] = [];

  try {
    if (item.food_variations) {
      const raw = JSON.parse(item.food_variations);
      foodVariations = raw.map((v: any) => ({
        name: v.name,
        type: v.type,
        min: Number(v.min),
        max: Number(v.max),
        required: v.required === 'on' || v.required === true,
        values: v.values.map((val: any) => ({
          label: val.label,
          optionPrice: Number(val.optionPrice),
        })),
      }));
    }
    if (Array.isArray(item.add_ons_data)) {
      addOns = item.add_ons_data;
    }
  } catch (e) {
    console.error('Failed to parse item options:', e);
  }

  const hasOptions = foodVariations.length > 0 || addOns.length > 0;

  // Calculate prices
  const discount = item.discount || 0;
  const basePrice = discount > 0 
    ? item.price - (item.price * discount / 100) 
    : item.price;
  
  const addonTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  
  const variationTotal = Object.entries(selectedVariations).reduce((total, [variationName, values]) => {
    const variation = foodVariations.find(v => v.name === variationName);
    if (!variation) return total;
    return total + values.reduce((sum, val) => {
      const option = variation.values.find(v => v.label === val);
      return sum + (option?.optionPrice || 0);
    }, 0);
  }, 0);

  const unitPrice = basePrice + addonTotal + variationTotal;
  const totalPrice = unitPrice * qty;

  const handleVariationSelect = (variationName: string, value: string, max: number) => {
    setSelectedVariations(prev => {
      const current = prev[variationName] || [];
      if (current.includes(value)) {
        return { ...prev, [variationName]: current.filter(v => v !== value) };
      } else {
        if (current.length >= max) {
          return { ...prev, [variationName]: [...current.slice(1), value] };
        }
        return { ...prev, [variationName]: [...current, value] };
      }
    });
  };

  const handleAddonToggle = (addon: AddOn) => {
    setSelectedAddons(prev => {
      if (prev.find(a => a.id === addon.id)) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    onAddToCart(qty, hasOptions ? selectedVariations : undefined, hasOptions ? selectedAddons : undefined);
    onClose();
  };

  // Check if required variations are selected
  const isValid = foodVariations.every(v => {
    if (!v.required) return true;
    const selected = selectedVariations[v.name] || [];
    return selected.length >= v.min;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-700/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-700 animate-pulse" />
            )}
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className={`object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  {discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 -mt-6 relative">
            {/* Name & Price */}
            <div>
              <h2 className="text-xl font-bold text-white">{item.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-red-400 font-bold text-xl">
                  {currency}{basePrice.toFixed(2)}
                </span>
                {discount > 0 && (
                  <span className="text-gray-500 line-through text-sm">
                    {currency}{item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                {/* <h3 className="text-sm font-semibold text-gray-400 mb-1.5">About Food</h3> */}
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Variations */}
            {foodVariations.length > 0 && (
              <div className="space-y-4">
                {foodVariations.map((variation) => (
                  <div key={variation.name} className="border-t border-gray-700/50 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        {variation.name}
                        {variation.required && <span className="text-red-400 ml-1">*</span>}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Select {variation.min === variation.max ? variation.min : `${variation.min}-${variation.max}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variation.values.map((option) => {
                        const isSelected = (selectedVariations[variation.name] || []).includes(option.label);
                        return (
                          <button
                            key={option.label}
                            onClick={() => handleVariationSelect(variation.name, option.label, variation.max)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                              isSelected
                                ? 'bg-[#FF4D4D] text-white border-red-500'
                                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-red-400'
                            }`}
                          >
                            {option.label}
                            {option.optionPrice > 0 && (
                              <span className="ml-1 opacity-75">
                                +{currency}{option.optionPrice.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add-ons */}
            {addOns.length > 0 && (
              <div className="border-t border-gray-700/50 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Add-ons</h3>
                <div className="space-y-2">
                  {addOns.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#FF4D4D]/20 border-red-500'
                            : 'bg-gray-800 border-gray-700 hover:border-red-400/50'
                        }`}
                      >
                        <span className={`text-sm font-medium ${isSelected ? 'text-red-400' : 'text-gray-300'}`}>
                          {addon.name}
                        </span>
                        <span className={`text-sm font-medium ${isSelected ? 'text-red-400' : 'text-gray-400'}`}>
                          +{currency}{(addon.price || 0).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed - Extra bottom padding on mobile for navigation bar */}
        <div className="border-t border-gray-700/50 p-5 pb-24 md:pb-5 bg-gray-900/95 backdrop-blur-sm">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-5 mb-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-white w-10 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FF4D4D] hover:bg-[#FF4D4D] text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={hasOptions && !isValid}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all ${
              hasOptions && !isValid
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r bg-[#FF4D4D] hover:from-red-500 hover:to-red-500 shadow-lg shadow-red-500/25 active:scale-[0.98]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Add {qty} for {currency}{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

