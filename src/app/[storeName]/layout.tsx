import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Providers from '@/components/Provider';

interface PageProps {
  params: Promise<{ storeName: string }>;
  children: React.ReactNode;
}

interface Review {
  rating: number;
  status?: string;
  full_name?: string;
  comment?: string;
  created_at?: string;
}

interface Schedule {
  day: number;
  opening_time: string;
  closing_time: string;
}

interface StoreData {
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
  reviews?: Review[];
  schedules?: Schedule[];
  delivery_time?: string;
  avg_rating?: number;
  items?: any[];
  category_details?: { name: string }[];
  store_seo?: { type: string; meta_title?: string; meta_description?: string; meta_keywords?: string }[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://one.foodhutz.com';
const baseImage = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

async function getStoreDetails(storeName: string): Promise<StoreData | null> {
  try {
    const res = await fetch(`${baseUrl}/stores/details/${storeName}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Helper to convert day number to day name
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || '';
}

// Helper to format time for schema
function formatTime(time: string): string {
  if (!time) return '09:00';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return time;
}

export async function generateMetadata({ params }: { params: Promise<{ storeName: string }> }): Promise<Metadata> {
  const { storeName } = await params;
  const store = await getStoreDetails(storeName);
  
  if (!store) {
    return {
      title: 'Store Not Found | FoodHutz',
    };
  }

  const canonicalUrl = `${siteUrl}/${store.slug || storeName}`;
  
  // Simple image: store cover or default fallback
  const defaultCover = '2025-04-08-67f59e4a84c28.png';
  const imageUrl = `${baseImage}/uploads/store/cover/${store.cover_photo || defaultCover}`;

  // Simple location text
  const areaName = store.areaData?.name || '';
  const locationText = areaName ? ` in ${areaName}` : '';

  // Calculate average rating from approved reviews only
  const approvedReviews = (store.reviews || []).filter(r => r.status === 'approved');
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
  const title = `${store.name} | FoodHutz`;
  const description = `Order from ${store.name}${locationText}. Order now! 🚀${ratingText}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: store.name,
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
}

export default async function StoreLayout({ children, params }: PageProps) {
  const { storeName } = await params;
  const store = await getStoreDetails(storeName);

  if (!store) {
    notFound();
  }

  const canonicalUrl = `${siteUrl}/${store.slug || storeName}`;
  
  // Calculate ratings
  const approvedReviews = store.reviews?.filter((r) => r.status === 'approved') || [];
  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews > 0 
    ? approvedReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
    : store.avg_rating || 0;

  // Build location data
  const cityName = store.cityData?.name || '';
  const areaName = store.areaData?.name || '';

  // Get cuisines from categories
  const cuisines = store.category_details?.map(c => c.name).slice(0, 6) || ['Restaurant'];

  // Build opening hours specification from schedules
  const openingHoursSpec = store.schedules?.map(schedule => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: getDayName(schedule.day),
    opens: formatTime(schedule.opening_time),
    closes: formatTime(schedule.closing_time),
  })) || [];

  // Restaurant Schema
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${canonicalUrl}#restaurant`,
    name: store.name,
    description: store.description || `Order food online from ${store.name}`,
    url: canonicalUrl,
    ...(store.cover_photo && {
      image: `${baseImage}/uploads/store/cover/${store.cover_photo}`,
    }),
    ...(store.logo && {
      logo: `${baseImage}/uploads/store/${store.logo}`,
    }),
    telephone: store.phone || undefined,
    priceRange: '££',
    servesCuisine: cuisines,
    ...(store.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.address,
        ...(areaName && { addressLocality: areaName }),
        ...(cityName && { addressRegion: cityName }),
        addressCountry: store.country || 'GB',
      },
    }),
    ...(store.latitude && store.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: parseFloat(String(store.latitude)),
        longitude: parseFloat(String(store.longitude)),
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
      url: canonicalUrl,
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
        name: 'Restaurants',
        item: `${siteUrl}/takeaway`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: store.name,
        item: canonicalUrl,
      },
    ],
  };

  // Menu Items Schema (limited to top 30 items)
  const menuItems = (store.items || []).slice(0, 30).map((item: any) => {
    const price = item?.price || item?.base_price;
    const menuItem: any = {
      '@context': 'https://schema.org',
      '@type': 'MenuItem',
      name: item?.name,
      description: item?.description || undefined,
      url: canonicalUrl,
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
    '@id': `${canonicalUrl}#reviews`,
    name: store.name,
    review: approvedReviews.slice(0, 10).map((review: Review) => ({
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
    <Providers>
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

      {children}
    </Providers>
  );
}
