'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Clock, CheckCircle, XCircle, Package, ChevronRight, Hash, Receipt } from 'lucide-react';

interface Order {
  id: number;
  order_note: string;
  order_amount: number;
  delivery_charge: number;
  order_status: string;
  created_at: string;
  payment_method: string;
}

interface Props {
  orders: Order[];
  onClose?: () => void;
  showHeader?: boolean;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Confirmed' },
  processing: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Processing' },
  out_for_delivery: { color: 'bg-purple-100 text-purple-700', icon: Clock, label: 'Out for Delivery' },
  delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  canceled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
};

const OngoingOrders: React.FC<Props> = ({ orders, onClose, showHeader = true }) => {
  const router = useRouter();
  const { city, area, storeName } = useSelector((state: RootState) => state.storeParams);

  const handleCardClick = (orderId: number) => {
    onClose?.();
    router.push(`/takeaway/${city}/${area}/${storeName}/complete/${orderId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status.toLowerCase()] || statusConfig.pending;
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      {showHeader && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">📦 Your Orders</h3>
          <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No orders yet</p>
          <p className="text-gray-500 text-sm mt-1">Your orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = getStatusConfig(order.order_status);
            const StatusIcon = config.icon;
            const total = order.order_amount + order.delivery_charge;

            return (
              <div
                key={order.id}
                onClick={() => handleCardClick(order.id)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-red-300 transition-all duration-300 cursor-pointer group"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ color: '#111827' }}>
                        Order #{order.id}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </div>
                </div>

                {/* Details Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900" style={{ color: '#111827' }}>
                          £{total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {order.order_note && (
                      <div className="hidden sm:block">
                        <p className="text-xs text-gray-500">Note</p>
                        <p className="text-sm text-gray-700 truncate max-w-[150px]">{order.order_note}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-red-500">
                    <span className="text-sm font-medium hidden sm:inline">View Details</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingOrders;
