'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import StoreInfo from './store info/StoreInfo';
import Review from './reviews/Review';
import { StoreDetails } from '../landing-page/LandingPage';
import { Store, MessageSquare, Star } from 'lucide-react';

interface InfoProps {
  storeDetails: StoreDetails;
}

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

type TabType = 'storeInfo' | 'reviews';

const InfoPop = ({ storeDetails }: InfoProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('storeInfo');

  // Calculate average rating from approved reviews only
  const approvedReviews = (storeDetails.reviews || []).filter(r => r.status === 'approved');
  const reviewCount = approvedReviews.length;
  const totalRating = approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const rating = reviewCount > 0 ? totalRating / reviewCount : 0;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'storeInfo', label: 'Store Info', icon: <Store className="w-4 h-4" /> },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: <MessageSquare className="w-4 h-4" />,
      count: reviewCount,
    },
  ];

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-hidden bg-white rounded-xl">
      {/* Header Image */}
      <div className="relative w-full h-[180px] flex-shrink-0">
          <Image
            src={`${baseImage}/uploads/store/cover/${storeDetails.cover_photo}`}
          alt={storeDetails.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Store Name & Rating */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="font-heading text-xl font-bold text-white mb-2 line-clamp-1">
            {storeDetails.name}
          </h2>
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
              </div>
              {reviewCount > 0 && (
                <span className="text-sm text-white/80">
                  ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
        </div>
        </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-white sticky top-0 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4
              text-sm font-medium transition-colors relative
              ${activeTab === tab.id 
                ? 'text-primary' 
                : 'text-secondary-500 hover:text-secondary-700'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? 'bg-primary-100 text-primary' : 'bg-secondary-100 text-secondary-600'}
              `}>
                {tab.count}
              </span>
            )}
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
        </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
          {activeTab === 'storeInfo' ? (
            <StoreInfo storeDetails={storeDetails} />
          ) : (
            <Review storeDetails={storeDetails} />
          )}
      </div>
    </div>
  );
};

export default InfoPop;
