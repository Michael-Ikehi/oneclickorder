// app/[city]/[area]/layout.tsx

import { ReactNode } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

interface MetadataParams {
  params: {
    city: string;
    area: string;
  };
}

interface AreaLayoutProps {
  children: ReactNode;
  params: {
    city: string;
    area: string;
  };
}

interface Restaurant {
  name: string;
  cover_photo?: string | null;
  address: string;
  country: string;
  phone: string;
}

interface SeoData {
  meta_title?: string;
  meta_description?: string;
  restaurant_meta_title?: string;
  restaurant_meta_description?: string;
  meta_image?: string;
}

export async function generateMetadata({ params: paramPromise }: MetadataParams) {
  const params = await paramPromise;
  const area = params.area?.toLowerCase();
  const city = params.city?.toLowerCase();

  try {
    const res = await fetch(`${baseUrl}/store/filter?area_name=${area}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch metadata');
    const responseData = await res.json();
    const seo: SeoData = responseData.data[0]?.area || {};
    return {
      title: seo.meta_title || `Best Restaurants in ${area} | OneClick`,
      description:
        seo.meta_description ||
        `Find top-rated restaurants in ${area}. Explore amazing dining options and make reservations.`,
      keywords: [
        'restaurants',
        area,
        'best restaurants',
        'food delivery',
        'dining',
        'reservations',
      ],
      openGraph: {
        title: seo.restaurant_meta_title || `Top Restaurants in ${area} | OneClick`,
        description:
          seo.restaurant_meta_description ||
          `Discover the best places to eat in ${area}. Book reservations and enjoy great meals.`,
        url: `${siteUrl}/reservation/${city}/${area}`,
        images: seo.meta_image
          ? [
              {
                url: `${baseImage}/uploads/${seo.meta_image}`,
                width: 800,
                height: 600,
              },
            ]
          : [],
        siteName: 'OneClick',
        locale: 'en-US',
        type: 'website',
      },
      robots: 'index, follow',
    };
  } catch {
    // Expected when area doesn't exist - return fallback metadata
    return {
      title: `Best Restaurants in ${area} | OneClick`,
      description: `Find top-rated restaurants in ${area}. Explore amazing dining options and make reservations.`,
      robots: 'index, follow',
    };
  }
}

export default async function AreaLayout({ children, params: paramPromise }: AreaLayoutProps) {
  const params = await paramPromise;
  const area = params.area?.toLowerCase();
  const city = params.city?.toLowerCase();
  let restaurants: Restaurant[] = [];

  try {
    const res = await fetch(`${baseUrl}/store/filter?area_name=${area}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    const responseData = await res.json();
    restaurants = responseData.data || [];
  } catch {
    // Expected when area doesn't exist - restaurants will be empty
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Restaurants in ${area}`,
    url: `${siteUrl}/reservation/${city}/${area}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Restaurants in ${area}`,
      itemListElement: restaurants.map((restaurant) => ({
        '@type': 'Restaurant',
        name: restaurant.name,
        ...(restaurant.cover_photo && {
          image: `${baseImage}/uploads/store/cover/${restaurant.cover_photo}`,
        }),
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.address,
          addressLocality: area,
          addressCountry: restaurant.country,
        },
        telephone: restaurant.phone,
        servesCuisine: 'Various',
        url: `${siteUrl}/takeaway/${city}/${area}`,
      })),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <main>{children}</main>
    </div>
  );
}
