'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
import { StoreItem } from '../LandingPage';
import { AddOn, FoodVariation } from './bodyType';

interface ItemDetailModalProps {
  item: StoreItem;
  currency: string;
  quantity: number;
  hasAddons: boolean;
  foodVariations: FoodVariation[];
  addOns: AddOn[];
  onClose: () => void;
  onAddToCart: (qty: number, selectedVariations?: Record<string, string[]>, selectedAddons?: AddOn[]) => void;
}

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const ItemDetailModal = ({
  item,
  currency,
  quantity: initialQuantity,
  hasAddons,
  foodVariations,
  addOns,
  onClose,
  onAddToCart,
}: ItemDetailModalProps) => {
  const [qty, setQty] = useState(initialQuantity > 0 ? initialQuantity : 1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string[]>>({});
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = item.image 
    ? `${baseImage}/uploads/product/${item.image}` 
    : '/images/placeholder.png';

  // Calculate discounted base price
  const discount = item.discount || 0;
  const basePrice = discount > 0 
    ? item.price - (item.price * discount / 100) 
    : item.price;
  const originalPrice = item.price;
  
  // Calculate addon total
  const addonTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  
  // Calculate variation total
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
    onAddToCart(qty, hasAddons ? selectedVariations : undefined, hasAddons ? selectedAddons : undefined);
    onClose();
  };

  // Check if required variations are selected
  const isValid = foodVariations.every(v => {
    if (!v.required) return true;
    const selected = selectedVariations[v.name] || [];
    return selected.length >= v.min;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Image */}
          <div className="relative aspect-video bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className={`object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Name & Price */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-red-600 font-bold text-lg">
                  {currency}{basePrice.toFixed(2)}
                </p>
                {discount > 0 && (
                  <>
                    <span className="text-gray-400 line-through text-sm">
                      {currency}{originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">About Food</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            )}

            {/* Variations */}
            {foodVariations.length > 0 && (
              <div className="space-y-4">
                {foodVariations.map((variation) => (
                  <div key={variation.name} className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {variation.name}
                        {variation.required && <span className="text-red-500 ml-1">*</span>}
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
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              isSelected
                                ? 'bg-[#FF4D4D] text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                            }`}
                          >
                            {option.label}
                            {option.optionPrice > 0 && (
                              <span className="ml-1 text-xs opacity-75">
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
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Add-ons</h3>
                <div className="space-y-2">
                  {addOns.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-red-50 border-red-500'
                            : 'bg-white border-gray-200 hover:border-red-200'
                        }`}
                      >
                        <span className={`text-sm ${isSelected ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                          {addon.name}
                        </span>
                        <span className={`text-sm ${isSelected ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
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

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 p-4 pb-24 md:pb-4 bg-white">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-bold text-gray-900 w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF4D4D] hover:bg-[#FF4D4D] text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={hasAddons && !isValid}
            className="w-full py-3.5 bg-[#FF4D4D] hover:bg-[#FF4D4D] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Add {qty} for {currency}{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;

