/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

/**
 * The Cloudflare bindings & environment variables available at runtime.
 * Accessed via `import { env } from 'cloudflare:workers'` (Astro v6+ adapter).
 *
 * Bindings (DB/FILES/MEDIA/KV) come from wrangler.toml.
 * Secrets come from `wrangler pages secret put` (prod) or .dev.vars (local).
 */
declare namespace Cloudflare {
  interface Env {
    // --- Bindings (wrangler.toml) ---
    DB: D1Database;
    /** File storage (KV): paid combo files, free downloads, project images. */
    BLOBS: KVNamespace;
    /** Same namespace, used for rate-limit counters. */
    KV?: KVNamespace;

    // --- Public vars ---
    SITE_URL: string;
    RAZORPAY_ENABLED: string;
    TURNSTILE_ENABLED: string;

    // --- Secrets ---
    SESSION_SECRET: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD_HASH: string;
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    RAZORPAY_WEBHOOK_SECRET: string;
    TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;

    // --- Optional: transactional email (order receipts) ---
    RESEND_API_KEY?: string;
    FROM_EMAIL?: string;
  }
}

/** Convenience alias so `env: Env` annotations read cleanly across the app. */
type Env = Cloudflare.Env;

declare namespace App {
  interface Locals {
    /** Set by middleware when a valid admin session cookie is present. */
    admin: { email: string } | null;
    /** Per-request CSRF token for admin forms. */
    csrfToken: string;
  }
}
