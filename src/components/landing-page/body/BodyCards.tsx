'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export type FreeCardProps = {
  name: string;
  description?: string;
  onImageClick?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
  img: string;
  price: string | number;
  currency?: string;
  className?: string;
  discount?: number;
  originalPrice?: number;
  isPopular?: boolean;
  quantity?: number;
  hasAddons?: boolean;
};

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const defaultImage = '/images/placeholder.png';

const BodyCards = ({
  name,
  onImageClick,
  onIncrease,
  onDecrease,
  img,
  price,
  className = '',
  currency = '£',
  discount,
  originalPrice,
  isPopular,
  quantity = 0,
  hasAddons = false,
}: FreeCardProps) => {
  const [imageSrc, setImageSrc] = useState(`${baseImage}/uploads/product/${img}`);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedPrice = typeof price === 'number' 
    ? price.toFixed(2) 
    : parseFloat(price).toFixed(2);

  const handleImageClick = () => {
    // Always open detail modal on image click
    onImageClick?.();
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAddons && quantity === 0) {
      // First add with addons - need to open popup
      onImageClick?.();
    } else {
      onIncrease?.();
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecrease?.();
  };

  return (
    <article
      className={`
        group relative bg-white rounded-xl overflow-hidden
        border border-gray-200 hover:border-red-200
        shadow-sm hover:shadow-lg
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      {/* Image Container - Clickable */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
        aria-label={hasAddons ? `Select options for ${name}` : `Add ${name} to basket`}
      >
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`
            object-cover transition-all duration-500 ease-out
            group-hover:scale-105
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageSrc(defaultImage);
            setImageLoaded(true);
          }}
        />
        
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-1.5 py-0.5 bg-[#FF4D4D] text-white text-[10px] font-semibold rounded">
              Popular
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-semibold rounded">
              -{discount}%
            </span>
          </div>
        )}

        {/* Quantity Badge - Show when item is in basket */}
        {quantity > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-[#FF4D4D] text-white text-xs font-bold rounded-full">
              {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        {/* Name */}
        <h3 className="font-medium text-gray-900 text-xs leading-tight mb-1.5 line-clamp-2 group-hover:text-red-600 transition-colors">
          {name}
        </h3>

        {/* Price Row with Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-red-600 font-bold text-sm">
              {currency}{formattedPrice}
            </span>
            
            {originalPrice && originalPrice > parseFloat(String(price)) && (
              <span className="text-gray-400 text-[10px] line-through">
                {currency}{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDecrease}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FF4D4D] hover:bg-[#FF4D4D] text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleIncrease}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FF4D4D] hover:bg-[#FF4D4D] text-white transition-colors shadow-sm"
              aria-label="Add to basket"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hover Border Accent */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </article>
  );
};

export default BodyCards;
