'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { StoreDetails } from '../landing-page/LandingPage';
import { useAddCustomerAddressMutation, useGetCustomerInfoQuery } from '@/lib/services/api';
import { ApiErrorResponse } from '@/lib/services/apiTypes';
import { logActivity } from '@/lib/store/activityLogSlice';
import { useDispatch } from 'react-redux';
import { 
  MapPin, 
  Home, 
  Building, 
  Briefcase, 
  Phone, 
  User, 
  Hash, 
  Layers,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AddressDetailProps {
  storeDetails: StoreDetails;
  onSuccess?: () => void;
  onAddressAdded?: (address: {
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
  }) => void;
}

const addressTypes = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'apartment', label: 'Apartment', icon: Building },
  { key: 'office', label: 'Office', icon: Briefcase },
];

const Address = ({ storeDetails, onSuccess, onAddressAdded }: AddressDetailProps) => {
  const [selectedType, setSelectedType] = useState('home');
  const [addressSelected, setAddressSelected] = useState(false);
  const [streetAddress, setStreetAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [house, setHouse] = useState('');
  const [floor, setFloor] = useState('');
  const [road, setRoad] = useState('');
  const [flat, setFlat] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const [addCustomerAddress, { isLoading }] = useAddCustomerAddressMutation();
  const { data: customerInfo } = useGetCustomerInfoQuery();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const timestamp = new Date().toLocaleString();
  const dispatch = useDispatch();

  useEffect(() => {
    if (customerInfo) {
      if (!phone) {
        setPhone(customerInfo.phone || '');
      }
      if (!contactName) {
        const fullName = `${customerInfo.f_name ?? ''} ${customerInfo.l_name ?? ''}`.trim();
        setContactName(fullName);
      }
    }
  }, [customerInfo, contactName, phone]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!,
    libraries: ['places'],
  });

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const formatted = place?.formatted_address || '';
      const location = place?.geometry?.location;

      if (location) {
        setLatitude(location.lat());
        setLongitude(location.lng());
      }

      setStreetAddress(formatted);
      setDetailedAddress(formatted);
      setAddressSelected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      address_type: selectedType,
      contact_person_number: phone,
      contact_person_name: contactName,
      address: detailedAddress,
      additional_address: streetAddress,
      latitude,
      longitude,
      zone_id: storeDetails.zone_id,
      zone_ids: [storeDetails.zone_id],
      road,
      house,
      floor,
      flat,
      post_code: '',
    };

    try {
      await addCustomerAddress(payload).unwrap();

      setFormMessage('Address added successfully!');
      setMessageType('success');

      if (onAddressAdded) {
        onAddressAdded({
          name: contactName,
          address: detailedAddress,
          phone,
          floor,
          house,
          street_number: road,
          address_type: selectedType,
          latitude,
          longitude,
        });
      }

      // Auto close after success
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err) {
      const error = err as { data: ApiErrorResponse };
      const message = error.data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.';
      console.error('Failed to add address:', error);
      dispatch(logActivity(`User encountered an error adding new address at ${timestamp}`));
      setFormMessage(message);
      setMessageType('error');
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
        <p className="text-gray-500">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Address</h1>
          <p className="text-sm text-gray-500">Enter your delivery location details</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {formMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {formMessage}
          </p>
        </div>
      )}

      {/* Address Search */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Address
        </label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin className="w-5 h-5" />
            </div>
          <input
            type="text"
              className="w-full h-12 border-2 border-gray-200 rounded-xl pl-12 pr-4 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors"
              placeholder="Start typing your address..."
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
          />
          </div>
        </Autocomplete>
      </div>

      {addressSelected && (
        <>
          {/* Address Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                House/Building No.
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
            <input
              value={house}
              onChange={(e) => setHouse(e.target.value)}
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                  placeholder="e.g. 123"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Floor
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Layers className="w-4 h-4" />
                </div>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                  placeholder="e.g. 2nd"
            />
          </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Street Name
              </label>
            <input
              value={road}
              onChange={(e) => setRoad(e.target.value)}
                className="w-full h-11 border-2 border-gray-200 rounded-xl px-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                placeholder="e.g. High Street"
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Flat/Unit
              </label>
            <input
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
                className="w-full h-11 border-2 border-gray-200 rounded-xl px-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                placeholder="e.g. Flat 4B"
            />
            </div>
          </div>

          {/* Full Address */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              required
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              className="w-full h-20 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm resize-none"
              placeholder="Enter your complete delivery address"
            />
          </div>

          {/* Address Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Address Type
            </label>
            <div className="flex gap-3">
              {addressTypes.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedType(key)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedType === key
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
              </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6" />

          {/* Contact Information */}
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contact Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
            <input
              type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 border-2 border-gray-200 rounded-xl pl-10 pr-3 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors text-sm"
                  placeholder="+44 7000 000000"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
            className="w-full h-12 bg-[#FF4D4D] hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
            >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding Address...</span>
              </>
            ) : (
              <span>Add Address</span>
            )}
            </button>
        </>
      )}
    </form>
  );
};

export default Address;
