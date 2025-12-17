'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, ShoppingBag, Bookmark } from 'lucide-react';

export interface FeedItem {
  id: string;
  foodName: string;
  foodDescription: string;
  foodImage: string;
  foodPrice: number;
  currency: string;
  restaurantName: string;
  restaurantLogo: string;
  restaurantSlug: string;
  citySlug: string;
  areaSlug: string;
}

interface FeedCardProps {
  item: FeedItem;
  index?: number;
}

export default function FeedCard({ item, index = 0 }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 50);

  const restaurantUrl = `/takeaway/${item.citySlug}/${item.areaSlug}/${item.restaurantSlug}`;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <article className="relative w-full h-full overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 bg-gray-900">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
        )}
        <Image
          src={item.foodImage}
          alt={item.foodName}
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          priority={index < 3}
        />
        
        {/* Gradient Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-28 lg:bottom-36 flex flex-col items-center gap-5 z-10">
        {/* Restaurant Profile */}
        <Link href={restaurantUrl} className="relative group">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-[3px] border-white shadow-xl ring-2 ring-black/20">
            {!logoLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 animate-pulse" />
            )}
            <Image
              src={item.restaurantLogo}
              alt={item.restaurantName}
              width={56}
              height={56}
              className={`w-full h-full object-cover transition-opacity ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(true)}
            />
          </div>
          {/* Follow Badge */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#FF4D4D] flex items-center justify-center border-2 border-black shadow-lg">
            <span className="text-white text-xs lg:text-sm font-bold leading-none">+</span>
          </div>
        </Link>

        {/* Like Button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`relative transition-transform duration-200 ${isLiked ? 'scale-110' : 'group-active:scale-90'}`}>
            <Heart 
              className={`w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-white'
              }`} 
              strokeWidth={2}
            />
            {isLiked && (
              <div className="absolute inset-0 animate-ping">
                <Heart className="w-7 h-7 lg:w-8 lg:h-8 text-red-500 fill-red-500 opacity-50" />
              </div>
            )}
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-lg">{likeCount}</span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="group-active:scale-90 transition-transform">
            <MessageCircle className="w-7 h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" strokeWidth={2} />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-lg">{Math.floor(Math.random() * 100) + 10}</span>
        </button>

        {/* Save Button */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1 group">
          <div className={`transition-transform duration-200 ${isSaved ? 'scale-110' : 'group-active:scale-90'}`}>
            <Bookmark 
              className={`w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg transition-colors ${
                isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'
              }`} 
              strokeWidth={2}
            />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-lg">Save</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 lg:bottom-6 left-3 lg:left-4 right-16 lg:right-20 z-10">

        {/* Food Name */}
        <h2 className="text-white font-bold text-lg lg:text-xl leading-tight mb-1.5 lg:mb-2 drop-shadow-lg">
          {item.foodName}
        </h2>

        {/* Description */}
        {item.foodDescription && (
          <p className="text-white/80 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2 drop-shadow-md leading-relaxed">
            {item.foodDescription}
          </p>
        )}

        {/* Order Button */}
        <Link 
          href={restaurantUrl}
          className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full text-white font-bold text-xs lg:text-sm shadow-xl active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Order Now</span>
          <span className="text-white/90">·</span>
          <span>{item.currency}{item.foodPrice.toFixed(2)}</span>
        </Link>
      </div>

      {/* Top Gradient for safe area */}
      <div className="absolute top-0 left-0 right-0 h-16 lg:h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
    </article>
  );
}
