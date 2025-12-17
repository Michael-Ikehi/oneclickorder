'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, ShoppingBag, ChevronLeft, ChevronRight, Play, Plus, Volume2, VolumeX, Share2 } from 'lucide-react';
import { StoreDetails, StoreMenu, StoreMenuItem } from '@/lib/services/apiTypes';
import { useDispatch, useSelector } from 'react-redux';
import { addToBasket } from '@/lib/store/basketSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import { RootState } from '@/lib/store/store';
import { useGetMenuLikesCountQuery, useLikeMenuMutation, useUnlikeMenuMutation, useGetMenuCommentsQuery } from '@/lib/services/api';
import FeedItemModal from './FeedItemModal';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import { showToast } from '@/components/reUse/ToastNotification';

interface MenuCardProps {
  menu: StoreMenu;
  store: StoreDetails;
  index: number;
}

interface AddOn {
  id: number;
  name: string;
  price: number;
}

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

// Check if item has options
function hasItemOptions(item: StoreMenuItem): boolean {
  try {
    const variations = item.food_variations ? JSON.parse(item.food_variations) : [];
    const addons = Array.isArray(item.add_ons_data) ? item.add_ons_data : [];
    return variations.length > 0 || addons.length > 0;
  } catch {
    return false;
  }
}

// Mobile item pill - just name and price
function ItemPill({ 
  item, 
  currency, 
  onClick 
}: { 
  item: StoreMenuItem; 
  currency: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 active:scale-95 transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-medium truncate max-w-[100px]">
          {item.name}
        </span>
        <span className="text-red-400 text-xs font-bold whitespace-nowrap">
          {currency}{item.price?.toFixed(2) || '0.00'}
        </span>
      </div>
    </button>
  );
}

