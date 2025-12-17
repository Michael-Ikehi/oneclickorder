'use client';
import React, { useState } from 'react';
import { Tag, ChevronRight, X, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setCoupon, clearCoupon, setCouponError } from '@/lib/store/couponSlice';
import { useLazyApplyCouponQuery } from '@/lib/services/api';
import { logActivity } from '@/lib/store/activityLogSlice';
import { StoreDetails } from '../landing-page/LandingPage';

interface DiscountCodeProps {
  storeDetails: StoreDetails;
}

const DiscountCode = ({ storeDetails }: DiscountCodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  
  const appliedCoupon = useSelector((state: RootState) => state.coupon.appliedCoupon);
  const couponError = useSelector((state: RootState) => state.coupon.error);
  const orderMethod = useSelector((state: RootState) => state.orderType?.orderType)?.toLowerCase();
  const basketItems = useSelector((state: RootState) => state.basket.items);
  
  const [triggerApplyCoupon, { isLoading }] = useLazyApplyCouponQuery();
  
  const totalPrice = basketItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const currency = storeDetails.zone_currency?.currency_symbol || '£';
  const timestamp = new Date().toLocaleString();

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    
    dispatch(logActivity(`User applied for a coupon at ${timestamp}`));
    
    try {
      const data = await triggerApplyCoupon({
        code: code.trim(),
        store_id: storeDetails.id,
        module_id: storeDetails.module_id ?? 0,
      }).unwrap();

      const couponOrderType = data.order_type?.toLowerCase();

      // Check if the coupon is valid for the selected order type
      if (couponOrderType !== 'all' && couponOrderType !== orderMethod) {
        dispatch(logActivity(`User used a wrong Coupon at ${timestamp}`));
        dispatch(setCouponError(
          `This coupon can only be used on "${couponOrderType?.replace('_', ' ')}" orders.`
        ));
        return;
      }

      // Check if total price meets the min_purchase requirement
      const minPurchase = data.min_purchase;
      if (typeof minPurchase === 'number' && totalPrice < minPurchase) {
        dispatch(logActivity(`User didn't meet requirement of coupon at ${timestamp}`));
        dispatch(setCouponError(
          `This coupon requires a minimum purchase of ${currency}${minPurchase.toLocaleString()}.`
        ));
        return;
      }

      // Success - store the coupon
      dispatch(setCoupon({
        code: code.trim().toUpperCase(),
        discount: data.discount,
        discount_type: data.discount_type,
        min_purchase: data.min_purchase,
        order_type: data.order_type,
      }));
      dispatch(logActivity(`User coupon was applied successfully at ${timestamp}`));
      setCode('');
      setIsOpen(false);
    } catch (error: any) {
      dispatch(logActivity(`User encountered an error applying for a coupon at ${timestamp}`));
      const errorMessage = error?.data?.errors?.[0]?.message || 'Coupon has expired or is not valid';
      dispatch(setCouponError(errorMessage));
    }
  };

  const handleRemoveCode = () => {
    dispatch(clearCoupon());
  };

  // Calculate discount amount for display
  const getDiscountDisplay = () => {
    if (!appliedCoupon) return null;
    
    if (appliedCoupon.discount_type === 'percent') {
      return `${appliedCoupon.discount}% off`;
    } else {
      return `${currency}${appliedCoupon.discount} off`;
    }
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${appliedCoupon ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Tag className={`w-4 h-4 ${appliedCoupon ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Discount</h2>
            {appliedCoupon ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{appliedCoupon.code}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {getDiscountDisplay()}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No discount applied</p>
            )}
          </div>
        </div>
        
        {appliedCoupon ? (
          <button
            onClick={handleRemoveCode}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Add code
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Expandable Input */}
      {isOpen && !appliedCoupon && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter discount code"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
            />
            <button
              onClick={handleApplyCode}
              disabled={!code.trim() || isLoading}
              className="px-4 py-2.5 bg-[#FF4D4D] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>
          {couponError && (
            <p className="mt-2 text-sm text-red-500">{couponError}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default DiscountCode;
