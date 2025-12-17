'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Link2, Check, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';

interface ShareModalProps {
  url: string;
  title: string;
  storeName: string;
  storeLogo?: string;
  onClose: () => void;
}

// Social media platform configs
const socialPlatforms = [
  {
    name: 'WhatsApp',
    icon: '/icons/whatsapp.svg',
    color: '#25D366',
    getUrl: (url: string, title: string) => 
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    name: 'Twitter',
    icon: '/icons/twitter.svg', 
    color: '#FFFFFF',
    getUrl: (url: string, title: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: '/icons/facebook.svg',
    color: '#1877F2',
    getUrl: (url: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    icon: '/icons/telegram.svg',
    color: '#0088CC',
    getUrl: (url: string, title: string) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

export default function ShareModal({ url, title, storeName, storeLogo, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  // Wait for client-side mount before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    const shareUrl = platform.getUrl(url, `Check out ${title} from ${storeName}!`);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${title} - ${storeName}`,
          text: `Check out ${title} from ${storeName}!`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed:', err);
      }
    }
  };

  // Don't render until mounted (client-side)
  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Store Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
              {storeLogo ? (
                <Image
                  src={`${baseImage}/uploads/store/${storeLogo}`}
                  alt={storeName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{storeName[0]}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Share</p>
              <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{title}</h3>
            </div>
          </div>

          {/* Decorative line */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Social Share Options */}
        <div className="px-6 py-4">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-4">Share via</p>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className="flex flex-col items-center gap-2 group"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  {/* Fallback icon if SVG not available */}
                  {platform.name === 'WhatsApp' && (
                    <MessageCircle className="w-7 h-7" style={{ color: platform.color }} />
                  )}
                  {platform.name === 'Twitter' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: platform.color }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )}
                  {platform.name === 'Facebook' && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" style={{ color: platform.color }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  {platform.name === 'Telegram' && (
                    <Send className="w-6 h-6" style={{ color: platform.color }} />
                  )}
                </div>
                <span className="text-white/70 text-xs font-medium">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
              <span className="text-white font-medium">More Options</span>
            </button>
          )}

          {/* Copy Link */}
          <div className="relative">
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <Link2 className="w-5 h-5 text-white/50 flex-shrink-0" />
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-white/70 text-sm outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Copied!
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Safe Area for Mobile - extra padding for bottom navigation */}
        <div className="h-20 sm:h-4" />
      </div>
    </div>
  );

  // Use portal to render modal at document body level (escapes stacking context)
  return createPortal(modalContent, document.body);
}

