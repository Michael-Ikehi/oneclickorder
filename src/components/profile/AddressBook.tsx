'use client';
import React, { useEffect, useState } from 'react';
import AddressBookCard from './AddressBookCard';
import Popup from '../reUse/PopUp';
import Address from './Address';
import { AddressDetailProps } from '../confirm/Confirm';
import { useDeleteCustomerAddressMutation, useGetCustomerAddressesQuery } from '@/lib/services/api';
import { useDispatch } from 'react-redux';
import { CustomerAddress } from '@/lib/services/apiTypes';
import { setSelectedAddress } from '@/lib/store/addressSlice';
import { MapPin, Plus, Loader2, AlertCircle } from 'lucide-react';

const AddressBook = ({ storeDetails }: AddressDetailProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const dispatch = useDispatch();
      
  const { data, isLoading, isError, refetch } = useGetCustomerAddressesQuery();

  const addresses: CustomerAddress[] = data?.addresses ?? [];
        
  const [deleteAddress] = useDeleteCustomerAddressMutation();

  const handleSelect = (id: number) => {
    setSelectedId(id);
    const selected = addresses.find((addr) => addr.id === id);
    if (selected) {
      dispatch(
        setSelectedAddress({
          name: selected.contact_person_name,
          address: selected.address,
          phone: selected.contact_person_number,
          floor: selected.floor,
          house: selected.house,
          street_number: selected.road,
          address_type: selected.address_type,
          latitude: selected.latitude,
          longitude: selected.longitude,
        })
      );
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(String(id)).unwrap();
      if (selectedId === id) setSelectedId(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleAddClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    refetch();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Address Book</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Address</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#FF4D4D] animate-spin mb-3" />
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load addresses</p>
          <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-3">
      {addresses.map((item) => (
        <AddressBookCard
          key={item.id}
          id={item.id}
          address={item.address}
          phone={item.contact_person_number}
          name={item.contact_person_name}
              addressType={item.address_type}
          selected={selectedId === item.id}
          onSelect={() => handleSelect(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No addresses saved</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Add your first delivery address</p>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Address
          </button>
        </div>
      )}

      {/* Mobile Add Button (sticky bottom) */}
      {addresses.length > 0 && (
        <div className="mt-6 sm:hidden">
      <button
        onClick={handleAddClick}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#FF4D4D] text-white rounded-xl font-medium hover:bg-[#FF4D4D] transition-colors"
      >
            <Plus className="w-5 h-5" />
        Add New Address
      </button>
        </div>
      )}

      {/* Popup */}
      {isPopupOpen && (
        <Popup
          width="600px"
          height="auto"
          content={<Address storeDetails={storeDetails} onSuccess={closePopup} />}
          onClose={closePopup}
          mobileFullscreen={true}
        />
      )}
    </div>
  );
};

export default AddressBook;
