'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

type FreeCardProps = {
  name: string;
  img?: string;
  price: string | number;
  currency?: string;
  quantity?: number;
  hasAddons?: boolean;
  onImageClick?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
};

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const defaultImage = '/images/placeholder.png';

const GetFreecard = ({
  name,
  img,
  price,
  currency = '£',
  quantity = 0,
  hasAddons = false,
  onImageClick,
  onIncrease,
  onDecrease,
}: FreeCardProps) => {
  const [imageSrc, setImageSrc] = useState(`${baseImage}/uploads/product/${img}`);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedPrice = typeof price === 'number' 
    ? price.toFixed(2) 
    : parseFloat(String(price)).toFixed(2);

  const handleImageClick = () => {
    onImageClick?.();
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasAddons && quantity === 0) {
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
    <div className="w-[300px] min-w-[300px] max-w-[300px] md:min-w-[340px] md:max-w-[340px] h-[110px] flex border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div 
        className="min-w-[110px] max-w-[110px] md:min-w-[130px] md:max-w-[130px] h-full shrink-0 relative bg-gray-100 cursor-pointer"
        onClick={handleImageClick}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="130px"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageSrc(defaultImage);
            setImageLoaded(true);
          }}
        />
        
        {/* Buy 1 Get 1 Free Badge */}
        <div className="absolute top-1 left-1">
          <span className="inline-flex items-center px-1 py-0.5 bg-green-600 text-white text-[8px] font-semibold rounded">
            B1G1
          </span>
        </div>

        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute bottom-1 left-1">
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full">
              {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between px-3 py-2 flex-1 overflow-hidden">
        <h3 
          className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 cursor-pointer group-hover:text-[#FF4D4D] transition-colors"
          onClick={handleImageClick}
        >
          {name}
        </h3>

        {/* Price Row with Controls */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#FF4D4D]">
            {currency}{formattedPrice}
          </span>

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
    </div>
  );
};

export default GetFreecard;
