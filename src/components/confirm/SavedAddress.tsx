import React, { useEffect, useState } from 'react';
import AddressCard from './AddressCard';
import {
  useGetCustomerAddressesQuery,
  useDeleteCustomerAddressMutation
} from '@/lib/services/api';
import { CustomerAddress } from '@/lib/services/apiTypes';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedAddress, setSelectedAddress } from '@/lib/store/addressSlice';
import { logActivity } from '@/lib/store/activityLogSlice';
import { RootState } from '@/lib/store/store';

interface Saved {
  onSelect?: () => void;
}
const SavedAddress: React.FC<Saved> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const dispatch = useDispatch();

  const { data, isLoading, isError, refetch } = useGetCustomerAddressesQuery();

  const addresses: CustomerAddress[] = data?.addresses ?? [];
  const selectedAddress = useSelector((state: RootState) => state.address.selectedAddress);

  const [deleteAddress] = useDeleteCustomerAddressMutation();
  const timestamp = new Date().toLocaleString();
  const handleSelect = (id: number) => {
    setSelectedId(id);
    const selected = addresses.find((addr) => addr.id === id);
    if (selected) {
      dispatch(
        setSelectedAddress({
          id: selected.id,
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
      dispatch(logActivity(`User selected a saved address at ${timestamp}`));
    }
    onSelect?.();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(String(id)).unwrap();
      dispatch(clearSelectedAddress());
      setSelectedId(null);
      if (selectedAddress?.id === Number(id)) {
        dispatch(clearSelectedAddress());
        setSelectedId(null);
        dispatch(logActivity(`User deleted the selected address (${id}) at ${timestamp}`));
      } else {
        dispatch(logActivity(`User deleted an address (${id}) at ${timestamp}`));
      }
      refetch();
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load addresses.</p>;

  return (
    <div className="top-0 px-2">
      <h2 className="text-lg font-semibold mb-4">My Saved Address</h2>
      {addresses?.map((item) => (
        <AddressCard
          key={item.id}
          id={item.id}
          address={item.address}
          phone={item.contact_person_number}
          selected={selectedId === item.id}
          onSelect={() => handleSelect(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
      {/* <button className='mt-4 w-full bg-[#FF4D4D] text-white py-2 rounded-md'>Save</button> */}
    </div>
  );
};

export default SavedAddress;
