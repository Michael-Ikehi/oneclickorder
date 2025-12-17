import type { Metadata, Viewport } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import ToastNotification from '@/components/reUse/ToastNotification';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://one.foodhutz.com';
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

// Primary font - Modern, clean, excellent readability
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Secondary font - Bold, distinctive headings
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

// JSON-LD Structured Data
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FoodHutz',
  alternateName: 'Foodhutz One Click Order',
  url: siteUrl,
  description: 'Order food, groceries, and more from local restaurants and stores with fast delivery.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/takeaway?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'FoodHutz',
    url: siteUrl,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'FoodHutz',
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseImage}/uploads/brand/logo.png`,
    width: 512,
    height: 512,
  },
  sameAs: (process.env.NEXT_PUBLIC_SAME_AS || 'https://twitter.com/foodhutz,https://www.linkedin.com/company/foodhutz')
    .split(',')
    .filter(Boolean),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
    addressLocality: 'London',
  },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#localbusiness`,
  name: 'FoodHutz',
  description: 'Food delivery and takeaway ordering platform connecting you with local restaurants, groceries, and pharmacies.',
  url: siteUrl,
  telephone: '+44-XXX-XXX-XXXX',
  priceRange: '£-£££',
  image: `${baseImage}/uploads/brand/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
    addressLocality: 'London',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  areaServed: {
    '@type': 'City',
    name: 'London',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FoodHutz - Order Food & Groceries Online | Fast Delivery',
    template: '%s | FoodHutz',
  },
  description:
    'Order delicious food, fresh groceries, and essentials from local restaurants and stores. Fast delivery, easy ordering, and great deals. Discover restaurants near you!',
  keywords: [
    'food delivery',
    'online takeaway',
    'restaurant delivery',
    'grocery delivery',
    'order food online',
    'local restaurants',
    'fast delivery',
    'FoodHutz',
    'London food delivery',
    'takeaway near me',
  ],
  authors: [{ name: 'FoodHutz', url: siteUrl }],
  creator: 'FoodHutz',
  publisher: 'FoodHutz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/mask.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/mask.png', type: 'image/png' },
    ],
    shortcut: '/images/mask.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: 'FoodHutz',
    title: 'FoodHutz - Order Food & Groceries Online | Fast Delivery',
    description:
      'Order delicious food, fresh groceries, and essentials from local restaurants and stores. Fast delivery across London!',
    images: [
      {
        url: `${baseImage}/uploads/brand/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'FoodHutz - Order Food Online',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodHutz - Order Food & Groceries Online',
    description: 'Fast delivery from local restaurants and stores. Order now!',
    site: '@foodhutz',
    creator: '@foodhutz',
    images: [`${baseImage}/uploads/brand/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'Food & Drink',
  classification: 'Food Delivery Service',
  other: {
    'msapplication-TileColor': '#FF4D4D',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'FoodHutz',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href={baseImage} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={baseImage} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <ToastNotification />
        
        {/* TikTok Pixel */}
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('D4QR31JC77U0596TKN70');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />

        {/* Meta (Facebook/Instagram) Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '842108178718640');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=842108178718640&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
