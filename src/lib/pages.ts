import type { D1Database } from '@cloudflare/workers-types';
import { getPage, upsertPage, deletePage, recordPageRevision, listPageRevisions, type Page, type PageRevision } from './db.ts';

export interface BuiltinPageDef {
  slug: string;
  title: string;
  route: string;
  category: 'info' | 'legal';
  sectionHint?: string;
  defaultTitle: string;
  defaultMarkdown: string;
  created_at: number; // 1700000000 (14 Nov 2023)
}

export const BUILTIN_PAGES: Record<string, BuiltinPageDef> = {
  about: {
    slug: 'about',
    title: 'About',
    route: '/about',
    category: 'info',
    sectionHint: 'Controls the biography and mission section of the About page.',
    defaultTitle: 'About',
    defaultMarkdown: `## Real builds. Tested on the workbench.

I'm Triveni, a B.Tech ECE (VLSI) student at NIT Patna. Every electronics, software and AI project on Technical Triveni is built and tested by me.

### Why I build Technical Triveni

I started Technical Triveni because I was tired of electronics tutorials that don't actually work. Most guides leave out critical pinouts, skip power decoupling, or share untested code that throws errors the moment you clone it.

Technical Triveni is built on a single promise: **complete transparency and physical proof.**`,
    created_at: 1700000000,
  },

  affiliate: {
    slug: 'affiliate',
    title: 'Affiliate Disclosure',
    route: '/affiliate',
    category: 'legal',
    sectionHint: 'Official affiliate disclosure policy for external component links.',
    defaultTitle: 'Affiliate Disclosure',
    defaultMarkdown: `Technical Triveni participates in various affiliate marketing programs.

When you click on component links (e.g., to Amazon India, Robu.in, or MakerBazaar) in our Parts Lists and make a purchase, we may earn a small commission at **no additional cost to you**.

This helps support the channel and allows us to keep publishing free tutorials and open-source project guides. We only recommend components and stores that we have personally tested and trust.`,
    created_at: 1700000000,
  },

  contact: {
    slug: 'contact',
    title: 'Contact Us',
    route: '/contact',
    category: 'info',
    sectionHint: 'Controls the introductory support and partnership guidelines on the Contact page.',
    defaultTitle: 'Contact Us',
    defaultMarkdown: `We would love to hear from you. For support with any of our project combos, please include your Order ID and Razorpay Payment ID.

### General Inquiries
Email: technicaltriveniyt@gmail.com

### Business & Sponsorships
For YouTube sponsorships, part reviews, or affiliate partnerships, please email the address above with "Sponsorship" in the subject line.

We usually reply within 24-48 business hours.`,
    created_at: 1700000000,
  },

  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    route: '/cookies',
    category: 'legal',
    sectionHint: 'Policy on essential security, session, and analytics cookies.',
    defaultTitle: 'Cookie Policy',
    defaultMarkdown: `We use essential cookies to ensure the website functions correctly:

- **Session Cookies:** Used to securely authenticate admin users.
- **Security Cookies:** Managed by Cloudflare (Turnstile) to protect our checkout and contact forms from bots and spam.
- **Analytics:** We use privacy-friendly, cookieless analytics to understand site traffic.

We do not use tracking cookies for third-party advertising.`,
    created_at: 1700000000,
  },

  'digital-delivery': {
    slug: 'digital-delivery',
    title: 'Digital Delivery Policy',
    route: '/digital-delivery',
    category: 'legal',
    sectionHint: 'Policy explaining instant email delivery and access on My Downloads.',
    defaultTitle: 'Digital Delivery Policy',
    defaultMarkdown: `All products on Technical Triveni are digital downloads. Upon successful payment, you will instantly receive an email containing a secure link to download your project pack (schematics, code, 3D files, and parts lists). You can also access all your past downloads at any time by logging into the My Downloads page with your purchase email. No physical items will be shipped. If you do not receive your email within 5 minutes, please check your spam folder or contact support.`,
    created_at: 1700000000,
  },

  disclaimer: {
    slug: 'disclaimer',
    title: 'Safety Disclaimer',
    route: '/disclaimer',
    category: 'legal',
    sectionHint: 'Safety, voltage, battery warning, and educational disclaimer.',
    defaultTitle: 'Safety Disclaimer',
    defaultMarkdown: `### Educational Purposes Only
The content, tutorials, schematics, and source code provided by Technical Triveni are strictly for educational and hobbyist purposes.

### High Voltage & Batteries
Projects involving mains voltage (110V/220V) or Lithium-Polymer (LiPo) batteries present serious risks of fire, shock, or injury. If you are a beginner, seek supervision from a qualified instructor or engineer before attempting these builds.

Technical Triveni is not responsible for any damage, injury, or loss of life resulting from the reproduction of our projects.`,
    created_at: 1700000000,
  },

  'how-it-works': {
    slug: 'how-it-works',
    title: 'How It Works',
    route: '/how-it-works',
    category: 'info',
    sectionHint: 'Controls the step-by-step build, checkout, and download guide.',
    defaultTitle: 'How It Works',
    defaultMarkdown: `### 1. Browse Projects
Explore our catalog of electronics and robotics projects. Each project page provides a free overview, parts list, and step-by-step instructions.

### 2. Get the Combo
For an accelerated build, purchase the **Project Combo Pack**. This instantly unlocks all premium deliverables:
- Full Source Code (\`.ino\`, \`.cpp\`, \`.py\`, etc.)
- High-resolution Schematics & Wiring Diagrams
- 3D Print Files (\`.stl\`)
- Private Video guides or additional documentation

### 3. Build & Learn
Once purchased, you will receive an email with your secure download link. You can also re-download your files anytime from the My Purchases page using your email address.`,
    created_at: 1700000000,
  },

  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    route: '/terms',
    category: 'legal',
    sectionHint: 'Official terms of use, licensing, and liability limitations.',
    defaultTitle: 'Terms & Conditions',
    defaultMarkdown: `Last updated: October 2026

Welcome to Technical Triveni. By purchasing our digital products (Project Combos, Source Code, 3D Models), you agree to the following terms:

### 1. Digital Products
All products sold are digital downloads. No physical components, boards, or materials are shipped. You are purchasing intellectual property (code, diagrams, models) for educational purposes.

### 2. License & Usage
You may use the provided code and designs for your personal, educational, or university projects. You may NOT resell, redistribute, or publish the source files or premium diagrams online.

### 3. Liability
Electronics and robotics involve inherent risks, including but not limited to electrical shock, fire, or component damage. Technical Triveni provides these guides for educational purposes and assumes no liability for injury, damage, or loss of equipment resulting from following our tutorials.`,
    created_at: 1700000000,
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    route: '/privacy',
    category: 'legal',
    sectionHint: 'Privacy policy on customer data, Razorpay transactions, and cookies.',
    defaultTitle: 'Privacy Policy',
    defaultMarkdown: `Last updated: October 2026

Technical Triveni ("we", "our") respects your privacy. 

### Data We Collect
- **Order Information:** Name, Email address, and transaction IDs (handled securely via Razorpay). We do NOT store or process your credit card or UPI details on our servers.
- **Communication:** Messages sent via our contact form.

### How We Use Your Data
We use your email exclusively to deliver your digital purchases, provide technical support, and send critical updates regarding a project you purchased.

### Third-Party Services
We use Razorpay for payment processing and Cloudflare for site security and performance. These providers have their own privacy policies governing data processing.`,
    created_at: 1700000000,
  },

  refund: {
    slug: 'refund',
    title: 'Refund Policy',
    route: '/refund',
    category: 'legal',
    sectionHint: 'Refund and cancellation policy for digital goods.',
    defaultTitle: 'Refund Policy',
    defaultMarkdown: `### Digital Goods
Due to the nature of digital goods (source code, schematics, 3D files), **all sales are final and non-refundable once the files have been downloaded**.

### Exceptions
If you accidentally purchase the same project twice, or if the ZIP file is demonstrably corrupt and we cannot provide a working replacement, please contact us within 7 days at technicaltriveniyt@gmail.com with your Order ID for a refund.

### Delivery
Digital files are delivered instantly via email upon successful payment via Razorpay. If you do not receive the email, please check your spam folder or contact support.`,
    created_at: 1700000000,
  },
};

