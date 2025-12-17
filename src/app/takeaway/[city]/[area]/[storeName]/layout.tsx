import { fetchStoreDetails } from '@/lib/fetchStoreDetails';
import { notFound, redirect } from 'next/navigation';
import { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';

// Viewport settings for TikTok-style feed - prevent unwanted zoom/resize
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://one.foodhutz.com';
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

interface RouteParams {
  city: string;
  area: string;
  storeName: string;
}

export interface StoreSEO {
  type: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_image: string | null;
}

interface Review {
  rating: number;
  status?: string;
}

interface Schedule {
  day: number;
  opening_time: string;
  closing_time: string;
}

interface PriceRange {
  min_price?: number;
  max_price?: number;
}

export interface StoreDetail {
  slug?: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  country?: string;
  cover_photo?: string;
  logo?: string;
  latitude?: string | number;
  longitude?: string | number;
  cityData?: { slug: string; name?: string };
  areaData?: { slug: string; name?: string };
  store_seo?: StoreSEO[];
  reviews?: Review[];
  schedules?: Schedule[];
  price_range?: PriceRange;
  delivery_time?: string;
  avg_rating?: number;
  items?: any[];
  category_details?: { name: string }[];
}

// Helper to convert day number to day name
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || '';
}

// Helper to format time for schema
function formatTime(time: string): string {
  // Ensure time is in HH:MM format
  if (!time) return '09:00';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return time;
}

