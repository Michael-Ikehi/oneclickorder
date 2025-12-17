'use client';
import React from 'react';
import { MapPin, Phone, Trash2, Home, Building, Briefcase, CheckCircle } from 'lucide-react';

interface AddressBookCardProps {
  id: number;                
  selected?: boolean;      
  name: string;
  address: string;
  phone: string;
  addressType?: string;
  onSelect: () => void;
  onDelete: () => void;
}

const addressTypeIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  apartment: <Building className="w-4 h-4" />,
  office: <Briefcase className="w-4 h-4" />,
};

const AddressBookCard: React.FC<AddressBookCardProps> = ({
  name,
  address,
  phone,
  addressType = 'home',
  onSelect,
  onDelete,
  selected,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-red-500 bg-red-50/50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-[#FF4D4D] rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          selected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {addressTypeIcons[addressType?.toLowerCase()] || <MapPin className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              selected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {addressType || 'Home'}
            </span>
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 pl-[52px]">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{phone}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default AddressBookCard;
