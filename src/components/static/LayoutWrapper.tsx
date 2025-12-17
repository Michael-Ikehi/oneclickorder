'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/static/Header';
import Footer from '@/components/static/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header/footer on auth pages, basket, and profile
  const hideLayout = 
    pathname.includes('/basket') || 
    pathname.includes('/login') || 
    pathname.includes('/sign-up') ||
    pathname.includes('/profile') ||
    pathname.includes('/takeaway')

  return (
    <>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
