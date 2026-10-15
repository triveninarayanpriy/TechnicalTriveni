/**
 * Deterministic Amazon India Affiliate Link Builder & Parser
 * Compliant with Amazon Associates Operating Agreement & Indian Affiliate Program rules.
 *
 * Rules:
 * - Only amazon.in and www.amazon.in hosts supported
 * - Clean canonical URLs (/dp/{ASIN})
 * - Strips all tracking junk (ref, pd_rd_*, pf_rd_*, qid, sr, keywords, crid, sprefix, linkCode, ascsubtag, etc.)
 * - Preserves variant parameters (th, psc)
 * - Replaces foreign tags with owner's tag
 * - Rejects shortened URLs (amzn.to, a.co, amzn.in)
 * - No scraping / server fetching
 */

export interface AffiliateSettings {
  amazon_tag: string;
  amazon_domain: string;
  disclosure_text: string;
  show_disclosure: boolean;
  custom_stores: Array<{
    name: string;
    url_template: string;
    tag?: string;
  }>;
  creators_api?: {
    partner_tag?: string;
    access_key?: string;
    secret_key?: string;
  };
}

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  amazon_tag: '',
  amazon_domain: 'www.amazon.in',
  disclosure_text: 'As an Amazon Associate I earn from qualifying purchases.',
  show_disclosure: true,
  custom_stores: [
    { name: 'Robu', url_template: '{url}', tag: '' }
  ]
};

export const AFFILIATE_LINK_ATTRIBUTES = {
  rel: 'sponsored nofollow noopener noreferrer',
  target: '_blank'
} as const;

/**
 * Validates an Amazon India Associates tracking ID.
 * Rule: Lowercase letters, digits, and hyphens, ending in -21.
 * Example: 'technicaltriveni-21', 'maker-hub-21'
 */
export function validateAmazonTag(tag: string): boolean {
  if (!tag || typeof tag !== 'string') return false;
  const trimmed = tag.trim();
  return /^[a-z0-9]+(-[a-z0-9]+)*-21$/.test(trimmed);
}

/**
 * Validates a 10-character Amazon ASIN (A-Z and 0-9).
 */
export function validateAsin(asin: string): boolean {
  if (!asin || typeof asin !== 'string') return false;
  return /^[A-Z0-9]{10}$/i.test(asin.trim());
}

export interface ExtractedAsinResult {
  asin: string;
  th?: string;
  psc?: string;
}

/**
 * Extracts a 10-character ASIN from a plain ASIN string or a full Amazon.in URL.
 * Throws clear error messages on shortened links, wrong hosts, or missing ASINs.
 */