// Generate metadata for SEO
export async function generateMetadata({
  params: paramPromise,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const params = await paramPromise;
  const { city, area, storeName } = params;

  try {
    const data: StoreDetail = await fetchStoreDetails(storeName);

    const citySlug = data.cityData?.slug;
    const areaSlug = data.areaData?.slug;

    if (citySlug !== city || areaSlug !== area) notFound();

    // Simple image: store cover or default fallback
    const defaultCover = '2025-04-08-67f59e4a84c28.png';
    const imageUrl = `${baseImage}/uploads/store/cover/${data.cover_photo || defaultCover}`;

    // Simple location text
    const areaName = data.areaData?.name || '';
    const locationText = areaName ? ` in ${areaName}` : '';

    // Calculate average rating from approved reviews only
    const approvedReviews = (data.reviews || []).filter(r => r.status === 'approved');
    const reviewCount = approvedReviews.length;
    const totalRating = approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // Generate star emojis based on rating (rounded)
    const starCount = Math.round(avgRating);
    const stars = '⭐'.repeat(starCount);
    const ratingText = reviewCount > 0 
      ? `\n${stars} ${avgRating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})`
      : '';

    // Clean, short title and description
    const title = `${data.name} | FoodHutz`;
    const description = `Order from ${data.name}${locationText}. Order now! 🚀${ratingText}`;

    // URLs
    const canonicalUrl = `${siteUrl}/${data.slug || storeName}`;
    const thisPageUrl = `${siteUrl}/takeaway/${city}/${area}/${data.slug || storeName}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: thisPageUrl,
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.name,
        }],
        siteName: 'FoodHutz',
        locale: 'en_GB',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch {
    // Store not found or city/area mismatch - show 404
    return notFound();
  }
}

export default async function Layout({
  children,
  params: paramPromise,
}: {
  children: ReactNode;
  params: RouteParams;
}) {
  const params = await paramPromise;
  const { city, area, storeName } = params;

  try {
    const data: StoreDetail = await fetchStoreDetails(storeName);

    // Redirect if slug doesn't match
    if (data.slug && data.slug !== storeName) {
      redirect(`/takeaway/${city}/${area}/${data.slug}`);
    }

    // Calculate ratings
    const approvedReviews = data.reviews?.filter((r) => r.status === 'approved') || [];
    const totalRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const totalReviews = approvedReviews.length;
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : data.avg_rating || 0;

    // Build location data
    const cityName = data.cityData?.name || city.replace(/-/g, ' ');
    const areaName = data.areaData?.name || area.replace(/-/g, ' ');
    const storeUrl = `${siteUrl}/takeaway/${city}/${area}/${data.slug || storeName}`;

    // Get cuisines from categories
    const cuisines = data.category_details?.map(c => c.name).slice(0, 6) || ['African', 'British'];

    // Build opening hours specification from schedules
    const openingHoursSpec = data.schedules?.map(schedule => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: getDayName(schedule.day),
      opens: formatTime(schedule.opening_time),
      closes: formatTime(schedule.closing_time),
    })) || [];

    // Price range string
    const priceRange = data.price_range?.min_price && data.price_range?.max_price
      ? `£${data.price_range.min_price} - £${data.price_range.max_price}`
      : '££';

    // Restaurant Schema
    const restaurantSchema = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `${storeUrl}#restaurant`,
      name: data.name,
      description: data.description || `Order food online from ${data.name}`,
      url: storeUrl,
      ...(data.cover_photo && {
        image: `${baseImage}/uploads/store/cover/${data.cover_photo}`,
      }),
      ...(data.logo && {
        logo: `${baseImage}/uploads/store/${data.logo}`,
      }),
      telephone: data.phone || undefined,
      priceRange,
      servesCuisine: cuisines,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address || '',
        addressLocality: areaName,
        addressRegion: cityName,
        addressCountry: data.country || 'GB',
      },
      ...(data.latitude && data.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: parseFloat(String(data.latitude)),
          longitude: parseFloat(String(data.longitude)),
        },
      }),
      ...(openingHoursSpec.length > 0 && {
        openingHoursSpecification: openingHoursSpec,
      }),
      ...(avgRating > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(avgRating.toFixed(1)),
          bestRating: 5,
          worstRating: 1,
          ratingCount: totalReviews || 1,
        },
      }),
      hasMenu: {
        '@type': 'Menu',
        url: storeUrl,
      },
      acceptsReservations: false,
      currenciesAccepted: 'GBP',
      paymentAccepted: 'Cash, Credit Card',
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
                {
                  '@type': 'ListItem',
                  position: 2,
          name: 'Takeaway',
          item: `${siteUrl}/takeaway`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: cityName,
                  item: `${siteUrl}/takeaway/${city}`,
                },
                {
                  '@type': 'ListItem',
          position: 4,
          name: areaName,
                  item: `${siteUrl}/takeaway/${city}/${area}`,
                },
                {
                  '@type': 'ListItem',
          position: 5,
          name: data.name,
          item: storeUrl,
                },
              ],
    };

    // Menu Items Schema (limited to top 30 items)
    const menuItems = (data.items || []).slice(0, 30).map((item: any) => {
      const price = item?.price || item?.base_price;
      const menuItem: any = {
                    '@context': 'https://schema.org',
                    '@type': 'MenuItem',
        name: item?.name,
        description: item?.description || undefined,
        url: storeUrl,
                  };

      if (price) {
        menuItem.offers = {
                      '@type': 'Offer',
                      price: String(price),
                      priceCurrency: 'GBP',
                      availability: 'https://schema.org/InStock',
                    };
      }

      if (item?.image) {
        menuItem.image = `${baseImage}/uploads/product/${item.image}`;
      }

      return menuItem;
    });

    // Review Schema (limited to top 10)
    const reviewsSchema = approvedReviews.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `${storeUrl}#reviews`,
      name: data.name,
      review: approvedReviews.slice(0, 10).map((review: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          '@type': 'Person',
          name: review.full_name || 'Customer',
        },
        ...(review.comment && { reviewBody: review.comment }),
        ...(review.created_at && { datePublished: review.created_at.split('T')[0] }),
      })),
    } : null;

    return (
      <>
        {/* Restaurant Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />

        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Menu Items Schema */}
        {menuItems.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(menuItems) }}
          />
        )}

        {/* Reviews Schema */}
        {reviewsSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
          />
        )}

        <main>{children}</main>
      </>
    );
  } catch {
    // Store fetch failed - render children without schema
    return <main>{children}</main>;
  }
}
