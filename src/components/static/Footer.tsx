'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Powered By */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Powered by</span>
            <Link href="https://www.foodhutz.co.uk" target="_blank" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Image 
                src="/images/mask.png" 
                alt="FoodHutz" 
                width={20} 
                height={22}
                className="w-5 h-[22px]"
              />
              <span className="font-bold text-sm text-gray-900">FoodHutz</span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a 
              href="https://www.foodhutz.co.uk/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors"
            >
              Terms
            </a>
            <span className="text-gray-300">•</span>
            <a 
              href="https://www.foodhutz.co.uk/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors"
            >
              Privacy
            </a>
            <span className="text-gray-300">•</span>
            <a 
              href="https://www.foodhutz.co.uk/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors"
            >
              Support
            </a>
          </div>

          {/* Social & Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/foodhutz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-[#FF4D4D] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com/foodhutz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-[#FF4D4D] hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
            <span className="text-xs text-gray-400">© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
