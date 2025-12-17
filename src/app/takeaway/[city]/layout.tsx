// app/[city]/layout.tsx

import { ReactNode } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

interface MetadataParams {
  params: {
    city: string;
  };
}

interface CityLayoutProps {
  children: ReactNode;
  params: {
    city: string;
    area?: string;
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
  meta_image?: string;
}

export async function generateMetadata({ params: paramPromise }: MetadataParams) {
  const params = await paramPromise;
  const city = params.city?.toLowerCase();

  try {
    const res = await fetch(`${baseUrl}/store/filter?city_name=${city}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch metadata');
    const responseData = await res.json();

    const seo: SeoData = responseData.data[0]?.city || {};
    return {
      title: seo.meta_title || `Best Restaurants in ${city} | OneClick`,
      description:
        seo.meta_description ||
        `Find top-rated restaurants in ${city}. Explore amazing dining options and make reservations.`,
      keywords: [
        'restaurants',
        city,
        'best restaurants',
        'food delivery',
        'dining',
        'reservations',
      ],
      openGraph: {
        title: seo.meta_title || `Top Restaurants in ${city} | OneClick`,
        description:
          seo.meta_description ||
          `Discover the best places to eat in ${city}. Book reservations and enjoy great meals.`,
        url: `${siteUrl}/reservation/${city}`,
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
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return {
      title: `Best Restaurants in ${city} | OneClick`,
      description: `Find top-rated restaurants in ${city}. Explore amazing dining options and make reservations.`,
      robots: 'index, follow',
    };
  }
}

export default async function CityLayout({ children, params: paramPromise }: CityLayoutProps) {
  const params = await paramPromise;
  const city = params.city?.toLowerCase();
  let restaurants: Restaurant[] = [];
  try {
    const res = await fetch(`${baseUrl}/store/filter?city_name=${city}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    const responseData = await res.json();
    restaurants = responseData.data || [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: `Best Restaurants in ${city}`,
    url: `${siteUrl}/reservation/${city}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Restaurants in ${city}`,
      itemListElement: restaurants.map((restaurant) => ({
        '@type': 'Restaurant',
        name: restaurant.name,
        ...(restaurant.cover_photo && {
          image: `${baseImage}/uploads/store/cover/${restaurant.cover_photo}`,
        }),
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.address,
          addressLocality: city,
          addressCountry: restaurant.country,
        },
        telephone: restaurant.phone,
        servesCuisine: 'Various',
        url: `${siteUrl}/takeaway/${city}`,
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
