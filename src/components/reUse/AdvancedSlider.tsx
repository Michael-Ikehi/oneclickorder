'use client';
import React, { useRef, useState, useEffect } from 'react';

interface AdvancedSliderProps {
  children: React.ReactNode;
  PrevButton: (canScrollLeft: boolean) => React.ReactNode;
  NextButton: (canScrollRight: boolean) => React.ReactNode;
}

const AdvancedSlider: React.FC<AdvancedSliderProps> = ({ children, PrevButton, NextButton }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateScrollState();
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(updateScrollState, 300); // update after scroll
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(updateScrollState, 300); // update after scroll
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10"
        onClick={canScrollLeft ? scrollLeft : undefined}
      >
        {PrevButton(canScrollLeft)}
      </div>

      <div ref={sliderRef} className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar w-full">
        {children}
      </div>

      <div
        className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10"
        onClick={canScrollRight ? scrollRight : undefined}
      >
        {NextButton(canScrollRight)}
      </div>
    </div>
  );
};

export default AdvancedSlider;
