'use client';
import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { XCircle, Clock, FileText, ArrowLeft, RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function FailedPage() {
  const router = useRouter();
  const { city, area, storeName, orderId } = useParams() as {
    city: string;
    area: string;
    storeName: string;
    orderId: string;
  };
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'generic';

  const storeUrl = `/${storeName}`;
  const basketUrl = `/takeaway/${city}/${area}/${storeName}/basket`;

  /** Maps Stripe / internal reasons → UI copy */
  const { headline, body, icon: IconComponent } = useMemo(() => {
    switch (reason) {
      case 'stripe_unavailable':
        return {
          headline: 'Payment Service Unavailable',
          body: 'Stripe could not be reached. Please check your connection and try again.',
          icon: AlertTriangle,
        };
      case 'card_declined':
        return {
          headline: 'Card Declined',
          body: 'Your bank declined the transaction. You can try a different card or contact your bank.',
          icon: XCircle,
        };
      case 'processing':
        return {
          headline: 'Payment Still Processing',
          body: 'We have not yet received a final confirmation. We\'ll email you once we know more.',
          icon: Clock,
        };
      case 'missing_client_secret':
        return {
          headline: 'Something Went Wrong',
          body: 'We were unable to start the payment flow. Please start over.',
          icon: AlertTriangle,
        };
      case 'stripe_api_error':
        return {
          headline: 'Unexpected Payment Error',
          body: 'An error occurred while confirming the payment. Please try again in a moment.',
          icon: AlertTriangle,
        };
      default:
        return {
          headline: 'Payment Failed',
          body: 'Unfortunately, we could not process your payment. You can try again or choose a different method.',
          icon: XCircle,
        };
    }
  }, [reason]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Go Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{headline}</h1>
            <p className="text-red-100 text-sm max-w-xs mx-auto">{body}</p>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-4">
            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 text-sm">Don&apos;t worry!</h3>
                  <p className="text-amber-700 text-xs mt-1">
                    Your card was <strong>not</strong> charged. If any amount was held, it will be released automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Order Reference</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">#{orderId}</span>
              </div>
              
              <div className="border-t border-gray-200" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Attempted On</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            {/*
              Custom hover logic to make text white and Refresh icon white only on hover,
              black otherwise, using useState and inline styles
            */}
            {(() => {
              const [hover, setHover] = React.useState(false);
              return (
                <Link
                  href={basketUrl}
                  className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-colors"
                  style={{
                    backgroundColor: hover ? '#E63939' : '#FF4D4D',
                    color: hover ? 'white' : 'black',
                  }}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
                  <RefreshCw
                    className="w-5 h-5"
                    style={{
                      color: hover ? 'white' : 'black',
                      transition: 'color 0.2s',
                    }}
                  />
                  Try Again
                </Link>
              );
            })()}
            
            <Link
              href={storeUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Menu
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help?{' '}
          <a href="https://www.foodhutz.co.uk/contact" className="text-[#FF4D4D] hover:underline font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
