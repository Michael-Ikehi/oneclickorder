'use client';
import React, { useRef, useState, useEffect } from 'react';
import CouponCard from './CouponCard'; 
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';

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

interface CouponsProps {
  storeDetails: { store_coupon_discount: StoreCoupon[] };
}

const Coupons = ({ storeDetails }: CouponsProps) => {
  const coupons = storeDetails?.store_coupon_discount || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll capability
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 5
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [coupons]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

   if (coupons.length === 0) return null;

  return (
    <section className="px-4 md:px-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-[#FF4D4D]" />
          <h2 className="font-heading text-sm md:text-base font-bold text-gray-900">
            Available Offers
          </h2>
      </div>

        {/* Desktop Navigation */}
        {coupons.length > 3 && (
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center transition-all
                ${canScrollLeft
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }
              `}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center transition-all
                ${canScrollRight
                  ? 'bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }
              `}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Coupons Slider */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
      >
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex-shrink-0">
            <CouponCard
              code={coupon.code}
              discount={coupon.discount}
              discountType={coupon.discount_type}
              description={coupon.description || coupon.title}
              minPurchase={coupon.min_purchase}
              expireDate={coupon.expire_date}
            />
          </div>
        ))}
    </div>
    </section>
  );
};

export default Coupons;
