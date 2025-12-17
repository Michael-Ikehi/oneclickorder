'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store/store';
import FeedCard, { FeedItem } from './FeedCard';
import Navigation from './Navigation';
import Image from 'next/image';

interface FeedPageProps {
  initialItems: FeedItem[];
}

function FeedContent({ initialItems }: FeedPageProps) {
  if (initialItems.length === 0) {
    return (
      <div className="h-screen h-[100dvh] bg-black flex flex-col">
        <Navigation />
        <main className="feed-main flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Image 
                src="/images/mask.png" 
                alt="FoodHutz" 
                width={48} 
                height={52}
                className="opacity-50"
              />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">No food to show yet</h2>
            <p className="text-gray-400">Check back soon for delicious dishes!</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-black overflow-hidden">
      <Navigation />
      
      {/* Scrollable Feed Container */}
      <main className="feed-main h-full">
        <div className="feed-scroll-container">
          {initialItems.map((item, index) => (
            <div key={item.id} className="feed-item">
              <FeedCard item={item} index={index} />
            </div>
          ))}
          
          {/* End of Feed */}
          <div className="feed-item flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <Image 
                  src="/images/mask.png" 
                  alt="FoodHutz" 
                  width={32} 
                  height={36}
                  className="opacity-50"
                />
              </div>
              <p className="text-gray-500 text-sm">You&apos;ve seen it all!</p>
              <p className="text-gray-600 text-xs mt-1">Check back later for more</p>
            </div>
          </div>
        </div>
      </main>

      {/* Feed Styles */}
      <style jsx global>{`
        /* Prevent body scroll */
        html, body {
          overflow: hidden;
          height: 100%;
          height: 100dvh;
        }
        
        .feed-scroll-container {
          height: 100%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        .feed-item {
          height: 100%;
          width: 100%;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          flex-shrink: 0;
        }
        
        /* Mobile - account for bottom nav (64px + safe area) */
        @media (max-width: 1023px) {
          .feed-main {
            height: calc(100dvh - 64px);
            height: calc(100vh - 64px);
          }
          
          .feed-scroll-container {
            height: 100%;
          }
          
          .feed-item {
            height: 100%;
          }
        }
        
        /* Desktop - account for sidebar */
        @media (min-width: 1024px) {
          .feed-main {
            margin-left: 80px;
            height: 100dvh;
            height: 100vh;
          }
        }
        
        @media (min-width: 1280px) {
          .feed-main {
            margin-left: 256px;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .feed-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .feed-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Wrap with Provider for Redux access
export default function FeedPage({ initialItems }: FeedPageProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FeedContent initialItems={initialItems} />
      </PersistGate>
    </Provider>
  );
}
