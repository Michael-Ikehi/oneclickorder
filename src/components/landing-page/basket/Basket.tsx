'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Basketcard from './Basketcard';
import { RootState } from '@/lib/store/store';
import { clearBasket } from '@/lib/store/basketSlice';
import { StoreDetails } from '../LandingPage';
import Popup from '@/components/reUse/PopUp';
import OrderNotePop from '@/components/pop up content/order-note/OrderNotePop';
import { useRouter } from 'next/navigation';
import BottomPopup from '@/components/reUse/BottomPopup';
import BasketChange from '@/components/pop up content/BasketChange';
import Link from 'next/link';
import { useCreateActivityLogMutation } from '@/lib/services/api';
import { clearActivities } from '@/lib/store/activityLogSlice';
import { 
  ChevronLeft, 
  ShoppingBag, 
  Trash2,
  StickyNote,
  ArrowRight,
  PackageOpen
} from 'lucide-react';

interface BasketProps {
  storeDetails: StoreDetails;
}

const Basket = ({ storeDetails }: BasketProps) => {
  const dispatch = useDispatch();
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);
  const activityLogs = useSelector((state: RootState) => state.activityLog.logs);
  const [createActivityLog] = useCreateActivityLogMutation();
  const router = useRouter();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bottomPopupOpen, setBottomPopupOpen] = useState(false);

  // Calculate totals
  const subtotal = basketItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = basketItems.reduce((total, item) => total + item.quantity, 0);
  const currencySymbol = storeDetails?.zone_currency?.currency_symbol || '£';

  const handleOrderClick = async () => {
    if (!token) {
      const currentPath = `/takeaway/${city}/${area}/${storeName}/basket`;
      router.push(
        `/takeaway/${city}/${area}/${storeName}/login?redirect=${encodeURIComponent(currentPath)}`
      );
      return;
    }

    try {
      await Promise.all(activityLogs.map((activity) => createActivityLog({ activity }).unwrap()));
      dispatch(clearActivities());
    } catch (error) {
      console.error('Failed to send activity logs:', error);
    }

    router.push(`/takeaway/${city}/${area}/${storeName}/confirm`);
  };

  const handleClearBasket = () => {
    dispatch(clearBasket());
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 bg-white border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href={`/takeaway/${city}/${area}/${storeName}`}
            className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <h1 className="font-heading font-semibold text-secondary-900">My Cart</h1>

          {basketItems.length > 0 ? (
            <button
              onClick={handleClearBasket}
              className="p-2 text-error hover:bg-error-light rounded-lg transition-colors"
              aria-label="Clear basket"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-4 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <Link
            href={`/takeaway/${city}/${area}/${storeName}`}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Go back to store"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-secondary-900">My Cart</h2>
          </div>
        </div>
        {basketItems.length > 0 && (
          <button
            onClick={handleClearBasket}
            className="text-sm text-error hover:text-error/80 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Basket Content */}
      <div className="flex-1 overflow-y-auto">
        {basketItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
              <PackageOpen className="w-10 h-10 text-secondary-400" />
            </div>
            <h3 className="font-heading font-semibold text-secondary-900 mb-1">
              Your Cart is Empty
            </h3>
            <p className="text-sm text-secondary-500 text-center max-w-[200px]">
              Add some delicious items from the menu to get started!
            </p>
            <Link
              href={`/takeaway/${city}/${area}/${storeName}`}
              className="mt-6 btn btn-primary"
              style={{
                backgroundColor: '#FF4D4D',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'black')}
              onMouseOut={e => (e.currentTarget.style.color = '')}
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          /* Basket Items */
          <div className="p-4 space-y-3">
            {basketItems.map((item) => (
              <Basketcard key={item.id} item={item} storeDetails={storeDetails} />
            ))}
          </div>
        )}
      </div>

      {/* Order Actions - Only show when items in basket */}
      {basketItems.length > 0 && (
        <div className="border-t border-gray-200 bg-white">
          {/* Order Note Button */}
          <button
            onClick={() => setIsPopupOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <StickyNote className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Add a note for the restaurant</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
          </button>

          {/* Subtotal */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-gray-600">Subtotal ({totalItems} items)</span>
            <span className="font-semibold text-gray-900">
              {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Checkout Button */}
          <div className="p-4 pt-0">
            <button
              onClick={handleOrderClick}
              className="w-full flex items-center justify-center gap-2 text-white py-4 px-6 rounded-xl text-base font-semibold transition-colors shadow-md active:scale-[0.98]" style={{ backgroundColor: '#FF4D4D' }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="text-white">Proceed to Checkout</span>
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Delivery fees calculated at checkout
            </p>
          </div>
        </div>
      )}

      {/* Mobile Fixed Checkout - Only shown on basket page (not on menu page which has its own) */}
      {basketItems.length > 0 && (
        <div className="hidden">{/* Checkout button is in the basket content above */}</div>
      )}

      {/* Order Note Popup */}
      {isPopupOpen && (
        <Popup
          width="480px"
          height="auto"
          content={<OrderNotePop onClose={() => setIsPopupOpen(false)} />}
          onClose={() => setIsPopupOpen(false)}
        />
      )}

      {/* Change Popup */}
      <BottomPopup isOpen={bottomPopupOpen} onClose={() => setBottomPopupOpen(false)}>
        <BasketChange storeDetails={storeDetails} />
      </BottomPopup>
    </div>
  );
};

export default Basket;