export interface EffectivePageContent {
  slug: string;
  title: string;
  markdown: string;
  source: 'custom' | 'default';
  is_custom: boolean;
  published: number;
  meta_title: string;
  meta_description: string;
  updated_at: number;
  route: string;
  category: 'info' | 'legal';
  image_url?: string;
  sectionHint?: string;
}

/**
 * Returns the effective content for a page.
 * Used by BOTH the public-facing pages and the admin editor.
 * Returns custom row when custom content exists, otherwise built-in default.
 */
export async function getEffectiveContent(db: D1Database, slug: string): Promise<EffectivePageContent> {
  const builtin = BUILTIN_PAGES[slug];
  const row = await getPage(db, slug);

  // If a custom override exists with non-empty content and is marked custom
  const hasCustom = !!(row && row.content_md && row.content_md.trim().length > 0 && row.is_custom === 1);

  if (hasCustom && row) {
    return {
      slug,
      title: row.title || builtin?.title || slug,
      markdown: row.content_md,
      source: 'custom',
      is_custom: true,
      published: row.published ?? 1,
      meta_title: row.meta_title || '',
      meta_description: row.meta_description || '',
      updated_at: row.updated_at || Math.floor(Date.now() / 1000),
      route: builtin?.route || `/${slug}`,
      category: builtin?.category || 'info',
      image_url: row.image_url || '',
      sectionHint: builtin?.sectionHint,
    };
  }

  // Fallback to built-in default
  const defaultTitle = builtin?.defaultTitle || row?.title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const defaultMarkdown = builtin?.defaultMarkdown || row?.content_md || '';

  return {
    slug,
    title: defaultTitle,
    markdown: defaultMarkdown,
    source: 'default',
    is_custom: false,
    published: row?.published ?? 1,
    meta_title: row?.meta_title || '',
    meta_description: row?.meta_description || '',
    updated_at: (row?.updated_at && row.updated_at !== 0) ? row.updated_at : (builtin?.created_at || 1700000000),
    route: builtin?.route || `/${slug}`,
    category: builtin?.category || 'info',
    image_url: row?.image_url || '',
    sectionHint: builtin?.sectionHint,
  };
}

