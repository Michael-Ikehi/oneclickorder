'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

interface MyOrderCardProps {
  orderId: number;
  restaurantName: string;
  status: 'ongoing' | 'delivered' | 'canceled';
  item: {
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
  };
  itemCount?: number;
  orderDate?: string;
}

const statusConfig = {
  ongoing: {
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
    label: 'In Progress',
  },
  delivered: {
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    label: 'Delivered',
  },
  canceled: {
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    label: 'Cancelled',
  },
};

const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const defaultImage = '/images/placeholder.png';

const MyOrderCard: React.FC<MyOrderCardProps> = ({ 
  orderId,
  restaurantName, 
  status, 
  item, 
  itemCount = 1,
  orderDate 
}) => {
  const [imageSrc, setImageSrc] = useState(`${baseImage}/uploads/product/${item.imageUrl}`);
  const StatusIcon = statusConfig[status].icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{restaurantName}</h3>
          {orderDate && (
            <p className="text-xs text-gray-500 mt-0.5">Order #{orderId} • {formatDate(orderDate)}</p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusConfig[status].color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig[status].label}</span>
        </div>
      </div>

      {/* Item Row */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image 
            src={imageSrc} 
            alt={item.name} 
            fill 
            className="object-cover" 
            onError={() => setImageSrc(defaultImage)} 
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5">
            {item.quantity}x item{item.quantity > 1 ? 's' : ''}
            {itemCount > 1 && (
              <span className="text-gray-400"> • +{itemCount - 1} more</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900">£{item.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default MyOrderCard;
