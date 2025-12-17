'use client';
import React, { useState } from 'react';
import { MapPin, ChevronRight, Check } from 'lucide-react';
import Popup from '../reUse/PopUp';
import BottomPopup from '../reUse/BottomPopup';
import SavedAddress from './SavedAddress';
import Address from '../profile/Address';
import { StoreDetails } from '../landing-page/LandingPage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useMediaQuery } from 'react-responsive';
import { setSelectedAddress } from '@/lib/store/addressSlice';
import { logActivity } from '@/lib/store/activityLogSlice';

interface AddressDetailProps {
  storeDetails: StoreDetails;
}

const AddressDetail = ({ storeDetails }: AddressDetailProps) => {
  const [popupType, setPopupType] = useState<'change' | 'add' | null>(null);
  const selectedAddress = useSelector((state: RootState) => state.address.selectedAddress);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const timestamp = new Date().toLocaleString();

  const handleOpenPopup = (type: 'change' | 'add') => {
    setPopupType(type);
  };

  // Allow closing popup (user can cancel and select address later)
  const handleClosePopup = () => {
    setPopupType(null);
  };

  const handleAddressSelected = () => {
    setPopupType(null);
  };

  const handleAddressAdded = (address: {
    id?: number;
    name: string;
    address: string;
    phone: string;
    floor: string;
    house: string;
    street_number: string;
    address_type: string;
    latitude: number;
    longitude: number;
  }) => {
    dispatch(logActivity(`User added a new address successfully at ${timestamp}`));
    dispatch(setSelectedAddress(address));
    setPopupType(null);
  };

  const renderContent = () => {
    if (popupType === 'change') {
      return (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Address</h3>
            {/* Always show Cancel on mobile (BottomPopup doesn't have X button) */}
            {isMobile && (
              <button
                onClick={() => setPopupType(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
          <SavedAddress onSelect={handleAddressSelected} />
          {!selectedAddress && (
            <p className="mt-4 text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Please select an address to continue
            </p>
          )}
        </div>
      );
    }
    if (popupType === 'add') {
      return (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
            {/* Only show Cancel on mobile (BottomPopup doesn't have X button) */}
            {isMobile && (
              <button
                onClick={() => setPopupType(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
          <Address storeDetails={storeDetails} onAddressAdded={handleAddressAdded} />
        </div>
      );
    }
    return null;
  };

  const hasAddress = !!selectedAddress;

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasAddress ? 'bg-green-100' : 'bg-red-100'}`}>
            {hasAddress ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <MapPin className="w-4 h-4 text-red-500" />
            )}
        </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Deliver to</h2>
            {hasAddress ? (
              <p className="text-sm text-gray-600 line-clamp-1">{selectedAddress?.address}</p>
          ) : (
              <p className="text-sm text-red-500">No address selected</p>
          )}
        </div>
      </div>

        {token ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenPopup('change')}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Select
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenPopup('add')}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Add New
            </button>
          </div>
        ) : (
          <p className="text-sm text-amber-600">Login to select</p>
        )}
      </div>

      {/* Selected Address Details */}
      {hasAddress && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedAddress?.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{selectedAddress?.address}</p>
              <p className="text-sm text-gray-500">{selectedAddress?.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {popupType && isMobile ? (
        <BottomPopup isOpen={!!popupType} onClose={handleClosePopup}>
          {renderContent()}
        </BottomPopup>
      ) : popupType ? (
        <Popup
          width="500px"
          height="auto"
          content={renderContent()}
          onClose={handleClosePopup}
        />
      ) : null}
    </section>
  );
};

export default AddressDetail;
