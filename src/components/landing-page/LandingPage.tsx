'use client';
import React from 'react';
import Restaurant from './restaurant/Restaurant';
import Coupons from './coupons/Coupons';
import GetFree from './get free/GetFree';
import Body from './body/Body';
import Link from 'next/link';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { Review } from '../pop up content/reviews/ReviewDetail';
import { AreaData, CityData } from '@/app/takeaway/[city]/[area]/[storeName]/StoreClient';
import { StoreSEO } from '@/app/takeaway/[city]/[area]/[storeName]/layout';
import { ShoppingBag } from 'lucide-react';

export interface Category {
  id: number;
  name: string;
  image?: string;
  parent_id?: number;
  position?: number;
  status?: number;
  created_at?: string;
  updated_at?: string;
  priority?: number;
  module_id?: number;
  slug?: string;
  featured?: number;
}

export interface StoreItem {
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  id: number;
  is_buy_get_free?: boolean;
  food_variations?: string;
  add_ons_data?: string;
  menu_id?: number;
  available_time_ends: string;
  available_time_starts: string;
  discount?: number;
  discount_type?: string;
}

interface StoreCoupon {
  id: number;
  title: string;
  code: string;
  start_date: string;
  expire_date: string;
  min_purchase: number;
  discount: number;
  discount_type: string;
  description: string;
}

export type Currency = {
  currency_symbol: string;
  currency: string;
};

export interface StoreMenu {
  id: number;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  store_id?: number;
  image?: string | null;
  items_count?: number;
}

export type ZoneData = {
  distance_in: 'Km' | 'Miles';
};

export interface StoreDetails {
  id: number;
  name: string;
  description?: string;
  image?: string;
  cover_photo?: string;
  items?: StoreItem[];
  zone_currency?: Currency;
  store_coupon_discount?: StoreCoupon[];
  zone_id: number;
  latitude?: number;
  longitude?: number;
  module_id?: number;
  reviews?: Review[];
  hygiene_number?: string;
  custom_fee_amount?: string;
  custom_fee_label?: string;
  self_delivery_system?: number;
  free_delivery?: boolean;
  estimated_delivery_fee?: { per_km_shipping_charge: number; minimum_shipping_charge: number };
  zone_service_charge?: number;
  avg_rating?: number;
  logo?: string;
  open?: boolean;
  cityData?: CityData;
  areaData?: AreaData;
  meta_description?: string;
  meta_title?: string;
  meta_image?: string;
  delivery_time?: string;
  store_menu?: StoreMenu[];
  delivery?: boolean;
  dine_in_status?: number;
  take_away?: boolean;
  store_seo?: StoreSEO[];
  zone_data?: ZoneData;
  active?: boolean;
}

export interface LandingPageProps {
  storeDetails: StoreDetails;
  isPopup?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ storeDetails, isPopup = false }) => {
  const totalItems = useSelector((state: RootState) =>
    state.basket.items.reduce((total, item) => total + item.quantity, 0)
  );
  const basketTotal = useSelector((state: RootState) =>
    state.basket.items.reduce((sum, item) => sum + item.totalPrice, 0)
  );

  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);
  const currencySymbol = storeDetails.zone_currency?.currency_symbol || '£';

  return (
    <div className="relative min-h-screen pb-24 md:pb-8">
      {/* Main Content */}
      <div className="container-app py-4 md:py-6 space-y-6 md:space-y-8">
        {/* Hero Section */}
      <Restaurant storeDetails={storeDetails} />
        
        {/* Promotions Section */}
        <div className="space-y-6">
          {/* Coupons */}
          {storeDetails.store_coupon_discount && storeDetails.store_coupon_discount.length > 0 && (
            <Coupons storeDetails={{ store_coupon_discount: storeDetails.store_coupon_discount }} />
          )}
          
          {/* Get Free Deals */}
      <GetFree storeDetails={storeDetails} />
        </div>
        
        {/* Menu Section */}
      <Body storeDetails={storeDetails} />
      </div>

      {/* Mobile Basket Bar - Fixed at Bottom */}
      {!isPopup && totalItems > 0 && (
        <Link href={`/takeaway/${city}/${area}/${storeName}/basket`} className="md:hidden block">
          <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-between gap-4 text-white px-4 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform" style={{ backgroundColor: '#FF4D4D' }}>
              {/* Item Count */}
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                <span className="text-sm font-bold text-white">{totalItems}</span>
              </div>
              
              {/* CTA */}
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="font-semibold text-white">View Basket</span>
              </div>
              
              {/* Total */}
              <span className="font-bold text-white">
                {currencySymbol}
                {basketTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default LandingPage;
