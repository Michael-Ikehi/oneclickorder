'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store/store';
import { StoreDetails } from '@/lib/services/apiTypes';
import MenuCard from './MenuCard';
import Navigation from './Navigation';
import FloatingCart from './FloatingCart';
import Image from 'next/image';

interface StoreFeedPageProps {
  store: StoreDetails;
}

// Exported for use in StoreClient (when used under takeaway route with existing Provider)
export function StoreFeedContent({ store }: StoreFeedPageProps) {
  const menus = store.store_menu || [];

  // Build store URL for cart navigation
  const storeUrl = store.cityData && store.areaData 
    ? `/takeaway/${store.cityData.slug}/${store.areaData.slug}/${store.slug}`
    : `/takeaway/london/london/${store.slug}`; // Fallback

  // Manage viewport styles on mount/unmount to prevent mobile viewport issues
  useEffect(() => {
    // Store original styles
    const originalHtmlStyle = document.documentElement.style.cssText;
    const originalBodyStyle = document.body.style.cssText;
    
    // Apply feed-specific styles
    document.documentElement.style.cssText = `
      overflow: hidden;
      height: 100%;
      height: 100dvh;
      position: fixed;
      width: 100%;
      touch-action: pan-y;
      overscroll-behavior: none;
    `;
    
    document.body.style.cssText = `
      overflow: hidden;
      height: 100%;
      height: 100dvh;
      position: fixed;
      width: 100%;
      touch-action: pan-y;
      overscroll-behavior: none;
      margin: 0;
      padding: 0;
    `;

    // Cleanup on unmount - restore original styles
    return () => {
      document.documentElement.style.cssText = originalHtmlStyle;
      document.body.style.cssText = originalBodyStyle;
    };
  }, []);

  if (menus.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        <Navigation 
          storeName={store.slug} 
          citySlug={store.cityData?.slug}
          areaSlug={store.areaData?.slug}
        />
        <main className="feed-main flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {store.logo ? (
                <Image 
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/uploads/store/${store.logo}`}
                  alt={store.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image 
                  src="/images/mask.png" 
                  alt="FoodHutz" 
                  width={48} 
                  height={52}
                  className="opacity-50"
                />
              )}
            </div>
            <h2 className="text-white text-xl font-bold mb-2" style={{color: 'white'}}>{store.name}</h2>
            <p className="text-white" style={{color: 'white'}}>No menus available yet</p>
            <p className="text-white" style={{color: 'white'}}>Check back soon for updates!</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <Navigation 
        storeName={store.slug}
        citySlug={store.cityData?.slug}
        areaSlug={store.areaData?.slug}
      />
      
      {/* Scrollable Feed Container */}
      <main className="feed-main h-full">
        <div className="feed-scroll-container">
          {menus.map((menu, index) => (
            <div key={menu.id} className="feed-item">
              <MenuCard 
                menu={menu} 
                store={store}
                index={index} 
              />
            </div>
          ))}
          
          {/* End of Feed */}
          <div className="feed-item flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {store.logo ? (
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/uploads/store/${store.logo}`}
                    alt={store.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image 
                    src="/images/mask.png" 
                    alt="FoodHutz" 
                    width={32} 
                    height={36}
                    className="opacity-50"
                  />
                )}
              </div>
              <p className="text-white font-semibold" style={{color: 'white'}}>{store.name}</p>
              <p className="text-white" style={{color: 'white'}}>You&apos;ve seen all our menus!</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Cart */}
      <FloatingCart storeUrl={storeUrl} currency={store.zone_currency?.currency_symbol} />

      {/* Feed Styles - Scoped to feed components only, not html/body */}
      <style jsx>{`
        .feed-scroll-container {
          height: 100%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          overscroll-behavior-y: contain;
          touch-action: pan-y;
        }
        
        .feed-item {
          height: 100%;
          width: 100%;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          flex-shrink: 0;
        }
        
        /* Hide scrollbar */
        .feed-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .feed-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .feed-main {
            height: calc(100% - 64px);
            height: calc(100dvh - 64px);
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        }
        
        @media (min-width: 1024px) {
          .feed-main {
            margin-left: 80px;
            height: 100%;
            height: 100dvh;
          }
        }
        
        @media (min-width: 1280px) {
          .feed-main {
            margin-left: 256px;
          }
        }
      `}</style>
    </div>
  );
}

export default function StoreFeedPage({ store: storeData }: StoreFeedPageProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StoreFeedContent store={storeData} />
      </PersistGate>
    </Provider>
  );
}

