import React from 'react';
import { FaCircle } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';

interface AddressCardProps {
  id:  number;
  address: string;
  phone: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, phone, selected, onSelect, onDelete }) => {
  return (
    <div 
      onClick={onSelect}
      className={`flex items-center justify-between border p-4 cursor-pointer rounded-sm ${selected ? 'border-red-500' : 'border-gray-300'}`}
    >
      <div className='flex items-center gap-3'>
        <FaCircle className={`text-${selected ? 'red-500' : 'gray-300'}`} />
        <p>{address} | {phone}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <FaTrash className="text-red-500" />
      </button>
    </div>
  );
};

export default AddressCard;
