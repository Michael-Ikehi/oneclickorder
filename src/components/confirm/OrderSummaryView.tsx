import React, { useState } from 'react';
import { StoreDetails } from '../landing-page/LandingPage';
import { useDispatch } from 'react-redux';
import { Coupon as Coupons } from '../reUse/getDeliveryFee';
import Loader from '../Loader';
import Popup from '../reUse/PopUp';
import Address from '../profile/Address';
import { logActivity } from '@/lib/store/activityLogSlice';
import { setSelectedAddress } from '@/lib/store/addressSlice';
export interface OrderSummaryViewProps {
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  rawFinalTotal: number;
  deliveryFee: number;
  serviceCharge: number;
  restaurantTip: number | null;
  handlePlaceOrder: () => void;
  isFetching: boolean;
  isPlacingOrder: boolean;
  paymentMethod: string | null;
  storeDetails: StoreDetails;
  formErrors?: string[];
  orderError?: string | null;
  validCustomFee?: number;
  validCouponData?: Coupons;
  orderMethod?: string;
  walletBalance?: number;
  isRedirecting?: boolean;
  is3DSProcessing?: boolean; // NEW: 3D Secure verification in progress
  handleConfirmAddress: () => void;
  handleCancelAddress: () => void;
  onPlaceOrderClick: () => void;
  addressMethod?: string;
  showAddressPopup: boolean;
  closePopup: () => void;
}

const OrderSummaryView: React.FC<OrderSummaryViewProps> = ({
  totalItems,
  totalPrice,
  discountAmount,
  rawFinalTotal,
  deliveryFee,
  restaurantTip,
  onPlaceOrderClick,
  isPlacingOrder,
  validCouponData,
  storeDetails,
  formErrors,
  orderError,
  serviceCharge,
  validCustomFee,
  orderMethod,
  walletBalance,
  isRedirecting,
  is3DSProcessing,
  showAddressPopup,
  handleConfirmAddress,
  handleCancelAddress,
  addressMethod,
  closePopup,
}) => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const dispatch = useDispatch();
  const currency = storeDetails.zone_currency?.currency_symbol;

  return (
    <div className="mt-5 bg-white shadow-md rounded-xs px-4">
      <div className="flex items-center justify-between p-2 border-b border-gray-300">
        <h1 className="text-md text-[#141111] font-semibold leading-[150%]">Order summary</h1>
      </div>

      <div className="py-4 space-y-3 text-sm text-[#141111]">
        <div className="flex justify-between">
          <div>
            <span>Item total</span>{' '}
            <span className="text-gray-500">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="text-right">
            {discountAmount > 0 ? (
              <>
                <span className="line-through text-gray-400 text-sm">
                  {currency}
                  {totalPrice.toFixed(2)}
                </span>
                <br />
                <span className="font-medium text-green-600">
                  {currency}
                  {(totalPrice - discountAmount).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-medium">
                {currency}
                {totalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {orderMethod === 'delivery' && (
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span className="font-medium">
              {currency}
              {deliveryFee.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Service Charge</span>
          <span className="font-medium">
            {currency}
            {serviceCharge}
          </span>
        </div>

        {storeDetails?.custom_fee_label && (
          <div className="flex justify-between">
            <span>{storeDetails.custom_fee_label}</span>
            <span className="font-medium">
              {currency}
              {validCustomFee}
            </span>
          </div>
        )}

        {walletBalance && (
          <div className="flex justify-between">
            <span>Wallet balance</span>
            <span className="font-medium text-green-500">
              {currency}
              {walletBalance.toFixed(2)}
            </span>
          </div>
        )}

        {restaurantTip !== null && (
          <div className="flex justify-between">
            <span>Restaurant tip</span>
            <span className="font-medium">
              {currency}
              {restaurantTip.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between font-semibold border-t border-gray-200 pt-3">
          <span>Total payment</span>
          <span>
            {currency}
            {rawFinalTotal.toFixed(2)}
          </span>
        </div>

        {validCouponData && (
          <div className="flex justify-between text-green-600 text-sm pt-1">
            <span>Discount ({validCouponData.discount}{validCouponData.discount_type === 'percent' ? '%' : ''} off)</span>
            <span>-{currency}{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <button
          onClick={onPlaceOrderClick}
          disabled={isPlacingOrder}
          className="w-full mt-3 bg-[#FF4D4D] text-white py-2 rounded text-sm font-medium cursor-pointer"
        >
          {isPlacingOrder ? <Loader /> : 'Place Order'}
        </button>
        {formErrors?.map((error, idx) => (
          <p className="text-red-500 font-bold" key={idx}>
            {error}
          </p>
        ))}
        {orderError && <p className="text-red-500 text-sm mt-2">{orderError}</p>}
        {walletBalance && (
          <>
            <p className="text-red-500">
              Note: If your wallet balance is insufficient to cover the total amount, the remaining
              balance will be charged to your selected payment method.{' '}
            </p>
          </>
        )}

        <p className="text-center text-xs text-gray-500 pt-2 pb-4">
          By proceeding, you are automatically accepting the{' '}
          <span className="text-[#FF4D4D]">Terms & Conditions</span>
        </p>
      </div>
      {isRedirecting && !is3DSProcessing && (
        <div
          className="fixed inset-0 z-[9999] bg-white/80 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-red-600 mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-sm text-gray-700">Redirecting, please wait...</p>
          </div>
        </div>
      )}
      
      {/* 3D Secure Verification Overlay */}
      {is3DSProcessing && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-blue-600 animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Verification</h3>
            <p className="text-gray-600 text-sm mb-4">
              Please complete the 3D Secure verification in the popup from your bank.
            </p>
            <p className="text-xs text-gray-400">
              This extra security step protects your payment
            </p>
          </div>
        </div>
      )}
      {showAddressPopup && (
        <Popup
          content={
            <div className="p-4 space-y-4">
              {/* Selected Address */}
              <div className="p-3 rounded-lg bg-gray-100 text-sm">
                <p className="font-semibold text-gray-800">Selected Address:</p>
                <p className="text-gray-700 mt-1 font-bold">{addressMethod}</p>
              </div>

              {/* Confirmation Message */}
              <p className="text-red-500 text-sm leading-relaxed">
                Please confirm that the delivery address above is complete, accurate and detailed
                enough to help our rider locate you easily.
                <br />
                <span className="text-black text-md">If it is not detailed, you can </span>
                <span
                  className="cursor-pointer font-bold text-red-700 underline text-md"
                  onClick={() => setShowAddAddressPopup(true)}
                >
                  Add a New Address
                </span>
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  onClick={handleCancelAddress}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmAddress}
                  className="flex-1 py-2 bg-[#FF4D4D] hover:bg-red-700 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          }
          onClose={closePopup}
        />
      )}
      {showAddAddressPopup && (
        <Popup
          width="600px"
          height="300px"
          onClose={() => setShowAddAddressPopup(false)}
          content={
            <Address
              storeDetails={storeDetails}
              onAddressAdded={(newAddress) => {
                dispatch(logActivity('User added new address during checkout'));
                dispatch(setSelectedAddress(newAddress));
                setShowAddAddressPopup(false);
              }}
            />
          }
        />
      )}
    </div>
  );
};

export default OrderSummaryView;
