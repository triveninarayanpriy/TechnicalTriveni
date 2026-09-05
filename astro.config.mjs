// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// The public site URL. Overridden at build time by the SITE_URL env var so the
// same codebase works for local dev, previews, and your final custom domain.
const SITE = process.env.SITE_URL || 'https://technicaltriveni.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      // Gives `astro dev` access to local D1/R2/KV bindings from wrangler.toml
      enabled: true,
    },
    imageService: 'compile',
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/account'),
    }),
  ],
  security: {
    checkOrigin: true,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
