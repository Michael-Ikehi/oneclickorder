'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { usePathname, useRouter } from 'next/navigation';
import Loader from '../Loader';
import { setLoading } from '@/lib/store/loadingSlice';
import { useGetRunningOrdersQuery } from '@/lib/services/api';
import Popup from '../reUse/PopUp';
import OngoingOrders from './OngoingOrders';
import { resetRefetch } from '@/lib/store/refetchSlice';
import { User, ClipboardList, LogIn } from 'lucide-react';

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const Header = () => {
  const pathname = usePathname();
  const token = useSelector((state: RootState) => state.auth.token);
  const { city, area, storeName, storeDetails } = useSelector((state: RootState) => state.storeParams);
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);
  const refetchTrigger = useSelector((state: RootState) => state.refetch.refetchRunningOrders);
  const dispatch = useDispatch();
  const router = useRouter();

  const noShowRoutes = [
    `/takeaway/${city}/${area}/${storeName}/login`,
    `/takeaway/${city}/${area}/${storeName}/sign-up`,
    `/takeaway/${city}/${area}/${storeName}/profile`,
  ];
  const isLoginPage = noShowRoutes.includes(pathname);

  const {
    data: orderData,
    isLoading: runningLoading,
    error,
    refetch,
  } = useGetRunningOrdersQuery({ limit: 50, offset: 1 }, { skip: !token });

  const ongoingOrders =
    orderData?.orders?.filter(
      (order) => order.order_status !== 'delivered' && order.order_status !== 'canceled'
    ) ?? [];

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (refetchTrigger) {
      refetch();
      dispatch(resetRefetch());
    }
  }, [refetchTrigger, refetch, dispatch]);

  const handleAddClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <header 
        className={`
          sticky top-0 z-50 w-full transition-all duration-200 border-b
          ${isScrolled 
            ? 'bg-white shadow-md border-gray-200' 
            : 'bg-white shadow-sm border-gray-100'
          }
        `}
      >
        <div className="w-full px-2 sm:px-4 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 ml-2 sm:ml-0 lg:-ml-2">
            <Link 
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" 
              href={storeName ? `/takeaway/${city}/${area}/${storeName}` : '/takeaway'}
            >
              <Image 
                src={storeDetails?.logo ? `${baseImage}/uploads/store/${storeDetails.logo}` : '/images/mask.png'} 
                alt={storeDetails?.name || 'FoodHutz'} 
                width={38} 
                height={38} 
                className="w-[38px] h-[38px] rounded-full object-cover"
              />
              <span className="font-bold text-base text-gray-900 hidden sm:block max-w-[200px] truncate">
                {storeDetails?.name || 'FOODHUTZ'}
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3 lg:-mr-2">
        {/* Ongoing Orders Button */}
        {token && !runningLoading && !error && ongoingOrders.length > 0 && (
              <button
            onClick={handleAddClick}
                className="relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                aria-label={`${ongoingOrders.length} ongoing orders`}
              >
                <ClipboardList className="w-5 h-5" />
                
                {/* Desktop Label */}
                <span className="hidden md:inline text-sm font-medium">
                  {ongoingOrders.length} ongoing
                </span>
                
                {/* Mobile Badge */}
                <span className="md:hidden absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full">
                {ongoingOrders.length}
              </span>
              </button>
        )}

            {/* Loading State */}
        {token && runningLoading && (
              <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-24 md:w-32" />
        )}

            {/* Error State */}
        {token && error && (
              <span className="text-red-600 text-xs hidden md:block">Failed to load</span>
        )}

            {/* Profile / Login Button */}
        {token && !isLoginPage ? (
          <Link
            href={`/takeaway/${city}/${area}/${storeName}/profile`}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-white rounded-lg hover:bg-red-300 transition-colors" style={{ backgroundColor: '#FF4D4D' }}
          >
                <User className="w-5 h-5 text-white" />
                <span className="hidden md:inline text-sm font-medium text-white">My Profile</span>
          </Link>
        ) : (
          !isLoginPage && (
                <button
              onClick={() => {
                dispatch(setLoading(true));
                router.push(`/takeaway/${city}/${area}/${storeName}/login`);
              }}
                  className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium" style={{ backgroundColor: '#FF4D4D' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
          )
        )}
      </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {isLoading && <Loader fullScreen />}

      {/* Ongoing Orders Popup */}
      {isPopupOpen && (
        <Popup
          width="450px"
          height="80vh"
          content={<OngoingOrders orders={ongoingOrders} onClose={closePopup} />}
          onClose={closePopup}
        />
      )}
    </>
  );
};

export default Header;