export function extractAsin(input: string): ExtractedAsinResult {
  if (!input || typeof input !== 'string') {
    throw new Error('Input is empty or invalid.');
  }

  const trimmed = input.trim();

  // 1. Direct 10-character ASIN code
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return { asin: trimmed.toUpperCase() };
  }

  // 2. URL parsing
  let url: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProto);
  } catch {
    throw new Error('Invalid URL or ASIN provided.');
  }

  const hostname = url.hostname.toLowerCase();

  // Reject shortened links with specific, friendly instruction
  const shortHosts = ['amzn.to', 'a.co', 'amzn.in', 'amzn.asia', 'amzn.com'];
  if (shortHosts.some(sh => hostname === sh || hostname.endsWith(`.${sh}`))) {
    throw new Error('Shortened link detected (amzn.to / a.co / amzn.in). Please open it in your browser and paste the full product URL.');
  }

  // Enforce amazon.in marketplace
  if (hostname !== 'amazon.in' && hostname !== 'www.amazon.in') {
    throw new Error(`Only Amazon India (amazon.in or www.amazon.in) links are supported. Host "${url.hostname}" is not allowed.`);
  }

  // Match ASIN from standard Amazon product paths
  const pathname = url.pathname;
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/d\/([A-Z0-9]{10})(?:[/?#]|$)/i,
    /\/ASIN\/([A-Z0-9]{10})(?:[/?#]|$)/i,
  ];

  let rawAsin: string | null = null;
  for (const re of patterns) {
    const m = pathname.match(re);
    if (m && m[1]) {
      rawAsin = m[1];
      break;
    }
  }

  // Also check query param fallback if present
  if (!rawAsin) {
    const qAsin = url.searchParams.get('asin') || url.searchParams.get('ASIN');
    if (qAsin && /^[A-Z0-9]{10}$/i.test(qAsin)) {
      rawAsin = qAsin;
    }
  }

  if (!rawAsin || !validateAsin(rawAsin)) {
    throw new Error('No valid 10-character Amazon ASIN found in URL.');
  }

  const result: ExtractedAsinResult = {
    asin: rawAsin.toUpperCase()
  };

  // Preserve variant selection params if present
  const th = url.searchParams.get('th');
  if (th) result.th = th;

  const psc = url.searchParams.get('psc');
  if (psc) result.psc = psc;

  return result;
}

/**
 * Builds a clean, deterministic Amazon.in affiliate link from a full URL or ASIN.
 * Strips all junk parameters, replaces foreign tags, keeps variant parameters (th, psc).
 */
export function buildAmazonLink(
  input: string,
  tag?: string
): { url: string; asin: string; canonicalUrl: string } {
  const { asin, th, psc } = extractAsin(input);

  // Variant query parameters
  const variantParts: string[] = [];
  if (th) variantParts.push(`th=${encodeURIComponent(th)}`);
  if (psc) variantParts.push(`psc=${encodeURIComponent(psc)}`);
  const variantSuffix = variantParts.length > 0 ? `?${variantParts.join('&')}` : '';

  // Clean canonical tag-free URL
  const canonicalUrl = `https://www.amazon.in/dp/${asin}${variantSuffix}`;

  // If a valid tag is provided, attach it as the only tracking parameter
  if (tag && tag.trim()) {
    const cleanTag = tag.trim().toLowerCase();
    const queryParts = [`tag=${encodeURIComponent(cleanTag)}`];
    if (th) queryParts.push(`th=${encodeURIComponent(th)}`);
    if (psc) queryParts.push(`psc=${encodeURIComponent(psc)}`);

    return {
      url: `https://www.amazon.in/dp/${asin}?${queryParts.join('&')}`,
      asin,
      canonicalUrl
    };
  }

  return {
    url: canonicalUrl,
    asin,
    canonicalUrl
  };
}

/**
 * Builds a safe search fallback link on Amazon India when no product ASIN is verified.
 * Example: https://www.amazon.in/s?k=ESP32+DevKit+V1+30-pin&tag=tech-triveni-21
 */
export function searchLink(query: string, tag?: string): string {
  if (!query || typeof query !== 'string') {
    return 'https://www.amazon.in';
  }

  // Collapse multiple whitespaces and replace with + for clean Amazon search query
  const cleanQuery = query.trim().replace(/\s+/g, ' ');
  const formattedQuery = encodeURIComponent(cleanQuery).replace(/%20/g, '+');

  let url = `https://www.amazon.in/s?k=${formattedQuery}`;
  if (tag && tag.trim()) {
    url += `&tag=${encodeURIComponent(tag.trim().toLowerCase())}`;
  }
  return url;
}

/**
 * Resolves the final buy URL for a component at render time.
 * If status === 'verified' and ASIN exists: returns deterministic direct affiliate URL.
 * Otherwise returns searchLink fallback.
 */
export function buildComponentAffiliateUrl(
  component: {
    name: string;
    store?: string;
    buy_url?: string;
  },
  linkRecord: {
    status: string;
    asin?: string;
    canonical_url?: string;
    store?: string;
  } | null | undefined,
  settings: AffiliateSettings
): {
  url: string;
  isDirectProduct: boolean;
  isAffiliate: boolean;
  store: string;
  label: string;
} {
  const store = (linkRecord?.store || component.store || 'Amazon').trim();
  const isAmazon = /amazon/i.test(store);

  // If not Amazon, check if there's a custom store template
  if (!isAmazon) {
    const custom = settings.custom_stores.find(cs => cs.name.toLowerCase() === store.toLowerCase());
    if (custom && custom.url_template && component.buy_url) {
      let finalUrl = custom.url_template
        .replace('{url}', encodeURIComponent(component.buy_url))
        .replace('{tag}', encodeURIComponent(custom.tag || ''));
      return {
        url: finalUrl,
        isDirectProduct: true,
        isAffiliate: !!custom.tag,
        store,
        label: `Buy on ${store}`
      };
    }

    return {
      url: component.buy_url || '',
      isDirectProduct: !!component.buy_url,
      isAffiliate: false,
      store,
      label: component.buy_url ? `Buy on ${store}` : 'Find part'
    };
  }

  // Amazon logic
  const isVerified = linkRecord?.status === 'verified';
  const hasAsin = !!(linkRecord?.asin && validateAsin(linkRecord.asin));

  if (isVerified && hasAsin) {
    const built = buildAmazonLink(linkRecord.asin!, settings.amazon_tag);
    return {
      url: built.url,
      isDirectProduct: true,
      isAffiliate: !!settings.amazon_tag,
      store: 'Amazon',
      label: 'Buy on Amazon'
    };
  }

  // Fallback to Search on Amazon
  return {
    url: searchLink(component.name, settings.amazon_tag),
    isDirectProduct: false,
    isAffiliate: !!settings.amazon_tag,
    store: 'Amazon',
    label: 'Search on Amazon'
  };
}