/**
 * Lists all pages (both built-in and any newly created custom pages)
 * normalized with their effective status, chips, dates, and categories.
 */
export async function listEffectivePages(db: D1Database): Promise<EffectivePageContent[]> {
  const rows = await db.prepare('SELECT * FROM pages').all<Page>();
  const rowMap = new Map<string, Page>();
  for (const r of rows.results || []) {
    rowMap.set(r.slug, r);
  }

  const result: EffectivePageContent[] = [];
  const processedSlugs = new Set<string>();

  // Process core built-in pages in defined order
  for (const [slug, builtin] of Object.entries(BUILTIN_PAGES)) {
    processedSlugs.add(slug);
    const row = rowMap.get(slug);
    const hasCustom = !!(row && row.content_md && row.content_md.trim().length > 0 && row.is_custom === 1);

    if (hasCustom && row) {
      result.push({
        slug,
        title: row.title || builtin.title,
        markdown: row.content_md,
        source: 'custom',
        is_custom: true,
        published: row.published ?? 1,
        meta_title: row.meta_title || '',
        meta_description: row.meta_description || '',
        updated_at: row.updated_at || Math.floor(Date.now() / 1000),
        route: builtin.route,
        category: builtin.category,
        image_url: row.image_url || '',
        sectionHint: builtin.sectionHint,
      });
    } else {
      result.push({
        slug,
        title: builtin.title,
        markdown: builtin.defaultMarkdown,
        source: 'default',
        is_custom: false,
        published: row?.published ?? 1,
        meta_title: row?.meta_title || '',
        meta_description: row?.meta_description || '',
        updated_at: (row?.updated_at && row.updated_at !== 0) ? row.updated_at : builtin.created_at,
        route: builtin.route,
        category: builtin.category,
        image_url: row?.image_url || '',
        sectionHint: builtin.sectionHint,
      });
    }
  }

  // Any extra pages created in DB that are not in BUILTIN_PAGES
  for (const [slug, row] of rowMap.entries()) {
    if (!processedSlugs.has(slug)) {
      result.push({
        slug,
        title: row.title || slug,
        markdown: row.content_md || '',
        source: row.is_custom ? 'custom' : 'default',
        is_custom: row.is_custom === 1,
        published: row.published ?? 1,
        meta_title: row.meta_title || '',
        meta_description: row.meta_description || '',
        updated_at: row.updated_at || Math.floor(Date.now() / 1000),
        route: `/${slug}`,
        category: 'info',
        image_url: row.image_url || '',
      });
    }
  }

  return result;
}

/**
 * Idempotently imports all built-in defaults into the database as custom content.
 * Never overwrites an existing custom page.
 * Returns { imported, skipped }.
 */
export async function importAllBuiltinPages(db: D1Database): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;
  const now = Math.floor(Date.now() / 1000);

  for (const [slug, def] of Object.entries(BUILTIN_PAGES)) {
    const existing = await getPage(db, slug);
    if (existing && existing.is_custom === 1 && existing.content_md && existing.content_md.trim().length > 0) {
      skipped++;
      continue;
    }

    await upsertPage(db, {
      slug,
      title: def.defaultTitle,
      content_md: def.defaultMarkdown,
      published: existing?.published ?? 1,
      meta_title: existing?.meta_title ?? '',
      meta_description: existing?.meta_description ?? '',
      image_url: existing?.image_url ?? '',
      is_custom: 1,
    });

    await recordPageRevision(db, {
      page_slug: slug,
      title: def.defaultTitle,
      content_md: def.defaultMarkdown,
      source: 'import',
      note: 'Imported site content',
    });

    imported++;
  }

  return { imported, skipped };
}

/**
 * Resets a page to built-in default by deleting the custom database row.
 */
export async function resetPageToDefault(db: D1Database, slug: string): Promise<void> {
  const existing = await getPage(db, slug);
  if (existing) {
    // Record revision before removing
    await recordPageRevision(db, {
      page_slug: slug,
      title: existing.title,
      content_md: existing.content_md,
      meta_title: existing.meta_title,
      meta_description: existing.meta_description,
      source: 'default',
      note: 'Reset to default content',
    });
  }
  await deletePage(db, slug);
}
