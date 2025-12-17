'use client';

import Providers from '@/components/Provider';

export default function StorePagesLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
