import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://one.foodhutz.com';
  const api = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const urls: MetadataRoute.Sitemap = [];

  try {
    if (api) {
      const res = await fetch(`${api}/all-stores-grouped`, { cache: 'no-store' });
      const all = await res.json();
      const data = all?.data || {};

      for (const cityKey of Object.keys(data)) {
        const areas = data[cityKey] || {};
        for (const areaKey of Object.keys(areas)) {
          const stores = areas[areaKey] || [];
          for (const store of stores) {
            if (store?.module_id === 2) {
              const city = store?.cities?.slug;
              const area = store?.areas?.slug;
              const slug = store?.slug;
              if (slug) {
                // Main menu page (highest priority)
                urls.push({
                  url: `${siteUrl}/${slug}`,
                  lastModified: new Date(),
                  changeFrequency: 'daily',
                  priority: 0.9,
                });
                
                // Feed/social page (secondary)
                if (city && area) {
                  urls.push({
                    url: `${siteUrl}/takeaway/${city}/${area}/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    urls.push({ url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 });
  }

  urls.push({ url: `${siteUrl}/takeaway`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 });

  // Add popular vertical landing pages
const verticals = [
  'online-takeaway',
  'online-food-delivery',
  'online-grocery-delivery',
  'online-pharmacy-delivery',
  'takeaway',
  'delivery',
];
verticals.forEach(v => urls.push({ url: `${siteUrl}/london/${v}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }));

// Add city and area listing pages derived from data
try {
  const res2 = await fetch(`${api}/all-stores-grouped`, { cache: 'no-store' });
  const all2 = await res2.json();
  const data2 = all2?.data || {};
  for (const c of Object.keys(data2)) {
    urls.push({ url: `${siteUrl}/takeaway/${c}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 });
    for (const a of Object.keys(data2[c] || {})) {
      urls.push({ url: `${siteUrl}/takeaway/${c}/${a}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 });
    }
  }
} catch (e) { /* ignore */ }

// Add London hub & borough pages
urls.push({ url: `${siteUrl}/london`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 });
const boroughs = [
  'barking-and-dagenham','barnet','bexley','brent','bromley','camden','city-of-london','croydon','ealing','enfield','greenwich','hackney','hammersmith-and-fulham','haringey','harrow','havering','hillingdon','hounslow','islington','kensington-and-chelsea','kingston-upon-thames','lambeth','lewisham','merton','newham','redbridge','richmond-upon-thames','southwark','sutton','tower-hamlets','waltham-forest','wandsworth','westminster'
];
boroughs.forEach(b => urls.push({ url: `${siteUrl}/london/borough/${b}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }));

            return urls;
}
