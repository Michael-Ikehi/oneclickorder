'use client';
import React from 'react';
import { Trash2, CheckCircle, Loader2 } from 'lucide-react';

interface SavedCardsCardProps {
  cardId: string;
  cardType: string;
  cardNumber: string;
  expiry: string;
  selected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const cardBrandColors: Record<string, { bg: string; text: string; gradient: string }> = {
  visa: { bg: 'bg-blue-600', text: 'text-blue-600', gradient: 'from-blue-600 to-blue-700' },
  mastercard: { bg: 'bg-orange-600', text: 'text-orange-600', gradient: 'from-orange-500 to-red-600' },
  amex: { bg: 'bg-blue-500', text: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500' },
  discover: { bg: 'bg-orange-500', text: 'text-orange-500', gradient: 'from-orange-400 to-orange-600' },
  default: { bg: 'bg-gray-600', text: 'text-gray-600', gradient: 'from-gray-600 to-gray-700' },
};

const SavedCardsCard: React.FC<SavedCardsCardProps> = ({
  cardType,
  cardNumber,
  expiry,
  selected,
  onSelect,
  onDelete,
  isDeleting,
}) => {
  const brand = cardType.toLowerCase();
  const colors = cardBrandColors[brand] || cardBrandColors.default;

  return (
    <div
      onClick={onSelect}
      className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-red-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Card Visual */}
      <div className={`bg-gradient-to-br ${colors.gradient} p-4 text-white`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-7 bg-white/20 rounded flex items-center justify-center">
              <span className="text-xs font-bold uppercase">{cardType}</span>
            </div>
            {selected && (
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
          <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded" />
        </div>
        
        <p className="text-lg font-mono tracking-wider mb-4">{cardNumber}</p>
        
      <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/60 uppercase mb-0.5">Expires</p>
            <p className="text-sm font-medium">{expiry}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${selected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">
            {selected ? 'Selected for payment' : 'Click to select'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </div>
    </div>
  );
};

export default SavedCardsCard;
