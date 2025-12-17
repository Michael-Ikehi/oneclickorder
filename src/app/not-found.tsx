'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Logo */}
        <Link href="/amala-joint" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <Image 
            src="/images/mask.png" 
            alt="FoodHutz" 
            width={48} 
            height={52}
            className="w-12 h-13"
          />
          <span className="text-white font-bold text-2xl">FOODHUTZ</span>
        </Link>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">
            404
          </h1>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Oops! Looks like this page took a wrong turn. 
            Maybe it went out for food delivery?
          </p>
        </div>

        {/* Decorative Food Emoji */}
        <div className="flex items-center justify-center gap-4 text-4xl mb-10 opacity-50">
          <span>🍔</span>
          <span>🍕</span>
          <span>🌮</span>
          <span>🍜</span>
          <span>🍣</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/amala-joint"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white font-bold hover:from-red-600 hover:to-orange-600 transition-all w-full sm:w-auto justify-center group"
          >
            <Utensils className="w-5 h-5 text-black" />
            <span
              style={{
                transition: 'color 0.2s',
              }}
              className="group-hover:text-black"
            >
              Order Food
            </span>
          </Link>
          
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-bold hover:bg-white/20 transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Contact Link */}
        <p className="text-gray-500 text-sm mt-8">
          Need help? <a href="https://www.foodhutz.co.uk/contact" className="text-red-400 hover:text-red-300 underline">Contact Support</a>
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
    </div>
  );
}

