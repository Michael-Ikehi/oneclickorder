'use client';
import React from 'react';
import { Wallet as WalletIcon, AlertCircle } from 'lucide-react';
import { useGetCustomerInfoQuery } from '@/lib/services/api';
import { StoreDetails } from '../landing-page/LandingPage';

interface WalletProps {
  storeDetails: StoreDetails;
}

const Wallet = ({ storeDetails }: WalletProps) => {
  const { data: customerInfo, isLoading } = useGetCustomerInfoQuery();

  if (isLoading) {
    return (
      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
      </section>
    );
  }

  if (!customerInfo) {
    return null;
  }

  const normalize = (str: string | undefined | null) =>
    typeof str === 'string'
      ? str.normalize().trim().replace(/\u200B/g, '')
      : '';

  const walletBalance = customerInfo.wallet_balance ?? 0;
   const walletCurrency = normalize(customerInfo.currency_code);
  const storeCurrency = normalize(storeDetails?.zone_currency?.currency);
  const currencySymbol = storeDetails?.zone_currency?.currency_symbol || '£';

  const isWalletCurrencyValid = walletCurrency === storeCurrency;
  const hasWalletCredit = walletBalance > 0 && isWalletCurrencyValid;
  
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasWalletCredit ? 'bg-green-100' : 'bg-gray-100'}`}>
            <WalletIcon className={`w-4 h-4 ${hasWalletCredit ? 'text-green-600' : 'text-gray-500'}`} />
        </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Wallet</h2>
        {hasWalletCredit ? (
              <p className="text-sm text-green-600 font-medium">
                {currencySymbol}{walletBalance.toFixed(2)} available
              </p>
            ) : walletBalance > 0 && !isWalletCurrencyValid ? (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Balance in different currency
              </p>
            ) : (
              <p className="text-sm text-gray-500">No balance available</p>
            )}
          </div>
            </div>

        {hasWalletCredit && (
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {currencySymbol}{walletBalance.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Wallet;
