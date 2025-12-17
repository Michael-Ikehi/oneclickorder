'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

interface FloatingCartProps {
  storeUrl: string;
  currency?: string;
}

export default function FloatingCart({ storeUrl, currency = '£' }: FloatingCartProps) {
  const basketItems = useSelector((state: RootState) => state.basket.items);
  
  const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = basketItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalItems === 0) return null;

  return (
    <Link
      href={`${storeUrl}/basket`}
      className="group fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r bg-[#FF4D4D] rounded-full text-white shadow-2xl shadow-red-500/40 hover:bg-red-500 hover:text-white active:scale-95 transition-all animate-in slide-in-from-bottom-4"
    >
      {/* Cart Icon with Badge */}
      <div className="relative">
        <ShoppingBag className="w-5 h-5 transition-colors group-hover:text-white" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      </div>
      
      {/* Price */}
      <span className="font-bold text-sm transition-colors group-hover:text-white">
        {currency}{totalPrice.toFixed(2)}
      </span>
    </Link>
  );
}

