'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useGetCustomerInfoQuery, useGetRunningOrdersQuery } from '@/lib/services/api';
import { Home, ShoppingCart, Compass, ClipboardList, User } from 'lucide-react';

interface NavigationProps {
  storeName?: string;
  citySlug?: string;
  areaSlug?: string;
}

export default function Navigation({ storeName, citySlug, areaSlug }: NavigationProps) {
  const pathname = usePathname();
  
  // Get auth state
  const token = useSelector((state: RootState) => state.auth.token);
  const isLoggedIn = !!token;
  
  // Get basket items for cart badge
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const cartItemCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Get customer info if logged in
  const { data: customerInfo } = useGetCustomerInfoQuery(undefined, {
    skip: !isLoggedIn,
  });
  
  // Get running orders for orders badge
  const { data: orderData } = useGetRunningOrdersQuery(
    { limit: 50, offset: 1 },
    { skip: !isLoggedIn }
  );
  
  // Filter for ongoing orders (not delivered or canceled)
  const ongoingOrdersCount = orderData?.orders?.filter(
    (order) => order.order_status !== 'delivered' && order.order_status !== 'canceled'
  )?.length ?? 0;
  
  // Get store params from Redux to build store-specific URLs
  const storeParams = useSelector((state: RootState) => state.storeParams);
  const { city: reduxCity, area: reduxArea, storeName: savedStoreName } = storeParams || {};
  
  // Use prop values first, then fall back to Redux params
  const city = citySlug || reduxCity;
  const area = areaSlug || reduxArea;
  const currentStore = storeName || savedStoreName;
  
  // Build base URL for store pages (for login/profile/basket which live under takeaway route)
  const storeBaseUrl = city && area && currentStore 
    ? `/takeaway/${city}/${area}/${currentStore}` 
    : null;

  // Login URL with redirect to specific destination
  const getLoginUrl = (redirectTo?: string) => {
    const baseLoginUrl = storeBaseUrl ? `${storeBaseUrl}/login` : '/takeaway';
    // Use provided redirect or current path
    const redirectParam = encodeURIComponent(redirectTo || pathname);
    return `${baseLoginUrl}?redirect=${redirectParam}`;
  };

  const loginUrl = getLoginUrl();
  
  // Specific redirect URLs for protected pages
  const cartUrl = storeBaseUrl ? `${storeBaseUrl}/basket` : '/';
  const ordersUrl = storeBaseUrl ? `${storeBaseUrl}/profile?tab=orders` : '/';
  const profileUrl = storeBaseUrl ? `${storeBaseUrl}/profile` : '/';

  // Navigation items with dynamic URLs based on login status
  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      href: currentStore ? `/${currentStore}` : '/',
      isSpecial: false,
      requiresAuth: false,
    },
    { 
      icon: ShoppingCart, 
      label: 'Cart', 
      href: isLoggedIn ? cartUrl : getLoginUrl(cartUrl),
      isSpecial: false,
      requiresAuth: true,
    },
    { 
      icon: Compass, 
      label: 'Explore', 
      href: currentStore ? `/${currentStore}` : '/',
      isSpecial: true,
      requiresAuth: false,
    },
    { 
      icon: ClipboardList, 
      label: 'Orders', 
      href: isLoggedIn ? ordersUrl : getLoginUrl(ordersUrl),
      isSpecial: false,
      requiresAuth: true,
    },
    { 
      icon: User, 
      label: 'Me', 
      href: isLoggedIn ? profileUrl : getLoginUrl(profileUrl),
      isSpecial: false,
      requiresAuth: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/' || href === `/${currentStore}`) return pathname === '/' || pathname === `/${currentStore}`;
    return pathname.startsWith(href);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!customerInfo) return null;
    const firstName = customerInfo.f_name || '';
    const lastName = customerInfo.l_name || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  const getUserPhone = () => {
    return customerInfo?.phone || '';
  };

  return (
    <>
      {/* Desktop Sidebar - Left */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 xl:w-64 bg-black border-r border-white/10 flex-col z-50">
        {/* Logo */}
        <Link href={currentStore ? `/${currentStore}` : '/'} className="flex items-center gap-3 p-4 xl:px-6 hover:bg-white/5 transition-colors">
          <Image 
            src="/images/mask.png" 
            alt="FoodHutz" 
            width={40} 
            height={44} 
            className="w-10 h-11 flex-shrink-0"
          />
          <span className="font-bold text-xl text-white hidden xl:block">FOODHUTZ</span>
        </Link>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-2 px-3 xl:px-4 py-6" style={{ color: '#ffffff' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const [isHovered, setIsHovered] = useState(false);

          return (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200
                ${item.isSpecial 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20'
                  : active 
                    ? 'bg-white/10 text-white font-semibold' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
                justify-center xl:justify-start
              `}
              style={{
                color: item.isSpecial && isHovered ? "black" : undefined
              }}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 flex-shrink-0 ${active && !item.isSpecial ? 'fill-white/20' : ''}`}
                  style={{
                    color: item.isSpecial && isHovered ? "black" : undefined
                  }}
                />
                {/* Cart Badge */}
                {item.label === 'Cart' && cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartItemCount}
                  </span>
                )}
                {/* Orders Badge */}
                {item.label === 'Orders' && ongoingOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {ongoingOrdersCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:block text-base">
                {item.label}
              </span>
            </Link>
          );
          })}
        </div>

        {/* Bottom Section - User Info or Sign In */}
        <div className="p-4 xl:px-6 border-t border-white/10">
          <Link 
            href={isLoggedIn ? profileUrl : getLoginUrl(profileUrl)} 
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors justify-center xl:justify-start"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              {isLoggedIn && customerInfo ? (
                <span className="text-white font-bold text-sm">
                  {(customerInfo.f_name?.[0] || 'U').toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="hidden xl:block min-w-0">
              {isLoggedIn && customerInfo ? (
                <>
                  <p className="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{getUserPhone()}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-white">Sign In</p>
                  <p className="text-xs text-gray-500">Access your account</p>
                </>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Fixed 64px height */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-around h-full px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all relative
                  ${item.isSpecial 
                    ? '' 
                    : active 
                      ? 'text-white' 
                      : 'text-gray-500'
                  }
                `}
              >
                {item.isSpecial ? (
                  <div className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 border-4 border-black">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${active ? 'fill-white/30' : ''}`} strokeWidth={active ? 2.5 : 2} />
                      {/* Cart Badge - Mobile */}
                      {item.label === 'Cart' && cartItemCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#FF4D4D] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {cartItemCount}
                        </span>
                      )}
                      {/* Orders Badge - Mobile */}
                      {item.label === 'Orders' && ongoingOrdersCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#FF4D4D] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {ongoingOrdersCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    {active && (
                      <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
