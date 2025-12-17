'use client';
import InfoPop from '@/components/pop up content/InfoPop';
import Popup from '@/components/reUse/PopUp';
import Image from 'next/image';
import React, { useState } from 'react';
import { StoreDetails } from '../LandingPage';
import { 
  Star, 
  Clock, 
  MapPin, 
  Info, 
  ChevronRight, 
  ShieldCheck,
  Truck,
  BadgePercent,
  AlertCircle
} from 'lucide-react';

interface RestaurantProps {
  storeDetails: StoreDetails;
}

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const Restaurant: React.FC<RestaurantProps> = ({ storeDetails }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const handleInfoClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const isOpen = storeDetails.open;
  const hasHygieneRating = storeDetails.hygiene_number;
  const hasDelivery = storeDetails.delivery;
  const hasTakeaway = storeDetails.take_away;
  const deliveryTime = storeDetails.delivery_time;
  
  // Calculate average rating from approved reviews only
  const approvedReviews = (storeDetails.reviews || []).filter(r => r.status === 'approved');
  const reviewCount = approvedReviews.length;
  const totalRating = approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const rating = reviewCount > 0 ? totalRating / reviewCount : 0;
  
  // Calculate estimated delivery fee if available
  const deliveryFee = storeDetails.free_delivery 
    ? 'Free' 
    : storeDetails.estimated_delivery_fee?.minimum_shipping_charge 
      ? `From £${storeDetails.estimated_delivery_fee.minimum_shipping_charge.toFixed(2)}`
      : null;

  return (
    <section className="animate-fadeIn">
      {/* Hero Image Container */}
      <div className="relative w-full h-[200px] md:h-[280px] lg:h-[320px] rounded-xl md:rounded-2xl overflow-hidden shadow-elevated">
        {/* Cover Image */}
          <Image
            src={`${baseImage}/uploads/store/cover/${storeDetails.cover_photo}`}
          alt={`${storeDetails.name} - Order food online`}
            fill
            priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 75vw"
          />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
            ${isOpen 
              ? 'bg-success/90 text-white' 
              : 'bg-secondary-800/90 text-white'
            }
          `}>
            <span
              className={`w-2 h-2 rounded-full ${
                isOpen ? 'bg-green-500 animate-pulse-subtle' : 'bg-[#FF4D4D]'
              }`}
            />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Quick Stats - Top Right (Desktop) */}
        <div className="absolute top-4 right-4 hidden md:flex items-center gap-2">
          {rating && rating > 0 && (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-secondary-900">{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-xs text-secondary-500">({reviewCount})</span>
              )}
            </div>
          )}
          {deliveryTime && (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Clock className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-secondary-900">{deliveryTime}</span>
            </div>
          )}
        </div>

        {/* Store Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="flex items-end gap-4">
            {/* Store Details */}
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-red-500 mb-1 line-clamp-1 drop-shadow-lg" style={{ color: '#ffffff'}}>
                {storeDetails.name}
              </h1>
              
              {/* Mobile Stats */}
              <div className="flex items-center gap-3 text-white/90 text-sm md:hidden">
                {rating && rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {deliveryTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {deliveryTime}
                  </span>
                )}
              </div>

              {/* Service Tags - Desktop */}
              <div className="hidden md:flex items-center gap-2 mt-2">
                {hasDelivery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium text-white">
                    <Truck className="w-3 h-3" />
                    Delivery
                  </span>
                )}
                {hasTakeaway && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium text-white">
                    <MapPin className="w-3 h-3" />
                    Pickup
                  </span>
                )}
                {deliveryFee && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/80 rounded text-xs font-medium text-white">
                    {storeDetails.free_delivery ? <BadgePercent className="w-3 h-3" /> : null}
                    {deliveryFee} delivery
                  </span>
                )}
              </div>
            </div>

            {/* Info Button - Desktop */}
            <button
              onClick={handleInfoClick}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
              aria-label="View store information"
            >
              <Info className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">Store Info</span>
              <ChevronRight className="w-4 h-4 text-secondary-400" />
            </button>
            </div>
          </div>
        </div>

      {/* Info Bar - Below Image */}
      <div className="mt-4 px-1 md:px-0">
        {/* Mobile Alcohol Notice - Always visible */}
        <div className="md:hidden flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700 mb-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Ordering alcohol requires a valid ID on delivery</span>
        </div>

        {/* Mobile Info Toggle */}
        <button
          onClick={() => setShowMobileDetails(!showMobileDetails)}
          className="w-full md:hidden flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-700">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isOpen ? 'Store is open' : 'Store is closed'} • View details
            </span>
            </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showMobileDetails ? 'rotate-90' : ''}`} />
        </button>

        {/* Expandable Details - Mobile */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${showMobileDetails ? 'max-h-96 mt-3' : 'max-h-0'}`}>
          <div className="space-y-3 p-4 bg-white rounded-lg border border-border shadow-sm">
            {/* Service Types */}
            <div className="flex items-center gap-2 flex-wrap">
              {hasDelivery && (
                <span className="badge badge-primary">
                  <Truck className="w-3 h-3 mr-1" />
                  Delivery
                </span>
              )}
              {hasTakeaway && (
                <span className="badge bg-secondary-100 text-secondary-700">
                  <MapPin className="w-3 h-3 mr-1" />
                  Pickup
                </span>
              )}
              {deliveryFee && (
                <span className="badge badge-success">
                  {deliveryFee} delivery
                </span>
              )}
            </div>

            {/* Hygiene Rating */}
            {hasHygieneRating && (
              <div className="flex items-center gap-2 text-sm text-secondary-600">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Hygiene Rating: {hasHygieneRating}</span>
              </div>
            )}

            {/* Alcohol Notice */}
            {/* <div className="flex items-start gap-2 text-sm text-secondary-500 bg-amber-50 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Ordering alcohol requires a valid ID on delivery</span>
            </div> */}

            {/* More Info Button */}
            <button
              onClick={handleInfoClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-secondary-700">View full store info</span>
              <ChevronRight className="w-4 h-4 text-secondary-500" />
            </button>
          </div>
        </div>

        {/* Desktop Info Bar */}
        <div className="hidden md:flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-border shadow-sm mt-4">
          <div className="flex items-center gap-6">
            {/* Hygiene */}
            {hasHygieneRating && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs text-secondary-500">Hygiene Rating</p>
                  <p className="text-sm font-semibold text-secondary-900">{hasHygieneRating}</p>
                </div>
              </div>
            )}

            {/* Delivery Info */}
            {deliveryFee && (
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-secondary-500">Delivery Fee</p>
                  <p className="text-sm font-semibold text-secondary-900">{deliveryFee}</p>
                </div>
                  </div>
            )}

            {/* Min Order */}
            {storeDetails.estimated_delivery_fee?.minimum_shipping_charge !== undefined && (
              <div className="flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-secondary-500" />
                <div>
                  <p className="text-xs text-secondary-500">Min. Delivery Fee</p>
                  <p className="text-sm font-semibold text-secondary-900">
                    £{storeDetails.estimated_delivery_fee.minimum_shipping_charge.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
            </div>

          {/* Alcohol Notice */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span>Valid ID required for alcohol orders</span>
          </div>
        </div>
      </div>

      {/* Info Popup */}
      {isPopupOpen && (
        <Popup
          width="500px"
          height="auto"
          content={<InfoPop storeDetails={storeDetails} />}
          onClose={closePopup}
          mobileFullscreen={true}
        />
      )}
    </section>
  );
};

export default Restaurant;
