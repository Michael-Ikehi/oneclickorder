import Providers from '@/components/Provider';

export default function TakeawayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}