// Desktop item card with image
function ItemCard({ 
  item, 
  currency,
  onClick,
  onQuickAdd,
  hasOptions
}: { 
  item: StoreMenuItem; 
  currency: string;
  onClick: () => void;
  onQuickAdd: () => void;
  hasOptions: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = item.image 
    ? `${baseImage}/uploads/product/${item.image}`
    : '/images/placeholder.png';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd();
  };

  return (
    <div 
      className="flex-shrink-0 w-32 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 mb-2">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          sizes="128px"
          className={`object-cover transition-all group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        
        {/* Quick Add Button - Only for items without options */}
        {!hasOptions && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 w-8 h-8 bg-[#FF4D4D] hover:bg-[#FF4D4D] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <p className="text-white text-xs font-medium line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
        {item.name}
      </p>
      <p className="text-red-400 text-xs font-bold">
        {currency}{item.price?.toFixed(2) || '0.00'}
      </p>
    </div>
  );
}

export default function MenuCard({ menu, store, index }: MenuCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay to work
  const [selectedItem, setSelectedItem] = useState<StoreMenuItem | null>(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  // Track if user manually unmuted (to restore sound when coming back)
  const [userUnmuted, setUserUnmuted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const timestamp = new Date().toLocaleString();
  
  // Auth state
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Like API hooks
  const { data: likesData, refetch: refetchLikes } = useGetMenuLikesCountQuery(menu.id, {
    skip: !menu.id,
  });
  const [likeMenu] = useLikeMenuMutation();
  const [unlikeMenu] = useUnlikeMenuMutation();
  
  const isLiked = likesData?.data?.is_liked ?? false;
  const likesCount = likesData?.data?.likes_count ?? 0;
  
  // Comments API hook (just for count)
  const { data: commentsData } = useGetMenuCommentsQuery(
    { menuId: menu.id, limit: 1 },
    { skip: !menu.id }
  );
  const commentsCount = commentsData?.data?.total_size ?? 0;

  const mediaList = menu.menu_media || [];
  const currentMedia = mediaList[currentMediaIndex];
  
  // Fallback to store cover photo if no menu media
  const fallbackImageUrl = store.cover_photo 
    ? `${baseImage}/uploads/store/cover/${store.cover_photo}` 
    : '/images/placeholder.png';
  
  // Filter items from store.items that belong to this menu
  const allItems = store.items || [];
  const items = allItems.filter(item => item.menu_id === menu.id);
  
  const currency = store.zone_currency?.currency_symbol || '£';
  
  // Build store URLs
  // Menu page URL (short format)
  const menuUrl = `/${store.slug}`;
  
  // Takeaway URL (for login redirects, etc.)
  const takeawayUrl = store.cityData && store.areaData 
    ? `/takeaway/${store.cityData.slug}/${store.areaData.slug}/${store.slug}`
    : `/${store.slug}`;

  // Auto-advance media carousel
  useEffect(() => {
    if (mediaList.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentMediaIndex(prev => (prev + 1) % mediaList.length);
    }, 5000); // 5 seconds per media

    return () => clearInterval(interval);
  }, [mediaList.length]);

  // Intersection Observer - detect when card is in view
  // This handles pausing/muting videos when scrolling away
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;
          setIsInView(isVisible);
          
          if (videoRef.current) {
            if (isVisible) {
              // Video is in view - play it
              videoRef.current.play().catch(() => {});
              setIsVideoPlaying(true);
              // Restore sound if user had unmuted before
              if (userUnmuted) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
            } else {
              // Video is out of view - pause and mute it
              videoRef.current.pause();
              videoRef.current.muted = true;
              setIsVideoPlaying(false);
              setIsMuted(true);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the card is visible
      }
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [userUnmuted]);

  // Handle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Handle video mute/unmute
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering video play/pause
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      // Track if user manually unmuted
      setUserUnmuted(!newMutedState);
    }
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    // If not logged in, redirect to login
    if (!token) {
      const currentPath = encodeURIComponent(window.location.pathname);
      router.push(`${takeawayUrl}/login?redirect=${currentPath}`);
      return;
    }
    
    if (isLikeLoading) return;
    
    setIsLikeLoading(true);
    try {
      if (isLiked) {
        await unlikeMenu({ menu_id: menu.id }).unwrap();
        dispatch(logActivity(`User unliked menu "${menu.title}" at ${timestamp}`));
      } else {
        await likeMenu({ menu_id: menu.id }).unwrap();
        dispatch(logActivity(`User liked menu "${menu.title}" at ${timestamp}`));
      }
      // Refetch to get updated count
      refetchLikes();
    } catch (error) {
      console.error('Like toggle failed:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Scroll items horizontally
  const scrollItems = (direction: 'left' | 'right') => {
    if (itemsContainerRef.current) {
      const scrollAmount = 150;
      itemsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Check if store is active and open
  const isStoreActive = store.active;
  const isStoreOpen = store.open;

  // Quick add to cart (for items without options)
  const handleQuickAdd = (item: StoreMenuItem) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    
    const discount = item.discount || 0;
    const price = discount > 0 
      ? item.price - (item.price * discount / 100) 
      : item.price;
    
    dispatch(addToBasket({
      id: item.id,
      key: `${item.id}-no-options`,
      name: item.name,
      price: price,
      totalPrice: price,
      quantity: 1,
      image: item.image,
    }));
    
    dispatch(logActivity(`User quick-added "${item.name}" from feed at ${timestamp}`));
  };

  // Add to cart from modal
  const handleAddToCart = (
    item: StoreMenuItem,
    qty: number,
    selectedVariations?: Record<string, string[]>,
    selectedAddons?: AddOn[]
  ) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    
    const hasOptions = hasItemOptions(item);
    const discount = item.discount || 0;
    const basePrice = discount > 0 
      ? item.price - (item.price * discount / 100) 
      : item.price;

    if (hasOptions && selectedVariations) {
      // Build unique key
      const variationKey = Object.entries(selectedVariations)
        .map(([k, v]) => `${k}:${v.join(',')}`)
        .join('|');
      const addonKey = selectedAddons?.map(a => a.id).join(',') || '';
      const itemKey = `${item.id}-${variationKey}-${addonKey}`;

      // Calculate total price with options
      let totalUnitPrice = basePrice;
      
      // Add variation prices
      try {
        const variations = JSON.parse(item.food_variations || '[]');
        Object.entries(selectedVariations).forEach(([variationName, values]) => {
          const variation = variations.find((v: any) => v.name === variationName);
          if (variation) {
            values.forEach(val => {
              const option = variation.values.find((v: any) => v.label === val);
              if (option) totalUnitPrice += Number(option.optionPrice);
            });
          }
        });
      } catch {}

      // Add addon prices
      selectedAddons?.forEach(addon => {
        totalUnitPrice += addon.price || 0;
      });

      dispatch(addToBasket({
        id: item.id,
        key: itemKey,
        name: item.name,
        price: totalUnitPrice,
        totalPrice: totalUnitPrice * qty,
        quantity: qty,
        image: item.image,
        variations: selectedVariations,
        addons: selectedAddons,
        variationPrice: totalUnitPrice - basePrice,
      }));
    } else {
      // Simple item
      dispatch(addToBasket({
        id: item.id,
        key: `${item.id}-no-options`,
        name: item.name,
        price: basePrice,
        totalPrice: basePrice * qty,
        quantity: qty,
        image: item.image,
      }));
    }

    dispatch(logActivity(`User added ${qty}x "${item.name}" from feed at ${timestamp}`));
  };

  // Handle item click - check store status before opening modal
  const handleItemClick = (item: StoreMenuItem) => {
    if (!isStoreActive) {
      showToast('This store is temporarily unavailable. Please try again later.', 'error');
      return;
    }
    if (!isStoreOpen) {
      showToast('This store is currently closed. Please check back during opening hours.', 'error');
      return;
    }
    setSelectedItem(item);
  };

  return (
    <article ref={cardRef} className="relative w-full h-full overflow-hidden">
      {/* Media Background */}
      <div className="absolute inset-0 bg-gray-900">
        {!mediaLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
        )}
        
        {currentMedia?.media_type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={currentMedia.media_url}
              className={`w-full h-full object-cover transition-opacity duration-700 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setMediaLoaded(true)}
            />
            {/* Play icon overlay when video is paused */}
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <Image
            src={currentMedia?.media_url || fallbackImageUrl}
            alt={menu.title}
            fill
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setMediaLoaded(true)}
            onError={() => setMediaLoaded(true)}
            priority={index < 2}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40 pointer-events-none" />
      </div>

      {/* Tap to Play/Pause overlay - only covers center area, not buttons */}
      {currentMedia?.media_type === 'video' && (
        <div 
          className="absolute inset-0 z-[5] cursor-pointer"
          style={{ 
            // Leave space on the right for action buttons, bottom for content
            right: '70px',
            bottom: '200px',
          }}
          onClick={toggleVideo}
        />
      )}

      {/* Media Indicators (if multiple) */}
      {mediaList.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {mediaList.map((_, idx) => (
            <div 
              key={idx}
              className={`h-0.5 flex-1 rounded-full transition-all ${
                idx === currentMediaIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Sound Toggle Button - Only for videos */}
      {currentMedia?.media_type === 'video' && (
        <button
          onClick={toggleSound}
          className="absolute top-14 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}

      {/* Right Side Actions - positioned higher on mobile to avoid item overlap */}
      <div className="absolute right-3 top-[40%] md:top-1/3 -translate-y-1/7 md:translate-y-0 flex flex-col items-center gap-4 md:gap-5 z-10">
        {/* Store Profile */}
        <Link href={menuUrl} className="relative group">
          <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-white shadow-xl">
            <Image
              src={store.logo ? `${baseImage}/uploads/store/${store.logo}` : '/images/placeholder.png'}
              alt={store.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FF4D4D] flex items-center justify-center border-2 border-black">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        </Link>

        {/* Like */}
        <button 
          onClick={handleLikeToggle} 
          disabled={isLikeLoading}
          className="flex flex-col items-center gap-1 disabled:opacity-50"
        >
          <Heart 
            className={`w-7 h-7 drop-shadow-lg transition-all ${
              isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'
            } ${isLikeLoading ? 'animate-pulse' : ''}`} 
          />
          <span className="text-white text-[10px] font-semibold">
            {likesCount > 0 ? likesCount.toLocaleString() : 'Like'}
          </span>
        </button>

        {/* Comment */}
        <button 
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
          <span className="text-white text-[10px] font-semibold">
            {commentsCount > 0 ? commentsCount.toLocaleString() : 'Comment'}
          </span>
        </button>

        {/* Share */}
        <button 
          onClick={() => setShowShare(true)}
          className="flex flex-col items-center gap-1"
        >
          <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
          <span className="text-white text-[10px] font-semibold">Share</span>
        </button>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-8 md:bottom-4 left-0 right-0 z-10 px-3 ">
        {/* View Full Menu Button */}
        <Link 
          href={menuUrl}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white font-bold text-xs shadow-xl active:scale-95 transition-all mb-2" 
          style={{ background: 'linear-gradient(135deg, #FF4D4D 0%, #FF8533 100%)' ,
            color: isHovered ? 'white' : 'black',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ShoppingBag className="w-4 h-4" style={{ color: isHovered ? 'white' : 'black' , transition: 'all 0.2s ease-in-out' }} />
          <span>View Full Menu</span>
        </Link>

        {/* Menu Title */}
        <h2 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-lg">
          {menu.title}
        </h2>

        {/* Menu Description */}
        {menu.description && (
          <p className="text-white/70 text-xs line-clamp-2 drop-shadow-md mb-3">
            {menu.description}
          </p>
        )}

        {/* Horizontal Scrolling Items */}
        {items.length > 0 && (
          <div className="relative">
            {/* Scroll Buttons - Desktop only */}
            <div className="hidden lg:block">
              {items.length > 3 && (
                <>
                  <button
                    onClick={() => scrollItems('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center z-10 -ml-1"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => scrollItems('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center z-10 -mr-1"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile Items - Pills with name & price only */}
            <div 
              className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar py-2"
            >
              {items.map(item => (
                <ItemPill 
                  key={item.id} 
                  item={item} 
                  currency={currency}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
            
            {/* Desktop Items - Full cards with images */}
            <div 
              ref={itemsContainerRef}
              className="hidden lg:flex gap-3 overflow-x-auto no-scrollbar px-1 py-2"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {items.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  currency={currency}
                  onClick={() => handleItemClick(item)}
                  onQuickAdd={() => handleQuickAdd(item)}
                  hasOptions={hasItemOptions(item)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <FeedItemModal
          item={selectedItem}
          currency={currency}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(qty, variations, addons) => {
            handleAddToCart(selectedItem, qty, variations, addons);
          }}
        />
      )}

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal
          menuId={menu.id}
          menuTitle={menu.title}
          onClose={() => setShowComments(false)}
          onLoginRequired={() => {
            setShowComments(false);
            const currentPath = encodeURIComponent(window.location.pathname);
            router.push(`${takeawayUrl}/login?redirect=${currentPath}`);
          }}
        />
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          url={typeof window !== 'undefined' ? `${window.location.origin}${takeawayUrl}` : takeawayUrl}
          title={menu.title}
          storeName={store.name}
          storeLogo={store.logo}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Custom Scrollbar Hide */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </article>
  );
}
