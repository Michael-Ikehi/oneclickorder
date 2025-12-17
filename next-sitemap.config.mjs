import axios from 'axios';

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: [],
  changefreq: 'daily',
  priority: 0.8,

  additionalPaths: async (config) => {
    const paths = [];

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/all-stores-grouped`);
      const storeData = res.data?.data;

      for (const cityKey in storeData) {
        const areas = storeData[cityKey];
        for (const areaKey in areas) {
          const stores = areas[areaKey];

          stores.forEach((store) => {
            if (store.module_id === 2) {
              const citySlug = store?.cities?.slug;
              const areaSlug = store?.areas?.slug;
              const storeSlug = store?.slug;

              if (storeSlug) {
                // Main menu page (highest priority)
                paths.push({
                  loc: `/${storeSlug}`,
                  priority: 0.9,
                });
                
                // Feed/social page (secondary)
                if (citySlug && areaSlug) {
                  paths.push({
                    loc: `/takeaway/${citySlug}/${areaSlug}/${storeSlug}`,
                    priority: 0.6,
                  });
                }
              }
            }
          });

        }
      }
    } catch (err) {
      console.error(' Failed to fetch store data for sitemap:', err);
    }

    return paths.map((path) => ({
      loc: path.loc || path,
      changefreq: config.changefreq,
      priority: path.priority || config.priority,
      lastmod: new Date().toISOString(),
    }));
  },
};

export default config;
