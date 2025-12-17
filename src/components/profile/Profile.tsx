'use client';
import React, { useEffect, useState } from 'react';
import ChangePassword from './ChangePassword';
import AddressBook from './AddressBook';
import MyOrders from './MyOrders';
import SavedCards from './SavedCards';
import SignOut from './SignOut';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/lib/services/authSlice';
import { persistor, RootState } from '@/lib/store/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreDetails } from '../landing-page/LandingPage';
import { api, useCreateActivityLogMutation, useGetCustomerInfoQuery } from '@/lib/services/api';
import Popup from '../reUse/PopUp';
import { setLoading } from '@/lib/store/loadingSlice';
import { clearActivities } from '@/lib/store/activityLogSlice';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ProfileOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
  variant?: 'default' | 'danger';
}

const ProfileOption = ({ title, description, icon, onClick, isSelected, variant = 'default' }: ProfileOptionProps) => {
  const baseClasses = 'flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group';
  const selectedClasses = isSelected 
    ? 'bg-[#FF4D4D] text-white shadow-lg shadow-red-500/20' 
    : variant === 'danger'
      ? 'hover:bg-red-50 text-gray-700'
      : 'hover:bg-gray-50 text-gray-700';

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onClick}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
        isSelected 
          ? 'bg-white/20' 
          : variant === 'danger' 
            ? 'bg-red-100 text-red-600 group-hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : variant === 'danger' ? 'text-red-600' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
        isSelected ? 'text-white/80' : 'text-gray-400'
      }`} />
    </div>
  );
};

interface ProfileProps {
  storeDetails: StoreDetails;
}

const Profile = ({ storeDetails }: ProfileProps) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  const { data: customerInfo, isLoading: customerLoading } = useGetCustomerInfoQuery();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);
  const router = useRouter();

  // Check for tab query param
  const tabParam = searchParams.get('tab');
  const getInitialTab = () => {
    if (tabParam === 'orders') return 'My Orders';
    if (tabParam === 'addresses') return 'Address Book';
    if (tabParam === 'cards') return 'Saved Cards';
    if (tabParam === 'password') return 'Change Password';
    return null;
  };

  const [selectedOption, setSelectedOption] = useState<string | null>(getInitialTab());
  const [showDialog, setShowDialog] = useState(false);
  const activityLogs = useSelector((state: RootState) => state.activityLog.logs);
  const [createActivityLog] = useCreateActivityLogMutation();

  const openSignOutDialog = () => setShowDialog(true);
  const closeSignOutDialog = () => setShowDialog(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const closePopup = () => setIsPopupOpen(false);
  
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsPopupOpen(true);
    }
  };

  const handleSignOut = async () => {
    const timestamp = new Date().toLocaleString();
    const logsToSend = [...activityLogs, `User signed out at ${timestamp}`];

    try {
      await Promise.all(logsToSend.map((activity) => createActivityLog({ activity }).unwrap()));
      dispatch(clearActivities());
    } catch (error) {
      console.error('Failed to send activity logs:', error);
    }
    
    dispatch(logout());
    dispatch(api.util.resetApiState());
    await persistor.purge();
    dispatch({ type: 'RESET_APP' });
    closeSignOutDialog();
    router.push(`/takeaway/${city}/${area}/${storeName}/login`);
  };

  const renderDetailSection = () => {
    switch (selectedOption) {
      case 'Change Password':
        return <ChangePassword />;
      case 'Address Book':
        return <AddressBook storeDetails={storeDetails} />;
      case 'My Orders':
        return <MyOrders />;
      case 'Saved Cards':
        return <SavedCards />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Select an Option</h2>
            <p className="text-gray-500 max-w-sm">
              Choose an option from the menu to manage your account settings and preferences.
            </p>
          </div>
        );
    }
  };

  const getInitials = () => {
    if (!customerInfo) return '?';
    const first = customerInfo.f_name?.[0] || '';
    const last = customerInfo.l_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href={`/takeaway/${city}/${area}/${storeName}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-2xl font-bold text-white">{getInitials()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              {customerLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mx-auto sm:mx-0" />
                  <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mx-auto sm:mx-0" />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900">
                    {customerInfo?.f_name} {customerInfo?.l_name}
                  </h1>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{customerInfo?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{customerInfo?.phone || 'No phone'}</span>
                    </div>
              </div>
                </>
              )}
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              Account Settings
            </h2>
            <div className="space-y-1">
          <ProfileOption
            title="Change Password"
            description="Update your password"
                icon={<Lock className="w-5 h-5" />}
            onClick={() => handleOptionClick('Change Password')}
            isSelected={selectedOption === 'Change Password'}
          />
          <ProfileOption
            title="Address Book"
                description="Manage delivery addresses"
                icon={<MapPin className="w-5 h-5" />}
            onClick={() => handleOptionClick('Address Book')}
            isSelected={selectedOption === 'Address Book'}
          />
          <ProfileOption
            title="My Orders"
                description="View order history"
                icon={<ShoppingBag className="w-5 h-5" />}
            onClick={() => handleOptionClick('My Orders')}
            isSelected={selectedOption === 'My Orders'}
          />
          <ProfileOption
            title="Saved Cards"
                description="Manage payment methods"
                icon={<CreditCard className="w-5 h-5" />}
            onClick={() => handleOptionClick('Saved Cards')}
            isSelected={selectedOption === 'Saved Cards'}
          />
            </div>
            
            <div className="border-t border-gray-100 my-4" />
            
          <ProfileOption
            title="Sign Out"
            description="Sign out from device"
              icon={<LogOut className="w-5 h-5" />}
            onClick={() => {
              setSelectedOption(null);
              openSignOutDialog();
            }}
            isSelected={false}
              variant="danger"
          />
        </div>

          {/* Content Area - Desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {renderDetailSection()}
          </div>
        </div>
      </div>

      {/* Sign Out Dialog */}
      {showDialog && <SignOut onConfirm={handleSignOut} onCancel={closeSignOutDialog} />}

      {/* Mobile Popup */}
      {isPopupOpen && selectedOption && (
        <Popup
          width="100%"
          height="90vh"
          content={
            <div className="h-full overflow-auto">
              {renderDetailSection()}
              </div>
          }
          onClose={closePopup}
          mobileFullscreen={true}
        />
      )}
    </div>
  );
};

export default Profile;
