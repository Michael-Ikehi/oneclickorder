'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true, message }) => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setVisible(false);
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const loader = (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6
        ${fullScreen ? 'bg-white/95 backdrop-blur-sm' : ''} 
        pointer-events-auto
      `}
      role="status"
      aria-label="Loading"
    >
      {/* Animated Logo */}
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-secondary-100" />
        
        {/* Spinning ring */}
        <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/mask.png"
            alt="FoodHutz"
            width={36}
            height={40}
            className="animate-pulse-subtle"
          />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="text-secondary-600 font-medium">
          {message || 'Loading...'}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  // Render using portal for global overlay
  if (mounted && fullScreen && typeof window !== 'undefined') {
    const body = document.querySelector('body');
    return body ? createPortal(loader, body) : loader;
  }

  return loader;
};

export default Loader;
