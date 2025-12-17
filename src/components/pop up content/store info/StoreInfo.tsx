'use client';
import { StoreDetails } from '@/components/landing-page/LandingPage';
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  ShieldCheck,
  Globe,
  BadgePercent
} from 'lucide-react';

interface Schedule {
  id: number;
  store_id: number;
  day: number;
  opening_time: string;
  closing_time: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface GalleryItem {
  id: number;
  picture: string;
  title?: string;
}

interface ExtendedStoreDetails extends StoreDetails {
  schedules?: Schedule[];
  schedule?: Schedule[];
  hygiene_number?: string;
  address?: string;
  phone?: string;
  website?: string;
  storegallery?: GalleryItem[];
  gallery?: GalleryItem[];
  free_delivery?: boolean;
  self_delivery_system?: number;
  minimum_order?: number;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

// Accordion Item Component
function AccordionItem({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-light last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-4 hover:bg-secondary-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-secondary-500" />
          <span className="font-medium text-secondary-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-secondary-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

// Hygiene Rating Component
function HygieneRating({ rating }: { rating: number }) {
  const ratingLabels: Record<number, string> = {
    0: 'Urgent Improvement Necessary',
    1: 'Major Improvement Necessary',
    2: 'Improvement Necessary',
    3: 'Generally Satisfactory',
    4: 'Good',
    5: 'Very Good',
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      <div className="bg-gradient-to-r from-lime-400 to-lime-300 p-4">
        <p className="text-xs font-bold text-lime-900 uppercase tracking-wider mb-3">
          Food Hygiene Rating
        </p>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((num) => {
            const isActive = num === rating;
                        return (
                          <div
                            key={num}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm
                  transition-transform
                  ${isActive
                    ? 'bg-lime-900 text-white scale-110 shadow-md'
                    : 'bg-white/80 text-lime-900 border border-lime-600'
                  }
                `}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  </div>
      <div className="bg-lime-900 text-white py-2 px-4 text-center">
        <p className="font-semibold text-sm">{ratingLabels[rating] || 'Rating'}</p>
                </div>
                    </div>
                  );
}

const StoreInfo: React.FC<{ storeDetails: ExtendedStoreDetails }> = ({ storeDetails }) => {
  const scheduleArray = storeDetails?.schedules || storeDetails?.schedule || [];
  const galleryArray = storeDetails?.storegallery || storeDetails?.gallery || [];
  const hygieneRating = parseInt(storeDetails.hygiene_number || '0') || 0;
  
  // Sort schedules by day
  const sortedSchedules = [...scheduleArray].sort((a, b) => a.day - b.day);

  // Get today's day number (0-6)
  const today = new Date().getDay();

  return (
    <div className="divide-y divide-border-light">
      {/* Quick Info */}
      <div className="p-4 space-y-3">
        {/* Address */}
        {storeDetails.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-secondary-900">Address</p>
              <p className="text-sm text-secondary-600">{storeDetails.address}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        {storeDetails.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-secondary-900">Phone</p>
              <a href={`tel:${storeDetails.phone}`} className="text-sm text-primary hover:underline">
                {storeDetails.phone}
              </a>
            </div>
          </div>
        )}

        {/* Website */}
        {storeDetails.website && (
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-secondary-900">Website</p>
              <a 
                href={storeDetails.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Visit Website
              </a>
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-secondary-900">Delivery</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {storeDetails.delivery_time && (
                <span className="badge badge-primary text-xs">
                  {storeDetails.delivery_time}
                </span>
              )}
              {storeDetails.free_delivery && (
                <span className="badge badge-success text-xs">
                  <BadgePercent className="w-3 h-3 mr-1" />
                  Free Delivery
                </span>
              )}
              {storeDetails.estimated_delivery_fee?.minimum_shipping_charge && (
                <span className="badge bg-secondary-100 text-secondary-700 text-xs">
                  From £{storeDetails.estimated_delivery_fee.minimum_shipping_charge.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      {sortedSchedules.length > 0 && (
        <AccordionItem title="Opening Hours" icon={Clock} defaultOpen>
          <div className="space-y-2">
            {sortedSchedules.map((schedule, index) => {
              const isToday = schedule.day === today;
              return (
                <div 
                  key={index} 
                  className={`
                    flex justify-between items-center py-2 px-3 rounded-lg
                    ${isToday ? 'bg-primary-50 border border-primary/20' : ''}
                  `}
                >
                  <span className={`text-sm ${isToday ? 'font-semibold text-primary' : 'text-secondary-700'}`}>
                    {DAYS_OF_WEEK[schedule.day]}
                    {isToday && <span className="ml-2 text-xs">(Today)</span>}
                  </span>
                  <span className={`text-sm ${isToday ? 'font-semibold text-primary' : 'text-secondary-600'}`}>
                    {schedule.opening_time} - {schedule.closing_time}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionItem>
      )}

      {/* Hygiene Rating */}
      <AccordionItem title="Food Hygiene Rating" icon={ShieldCheck}>
        <HygieneRating rating={hygieneRating} />
        <p className="text-xs text-secondary-500 mt-3">
          Food hygiene ratings help you choose where to eat or shop for food by telling you how seriously the business takes food hygiene.
        </p>
      </AccordionItem>

      {/* Gallery */}
      {galleryArray.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-secondary-900 mb-3">Gallery</h4>
          <div className="grid grid-cols-3 gap-2">
            {galleryArray.slice(0, 6).map((item, index) => (
              <div key={item.id || index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={`${baseImage}/uploads/store/${item.picture}`}
                  alt={item.title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
          {galleryArray.length > 6 && (
            <p className="text-sm text-secondary-500 text-center mt-2">
              +{galleryArray.length - 6} more photos
            </p>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="p-4">
        <p className="text-xs text-secondary-500">
          Note: Ordering alcohol requires a valid ID upon delivery. Menu prices may vary. 
          Allergen information available upon request.
        </p>
      </div>
    </div>
  );
};

export default StoreInfo;
