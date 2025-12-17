import React from 'react';
import Image from 'next/image';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { AddOn, FoodVariation } from '../landing-page/body/bodyType';
import { StoreItem } from '../landing-page/LandingPage';

interface BodyAddViewProps {
  item: StoreItem;
  imageSrc: string;
  defaultImage: string;
  currency?: string;
  quantity: number;
  freeQuantity: number;
  foodVariations?: FoodVariation[];
  addOns: AddOn[];
  selections: Map<string, string[]>;
  toggleVariation: (
    variationSlug: string,
    variantLabel: string,
    type: string,
    max?: number
  ) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  handleAddToBasket: () => void;
  error: string;
  isBuyGetFree: boolean;
  finalPrice: number;
  setImageSrc: React.Dispatch<React.SetStateAction<string>>;
}

const BodyAddView: React.FC<BodyAddViewProps> = ({
  item,
  imageSrc,
  currency,
  quantity,
  freeQuantity,
  foodVariations,
  addOns,
  selections,
  toggleVariation,
  handleDecrease,
  handleIncrease,
  handleAddToBasket,
  error,
  isBuyGetFree,
  finalPrice,
  setImageSrc,
}) => {
  return (
    <div className="relative h-full md:rounded flex flex-col overflow-hidden">
      <div className="flex flex-col items-start flex-grow overflow-y-auto pb-40">
        <div className="w-full min-h-[210px] max-h-[210px] overflow-hidden">
          <Image
            src={imageSrc}
            alt="food"
            width={560}
            height={86}
            className="w-full h-full object-cover"
            onError={() => setImageSrc('/images/placeholder.png')}
          />
        </div>

        <div className="mt-2 px-2">
          <h1 className="text-[20px] font-bold text-[#141111]">{item.name}</h1>
          <p className="text-xs text-[#282828] mt-2">{item.description}</p>
        </div>

        {/* Variants */}
        {foodVariations?.map((variation) => {
          const variationSlug = `${(variation.name || '').toLowerCase().replace(/\s+/g, '-')}-${item.id}`;
          const selected = selections.get(variationSlug) || [];

          return (
            <div key={variationSlug} className="px-2 py-2 w-full">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-medium">{variation.name.toLowerCase()}</h4>
                {variation.required && (
                  <span className="bg-black px-1 rounded-sm text-white text-xs whitespace-nowrap">
                    Required
                  </span>
                )}
              </div>

              {variation.min && variation.max && (
                <p className="text-red-500 text-sm">
                  *Can only pick between {variation.min} and {variation.max} options
                </p>
              )}
              {!variation.min && variation.max && (
                <p className="text-red-500 text-sm">
                  *A maximum of {variation.max} options allowed
                </p>
              )}
              {variation.min && !variation.max && (
                <p className="text-red-500 text-sm">*Minimum {variation.min} options required</p>
              )}

              <div className="flex flex-col gap-3 mt-3">
                {variation.values.map((variant) => {
                  const variantSlug = `${variationSlug}-${variant.label.toLowerCase().replace(/\s+/g, '-')}`;
                  const isSelected = selected.includes(variantSlug);

                  return (
                    <div
                      key={variantSlug}
                      onClick={() =>
                        toggleVariation(variationSlug, variantSlug, variation.type, variation.max)
                      }
                      className={`flex items-center justify-between border rounded-md px-2 py-2 cursor-pointer ${
                        isSelected ? 'border-[#EF4444]' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#EF4444] bg-[#EF4444]' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm">{variant.label}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {currency}
                        {(variant.optionPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add-ons */}
        {Array.isArray(addOns) && addOns.length > 0 && (
          <div className="w-full px-2 mt-4">
            <h4 className="text-base font-semibold mb-2 text-left">Add-ons</h4>
            <div className="flex flex-col gap-3">
              {addOns.map((addon) => {
                const addonSlug = `addon-${addon.id}-${item.id}`;
                const isSelected = selections.get('addons')?.includes(addonSlug) || false;

                return (
                  <div
                    key={addonSlug}
                    onClick={() => toggleVariation('addons', addonSlug, 'multi')}
                    className={`flex items-center justify-between border rounded-md px-2 py-2 cursor-pointer ${
                      isSelected ? 'border-red-600' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-red-600 bg-[#FF4D4D]' : 'border-gray-400'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-sm">{addon.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {currency}
                      {addon.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white p-2 shadow-lg z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <div
              className={`w-6 h-6 flex items-center justify-center border rounded cursor-pointer ${
                quantity === 0
                  ? 'border-[#C1BCBC] text-[#C1BCBC] cursor-not-allowed'
                  : 'border-[#DC2626] text-[#DC2626]'
              }`}
              onClick={quantity > 0 ? handleDecrease : undefined}
            >
              <FaMinus className="text-base" />
            </div>

            <span className="text-lg font-semibold">{quantity}</span>
            <div className="w-6 h-6 flex items-center justify-center border border-[#DC2626] rounded text-[#DC2626] cursor-pointer">
              <FaPlus onClick={handleIncrease} className="text-base" />
            </div>
          </div>

          <button
            className="w-full bg-[#DC2626] text-white py-3 rounded-md font-semibold text-center mt-2"
            onClick={handleAddToBasket}
          >
            Add {quantity > 0 ? quantity : 1}
            {isBuyGetFree && quantity > 0 ? ` (+${freeQuantity} Free)` : ''} for {currency}
            {finalPrice.toFixed(2)}
          </button>
          {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default BodyAddView;
