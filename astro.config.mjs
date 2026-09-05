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
    // Astro computes SHA-256 hashes for its own scripts/styles and emits a
    // Content-Security-Policy. We add the external allowlist (Razorpay,
    // Turnstile, YouTube, Google Fonts) on top. This replaces the hand-rolled
    // CSP that used to live in middleware.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
        "media-src 'self' https:",
        "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://checkout.razorpay.com', 'https://challenges.cloudflare.com'],
      },
      styleDirective: {
        resources: [
          "'self'",
          'https://fonts.googleapis.com',
          // Allow inline style="" attributes used across components.
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
