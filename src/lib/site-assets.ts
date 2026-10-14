import type { D1Database } from '@cloudflare/workers-types';
import { getSiteAssetsConfig, type SiteAssetsConfig, type SiteAssetSlot, type ChannelShowcaseItem } from './db';

export interface SlotSpec {
  name: string;
  label: string;
  usedOn: string;
  width: number;
  height: number;
  ratio: number;
  ratioLabel: string;
  recommendedText: string;
  accept: string;
}

export const SITE_IMAGE_SPECS: Record<string, SlotSpec> = {
  maker_photo: {
    name: 'maker_photo',
    label: 'Maker photo',
    usedOn: 'Home, About',
    width: 1200,
    height: 1500,
    ratio: 4 / 5,
    ratioLabel: '4:5',
    recommendedText: 'Recommended 1200 × 1500 px (4:5). JPG, PNG or WebP, up to 5 MB.',
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
  how_it_works_image: {
    name: 'how_it_works_image',
    label: 'How it works image',
    usedOn: 'How it works',
    width: 1400,
    height: 1000,
    ratio: 7 / 5,
    ratioLabel: '7:5',
    recommendedText: 'Recommended 1400 × 1000 px (7:5). Shown beside "Everything you need to finish the build".',
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
  channel_showcase: {
    name: 'channel_showcase',
    label: 'Channel showcase',
    usedOn: 'Home',
    width: 1600,
    height: 900,
    ratio: 16 / 9,
    ratioLabel: '16:9',
    recommendedText: 'Three 16:9 images, recommended 1600 × 900 px each. Pick pack covers or upload your own.',
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
  default_share_image: {
    name: 'default_share_image',
    label: 'Default share image',
    usedOn: 'Link previews',
    width: 1200,
    height: 630,
    ratio: 1200 / 630,
    ratioLabel: '1.91:1',
    recommendedText: 'Recommended 1200 × 630 px. Used when a page has no cover.',
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
};

export type AssetStatus = 'good_size' | 'too_small' | 'wrong_ratio' | 'not_set';

export function computeSlotStatus(
  slot: { url?: string; width?: number; height?: number } | null | undefined,
  spec: SlotSpec
): { status: AssetStatus; label: string } {
  if (!slot || !slot.url || !slot.url.trim()) {
    return { status: 'not_set', label: 'Not set' };
  }

  const w = slot.width || 0;
  const h = slot.height || 0;

  if (w > 0 && h > 0) {
    // Check if dimensions are significantly smaller than recommended
    if (w < spec.width * 0.7 || h < spec.height * 0.7) {
      return { status: 'too_small', label: 'Too small' };
    }
    // Check ratio tolerance within 8%
    const currentRatio = w / h;
    const diff = Math.abs(currentRatio - spec.ratio) / spec.ratio;
    if (diff > 0.08) {
      return { status: 'wrong_ratio', label: 'Wrong ratio' };
    }
  }

  return { status: 'good_size', label: 'Good size' };
}

export function buildSrcSet(item: { url: string; variants?: Record<string, string> }): string {
  if (!item || !item.url) return '';
  if (item.variants && typeof item.variants === 'object') {
    const entries = Object.entries(item.variants).filter(([_, u]) => typeof u === 'string' && u.length > 0);
    if (entries.length > 0) {
      return entries
        .sort(([w1], [w2]) => Number(w1) - Number(w2))
        .map(([w, u]) => `${u} ${w}w`)
        .join(', ');
    }
  }
  return '';
}

export function validateSocialUrl(
  platform: 'youtube' | 'instagram' | 'github' | 'linkedin',
  url: string
): { valid: boolean; error?: string } {
  if (!url || !url.trim()) return { valid: true };
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) {
    return { valid: false, error: 'URL must start with https://' };
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    switch (platform) {
      case 'youtube':
        if (host !== 'youtube.com' && host !== 'youtu.be') {
          return { valid: false, error: 'Must be on youtube.com or youtu.be' };
        }
        break;
      case 'instagram':
        if (host !== 'instagram.com') {
          return { valid: false, error: 'Must be on instagram.com' };
        }
        break;
      case 'github':
        if (host !== 'github.com') {
          return { valid: false, error: 'Must be on github.com' };
        }
        break;
      case 'linkedin':
        if (host !== 'linkedin.com') {
          return { valid: false, error: 'Must be on linkedin.com' };
        }
        break;
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export async function getSiteAssets(db: D1Database): Promise<SiteAssetsConfig> {
  return await getSiteAssetsConfig(db);
}
