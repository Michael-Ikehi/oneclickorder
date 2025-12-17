import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://one.foodhutz.com';
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'production';
  const isStaging = /staging/i.test(env);

  return {
    rules: [
      {
        userAgent: '*',
        allow: isStaging ? [] : ['/'],
        disallow: isStaging ? ['/', '/'] : [],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
