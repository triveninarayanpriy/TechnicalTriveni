// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// The public site URL. Overridden at build time by the SITE_URL env var so the
// same codebase works for local dev, previews, and your final custom domain.
const SITE = process.env.SITE_URL || 'https://www.technicaltriveni.me';

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
        "connect-src 'self' blob: data: https://api.razorpay.com https://lumberjack.razorpay.com https://cdn.jsdelivr.net https://modelviewer.dev",
        "media-src 'self' https:",
        "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "'wasm-unsafe-eval'",
          'blob:',
          'https://checkout.razorpay.com',
          'https://challenges.cloudflare.com',
          'https://cdn.jsdelivr.net',
        ],
      },
      styleDirective: {
        resources: [
          "'self'",
          'https://fonts.googleapis.com',
          // Allow inline style="" attributes used across components.
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
        // <model-viewer> injects a fixed <style> element (pinned @4.0.0).
        hashes: ['sha256-yhlpZVZMy2vXExwTGihUWVSrOxyhMuvj+Ygg7pyBWek='],
      },
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
