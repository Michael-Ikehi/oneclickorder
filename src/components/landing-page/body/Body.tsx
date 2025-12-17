'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Tabs from './Tabs';
import BodyCards from './BodyCards';
import ItemDetailModal from './ItemDetailModal';
import { StoreItem } from '../LandingPage';
import { useDispatch, useSelector } from 'react-redux';
import { logActivity } from '@/lib/store/activityLogSlice';
import { addToBasket, removeFromBasket } from '@/lib/store/basketSlice';
import { RootState } from '@/lib/store/store';
import { AddOn, BodyProps, FoodVariation, Menu, RawFoodVariation } from './bodyType';
import { ChevronUp } from 'lucide-react';
import { showToast } from '@/components/reUse/ToastNotification';

const isItemAvailable = (start: string, end: string): boolean => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight windows (e.g., 22:00 to 06:00)
  if (startMinutes > endMinutes) {
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
  }

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
};

const Body: React.FC<BodyProps> = ({ storeDetails }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<StoreItem | null>(null);
  const [selectedFoodVariations, setSelectedFoodVariations] = useState<FoodVariation[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const dispatch = useDispatch();
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const timestamp = new Date().toLocaleString();

  const menus: Menu[] = useMemo(() => {
    const items = storeDetails.items || [];
    return (storeDetails.store_menu || []).filter((menu) =>
      items.some((item) => item.menu_id === menu.id)
    );
  }, [storeDetails]);

  useEffect(() => {
    if (menus.length) {
      setActiveTab(menus[0].id);
    }
  }, [menus]);

  // Handle scroll to show/hide scroll-to-top button and update active tab
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      const scrollTop = window.scrollY + 120;
      let currentMenuId = activeTab;
      
      for (const menu of menus) {
        const ref = categoryRefs.current[menu.id];
        if (ref) {
          const { offsetTop, offsetHeight } = ref;
          if (scrollTop >= offsetTop && scrollTop < offsetTop + offsetHeight) {
            currentMenuId = menu.id;
            break;
          }
        }
      }

      if (currentMenuId !== activeTab) {
        setActiveTab(currentMenuId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menus, activeTab]);

  const handleTabClick = (menuId: number) => {
    const ref = categoryRefs.current[menuId];
    if (ref) {
      const headerOffset = 80;
      const elementPosition = ref.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setActiveTab(menuId);
  };

  // Get quantity of an item in basket (for items without addons)
  const getItemQuantity = (itemId: number): number => {
    const itemKey = `${itemId}-no-options`;
    const basketItem = basketItems.find(item => item.key === itemKey);
    return basketItem?.quantity || 0;
  };

  // Check if store is active and open
  const isStoreActive = storeDetails.active;
  const isStoreOpen = storeDetails.open;

  // Open popup for items with addons
  const openAddonsPopup = (card: StoreItem, foodVariations: FoodVariation[], addOns: AddOn[]) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    dispatch(logActivity(`User clicked on item "${card.name}" at ${timestamp}`));
    setSelectedCard(card);
    setSelectedFoodVariations(foodVariations);
    setSelectedAddOns(addOns);
    setIsPopupOpen(true);
  };

  // Calculate discounted price
  const getDiscountedPrice = (card: StoreItem) => {
    const discount = card.discount || 0;
    if (discount > 0) {
      return card.price - (card.price * discount / 100);
    }
    return card.price;
  };

  // Increase quantity for items without addons
  const handleIncrease = (card: StoreItem) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    
    const itemKey = `${card.id}-no-options`;
    const currentQty = getItemQuantity(card.id);
    const discountedPrice = getDiscountedPrice(card);
    
    dispatch(
      addToBasket({
        id: card.id,
        key: itemKey,
        name: card.name,
        price: discountedPrice,
        totalPrice: discountedPrice * (currentQty + 1),
        quantity: currentQty + 1,
        image: card.image,
        is_buy_get_free: card.is_buy_get_free,
        freeQuantity: card.is_buy_get_free ? currentQty + 1 : undefined,
      })
    );
  };

  // Decrease quantity for items without addons
  const handleDecrease = (card: StoreItem) => {
    const itemKey = `${card.id}-no-options`;
    const currentQty = getItemQuantity(card.id);
    
    if (currentQty <= 1) {
      // Remove item completely
      dispatch(removeFromBasket({ key: itemKey }));
    } else {
      const discountedPrice = getDiscountedPrice(card);
      dispatch(
        addToBasket({
          id: card.id,
          key: itemKey,
          name: card.name,
          price: discountedPrice,
          totalPrice: discountedPrice * (currentQty - 1),
          quantity: currentQty - 1,
          image: card.image,
          is_buy_get_free: card.is_buy_get_free,
          freeQuantity: card.is_buy_get_free ? currentQty - 1 : undefined,
        })
      );
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedCard(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative mt-6 md:mt-8">
      {/* Section Header */}
      <div className="px-4 md:px-0 mb-4">
        
      </div>

      {/* Sticky Tabs Navigation */}
      <div className="sticky top-16 z-[15] bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 md:px-0 py-3">
          <Tabs
            activeTab={activeTab}
            setActiveTab={handleTabClick}
            categories={menus.map((menu) => ({ id: menu.id, title: menu.title }))}
          />
        </div>
      </div>

      {/* Menu Sections */}
      <div className="mt-6 px-4 md:px-0">
        {menus.map((menu, menuIndex) => {
          const menuItems = storeDetails.items?.filter((item) => item.menu_id === menu.id) || [];

          return (
            <div
              key={menu.id}
              id={`menu-${menu.id}`}
              ref={(el) => {
                categoryRefs.current[menu.id] = el;
              }}
              className={`${menuIndex > 0 ? 'mt-10 pt-6 border-t border-gray-200' : ''}`}
            >
              {/* Category Header */}
              <div className="mb-5">
                <h3 className="font-heading text-lg md:text-xl font-bold text-gray-900">
                  {menu.title}
                </h3>
                {/* <p className="text-xs text-gray-400 mt-1">
                  {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
                </p> */}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-3 md:gap-5">
                {menuItems.map((item, index) => {
                  const isAvailable = isItemAvailable(
                    item.available_time_starts,
                    item.available_time_ends
                  );

                  let foodVariations: FoodVariation[] = [];
                  let addOns: AddOn[] = [];

                  try {
                    const raw = JSON.parse(item.food_variations || '[]') as RawFoodVariation[];
                    foodVariations = raw.map((variation) => ({
                      ...variation,
                      min: Number(variation.min),
                      max: Number(variation.max),
                      required: variation.required === 'on',
                      values: variation.values.map((v) => ({
                        label: v.label,
                        optionPrice: Number(v.optionPrice),
                      })),
                    }));

                    if (Array.isArray(item.add_ons_data)) {
                      addOns = item.add_ons_data;
                    }
                  } catch (error) {
                    console.error(`Error parsing item data for "${item.name}":`, error);
                  }

                  const hasAddons = foodVariations.length > 0 || addOns.length > 0;
                  const quantity = hasAddons ? 0 : getItemQuantity(item.id);

                  return (
                    <BodyCards
                      key={`${menu.id}-${item.id}-${index}`}
                      name={item.name}
                      img={item.image}
                      price={getDiscountedPrice(item)}
                      originalPrice={item.discount ? item.price : undefined}
                      discount={item.discount}
                      currency={storeDetails.zone_currency?.currency_symbol ?? '£'}
                      className={!isAvailable ? 'opacity-50 pointer-events-none grayscale' : ''}
                      quantity={quantity}
                      hasAddons={hasAddons}
                      onImageClick={() => openAddonsPopup(item, foodVariations, addOns)}
                      onIncrease={() => hasAddons ? openAddonsPopup(item, foodVariations, addOns) : handleIncrease(item)}
                      onDecrease={() => handleDecrease(item)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`
          fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40
          w-10 h-10 rounded-full bg-gray-900 text-white shadow-lg
          flex items-center justify-center
          transition-all duration-300
          hover:bg-gray-700 active:scale-95
          ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Item Detail Modal */}
      {isPopupOpen && selectedCard && (
        <ItemDetailModal
          item={selectedCard}
          currency={storeDetails?.zone_currency?.currency_symbol ?? '£'}
          quantity={getItemQuantity(selectedCard.id)}
          hasAddons={selectedFoodVariations.length > 0 || selectedAddOns.length > 0}
          foodVariations={selectedFoodVariations}
          addOns={selectedAddOns}
          onClose={closePopup}
          onAddToCart={(qty, selectedVariations, selectedAddonsFromModal) => {
            const hasAddons = selectedFoodVariations.length > 0 || selectedAddOns.length > 0;
            
            if (hasAddons && selectedVariations) {
              // Item with addons - create unique key based on selections
              const variationKey = Object.entries(selectedVariations)
                .map(([k, v]) => `${k}:${v.join(',')}`)
                .join('|');
              const addonKey = selectedAddonsFromModal?.map(a => a.id).join(',') || '';
              const itemKey = `${selectedCard.id}-${variationKey}-${addonKey}`;
              
              // Calculate price with addons
              let totalUnitPrice = selectedCard.price;
              
              // Add variation prices
              Object.entries(selectedVariations).forEach(([variationName, values]) => {
                const variation = selectedFoodVariations.find(v => v.name === variationName);
                if (variation) {
                  values.forEach(val => {
                    const option = variation.values.find(v => v.label === val);
                    if (option) totalUnitPrice += option.optionPrice;
                  });
                }
              });
              
              // Add addon prices
              selectedAddonsFromModal?.forEach(addon => {
                totalUnitPrice += addon.price || 0;
              });
              
              dispatch(
                addToBasket({
                  id: selectedCard.id,
                  key: itemKey,
                  name: selectedCard.name,
                  price: totalUnitPrice,
                  totalPrice: totalUnitPrice * qty,
                  quantity: qty,
                  image: selectedCard.image,
                  variations: selectedVariations,
                  addons: selectedAddonsFromModal,
                  variationPrice: totalUnitPrice - selectedCard.price,
                })
              );
            } else {
              // Simple item without addons
              const itemKey = `${selectedCard.id}-no-options`;
              const discountedPrice = getDiscountedPrice(selectedCard);
              
              dispatch(
                addToBasket({
                  id: selectedCard.id,
                  key: itemKey,
                  name: selectedCard.name,
                  price: discountedPrice,
                  totalPrice: discountedPrice * qty,
                  quantity: qty,
                  image: selectedCard.image,
                  is_buy_get_free: selectedCard.is_buy_get_free,
                  freeQuantity: selectedCard.is_buy_get_free ? qty : undefined,
                })
              );
            }
            
            dispatch(logActivity(`User added ${qty}x "${selectedCard.name}" to basket at ${timestamp}`));
          }}
        />
      )}
    </section>
  );
};

export default Body;
