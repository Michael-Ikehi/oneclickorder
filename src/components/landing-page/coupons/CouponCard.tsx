'use client';
import React, { useState } from 'react';
import { Copy, Check, Clock } from 'lucide-react';

interface CouponCardProps {
  code: string;
  discount: number;
  discountType: string;
  description: string;
  minPurchase?: number;
  expireDate?: string;
  }

const CouponCard: React.FC<CouponCardProps> = ({
  code,
  discount,
  discountType,
  description,
  minPurchase,
  expireDate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for mobile/older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Still show copied feedback even if it might have worked via fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format discount text
  const discountText = discountType === 'percent' ? `${discount}% OFF` : `£${discount} OFF`;

  // Format expiry date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const expiryFormatted = formatDate(expireDate);

  return (
    <div className="relative w-[200px] bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
      {/* Decorative circles for coupon effect */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-100" />
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-100" />
      
      {/* Dashed line */}
      <div className="absolute left-4 right-4 top-1/2 border-t border-dashed border-red-200" />

      <div className="p-2.5">
        {/* Top Section */}
        <div className="pb-2">
          <span className="inline-block px-2 py-0.5 bg-[#FF4D4D] text-white text-xs font-bold rounded mb-1">
            {discountText}
          </span>
          <p className="text-xs text-gray-600 font-medium line-clamp-1">
            {description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="pt-2">
          {/* Code & Copy */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 px-2 py-1.5 bg-gray-100 rounded">
              <p className="text-[10px] text-gray-500">Code</p>
              <p className="font-mono font-bold text-gray-900 text-xs tracking-wider">
                {code}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={`
                flex items-center justify-center w-8 h-8 rounded transition-all
                ${copied
                  ? 'bg-green-500 text-white'
                  : 'bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]'
                }
              `}
              aria-label={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Details Row */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
            {minPurchase && minPurchase > 0 && (
              <span>Min: £{minPurchase}</span>
            )}
            {expiryFormatted && (
              <span className="flex items-center gap-0.5 ml-auto">
                <Clock className="w-2.5 h-2.5" />
                {expiryFormatted}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
