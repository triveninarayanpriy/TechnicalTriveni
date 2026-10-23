import type { Component } from './db';

export interface ProposedBomItem {
  name: string;
  qty: number | string;
  role?: string;
  approx_price_inr?: number;
  buy_url?: string;
  notes?: string;
}

export interface PreparedComponent {
  name: string;
  store: string;
  category: string;
  unit_price_inr: number;
  buy_url: string;
  notes: string;
}

export interface ComponentMatchResult {
  bom_item: ProposedBomItem;
  status: 'matched' | 'ambiguous' | 'new';
  component_id?: number;
  matched_component?: Component;
  candidates?: Array<{
    component: Component;
    similarity: number;
  }>;
  prepared_component?: PreparedComponent;
  similarity: number;
}

/**
 * Normalizes a component name for matching:
 * - lowercase
 * - strips punctuation & special symbols
 * - strips noise terms (module, board, etc.) while keeping core identifiers
 * - collapses whitespace
 */
export function normalizeComponentName(raw: string): string {
  if (!raw) return '';
  let str = raw.toLowerCase().trim();

  // Strip common noisy parentheticals like "(pack of 2)", "(30 pin)", "(5v)"
  str = str.replace(/\([^)]*\)/g, ' ');

  // Replace punctuation/separators with spaces
  str = str.replace(/[^a-z0-9]/g, ' ');

  // Strip generic noise words
  const noise = [
    'module',
    'board',
    'breakout',
    'sensor',
    'shield',
    'kit',
    'pack',
    'chip',
    'ic',
    'microcontroller',
    'component',
    'electronic'
  ];
  const words = str.split(/\s+/).filter(Boolean);
  const filtered = words.filter(w => !noise.includes(w) || words.length <= 2);

  const res = (filtered.length > 0 ? filtered : words).join(' ');
  return res.trim();
}

/**
 * Calculate Dice coefficient trigram similarity between two strings.
 * Returns a score between 0.0 and 1.0.
 */
export function trigramSimilarity(a: string, b: string): number {
  const normA = a.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normB = b.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  if (normA.length < 3 || normB.length < 3) {
    // For very short strings, fall back to simple containment or exact match
    if (normA.includes(normB) || normB.includes(normA)) {
      const minLen = Math.min(normA.length, normB.length);
      const maxLen = Math.max(normA.length, normB.length);
      return minLen / maxLen;
    }
    return 0.0;
  }

  const getTrigrams = (s: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (let i = 0; i <= s.length - 3; i++) {
      const tri = s.substring(i, i + 3);
      map.set(tri, (map.get(tri) || 0) + 1);
    }
    return map;
  };

  const mapA = getTrigrams(normA);
  const mapB = getTrigrams(normB);

  let intersection = 0;
  for (const [tri, countA] of mapA.entries()) {
    const countB = mapB.get(tri) || 0;
    intersection += Math.min(countA, countB);
  }

  const totalA = normA.length - 2;
  const totalB = normB.length - 2;

  return (2 * intersection) / (totalA + totalB);
}

/**
 * Aliases mapping common phrases and shorthand to canonical component terms.
 */
const ALIAS_MAP: Record<string, string[]> = {
  esp32: [
    'esp32 devkit',
    'esp32 devkit v1',
    'esp 32',
    'esp32 wroom',
    'esp32-wroom-32',
    'esp32-devkitc',
    'esp32 development board',
    'esp32 nodemcu',
    'esp32 wifi'
  ],
  relay: [
    'relay',
    '5v relay',
    '1 channel relay',
    'relay module',
    '1 ch relay',
    'relay switch',
    'blynk relay',
    'spdt relay',
    'relay module 12v supply',
    '1 channel 5v relay'
  ],
  arduino_uno: [
    'arduino uno',
    'uno r3',
    'arduino uno r3',
    'uno rev3',
    'atmega328p uno'
  ],
  arduino_nano: [
    'arduino nano',
    'nano v3',
    'nano r3',
    'atmega328p nano'
  ],
  bme280: [
    'bme280',
    'bme 280',
    'bme280 sensor',
    'bme-280'
  ],
  ultrasonic: [
    'hc sr04',
    'hcsr04',
    'hc-sr04',
    'ultrasonic sensor',
    'ultrasonic distance sensor'
  ],
  l298n: [
    'l298n',
    'l298n motor driver',
    'l298 dual h bridge',
    'l298'
  ],
  sg90: [
    'sg90',
    'sg 90',
    'sg90 servo',
    'micro servo 9g',
    'tower pro sg90',
    'mini servo'
  ],
  tt_motor: [
    'tt motor',
    'tt gear motor',
    'bo motor',
    'dc gear motor with wheel',
    'gear motor wheel'
  ]
};

/**
 * Match a single BOM proposal against the existing component library.
 */
export function matchBomItem(
  item: ProposedBomItem,
  library: Component[]
): ComponentMatchResult {
  const rawItemName = item.name.trim();
  const normItem = normalizeComponentName(rawItemName);

  if (!normItem || library.length === 0) {
    return {
      bom_item: item,
      status: 'new',
      prepared_component: buildPreparedComponent(item),
      similarity: 0
    };
  }

  // 1. Exact match on normalized names
  for (const comp of library) {
    const normComp = normalizeComponentName(comp.name);
    if (normComp === normItem || comp.name.toLowerCase().trim() === rawItemName.toLowerCase()) {
      return {
        bom_item: item,
        status: 'matched',
        component_id: comp.id,
        matched_component: comp,
        similarity: 1.0
      };
    }
  }

  // 2. Check canonical alias mapping
  for (const [, aliases] of Object.entries(ALIAS_MAP)) {
    const itemMatchesAlias = aliases.some(alias => {
      const normAlias = normalizeComponentName(alias);
      return normItem.includes(normAlias) || normAlias.includes(normItem);
    });

    if (itemMatchesAlias) {
      // Find which library component also matches this alias group
      const matchingComps = library.filter(comp => {
        const normComp = normalizeComponentName(comp.name);
        return aliases.some(alias => {
          const normAlias = normalizeComponentName(alias);
          return normComp.includes(normAlias) || normAlias.includes(normComp);
        });
      });

      if (matchingComps.length === 1) {
        return {
          bom_item: item,
          status: 'matched',
          component_id: matchingComps[0].id,
          matched_component: matchingComps[0],
          similarity: 0.95
        };
      } else if (matchingComps.length > 1) {
        return {
          bom_item: item,
          status: 'ambiguous',
          candidates: matchingComps.map(c => ({ component: c, similarity: 0.9 })),
          similarity: 0.9
        };
      }
    }
  }

  // 3. Token-based overlap & Trigram similarity ranking
  const itemTokens = normItem.split(/\s+/).filter(t => t.length >= 3);

  const scored = library.map(comp => {
    const normComp = normalizeComponentName(comp.name);
    const compTokens = normComp.split(/\s+/).filter(t => t.length >= 3);

    // Trigram similarity
    const s1 = trigramSimilarity(normItem, normComp);
    const s2 = trigramSimilarity(rawItemName, comp.name);
    const triScore = Math.max(s1, s2);

    // Token overlap: how many significant words overlap?
    let tokenMatches = 0;
    for (const t of itemTokens) {
      if (compTokens.some(ct => ct === t || ct.startsWith(t) || t.startsWith(ct))) {
        tokenMatches++;
      }
    }
    const tokenScore = itemTokens.length > 0 ? (tokenMatches / Math.max(itemTokens.length, compTokens.length)) : 0;
    const combinedScore = Math.max(triScore, tokenScore * 0.85);

    return {
      component: comp,
      similarity: combinedScore,
      triScore,
      tokenMatches
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  const top = scored[0];
  const candidatesAbove65 = scored.filter(s => s.similarity >= 0.65 || s.tokenMatches >= 1 && itemTokens.length >= 1);

  // If top candidate is >= 0.85
  if (top && top.similarity >= 0.85) {
    // If second candidate is very close (within 0.05) and also >= 0.85, mark as ambiguous
    if (scored.length > 1 && scored[1].similarity >= 0.85 && (top.similarity - scored[1].similarity) < 0.05) {
      return {
        bom_item: item,
        status: 'ambiguous',
        candidates: scored.slice(0, 3).filter(c => c.similarity >= 0.8),
        similarity: top.similarity
      };
    }
    return {
      bom_item: item,
      status: 'matched',
      component_id: top.component.id,
      matched_component: top.component,
      similarity: top.similarity
    };
  }

  // If 2 or more candidates have similarity >= 0.65 (or share a key token like 'arduino'), mark ambiguous
  const multiCandidates = scored.filter(s => s.similarity >= 0.65 || (s.tokenMatches >= 1 && itemTokens.some(t => t === 'arduino' || t === 'esp32' || t === 'motor' || t === 'sensor')));
  if (multiCandidates.length >= 2) {
    return {
      bom_item: item,
      status: 'ambiguous',
      candidates: multiCandidates.slice(0, 4),
      similarity: top ? top.similarity : 0
    };
  }

  // If 1 candidate has moderate similarity (0.75 - 0.84), let user choose (ambiguous)
  if (top && top.similarity >= 0.70) {
    return {
      bom_item: item,
      status: 'ambiguous',
      candidates: [top],
      similarity: top.similarity
    };
  }

  // Otherwise, new component
  return {
    bom_item: item,
    status: 'new',
    prepared_component: buildPreparedComponent(item),
    similarity: top ? top.similarity : 0
  };
}

/**
 * Match an entire BOM array against the component library.
 */
export function matchBomList(
  items: ProposedBomItem[],
  library: Component[]
): ComponentMatchResult[] {
  return items.map(item => matchBomItem(item, library));
}

/**
 * Prepares a proposed component object for insertion if the user approves.
 */
export function buildPreparedComponent(item: ProposedBomItem): PreparedComponent {
  let cat = 'Electronics';
  const nameLower = item.name.toLowerCase();
  if (nameLower.includes('sensor') || nameLower.includes('bme') || nameLower.includes('sonar') || nameLower.includes('imu')) {
    cat = 'Sensors';
  } else if (nameLower.includes('motor') || nameLower.includes('servo') || nameLower.includes('driver')) {
    cat = 'Actuators & Motors';
  } else if (nameLower.includes('esp') || nameLower.includes('arduino') || nameLower.includes('pico') || nameLower.includes('pi')) {
    cat = 'Microcontrollers';
  } else if (nameLower.includes('relay') || nameLower.includes('switch') || nameLower.includes('mosfet')) {
    cat = 'Switches & Relays';
  } else if (nameLower.includes('battery') || nameLower.includes('power') || nameLower.includes('buck') || nameLower.includes('boost')) {
    cat = 'Power';
  }

  return {
    name: item.name.trim(),
    store: 'Robu / Amazon',
    category: cat,
    unit_price_inr: 0,
    buy_url: item.buy_url?.trim() || '',
    notes: item.role ? `Role: ${item.role}` : (item.notes || '')
  };
}

/**
 * Deduplicated component insertion: executes a fresh lookup right before inserting
 * to guarantee no duplicate component is ever created.
 */
export async function getOrInsertComponent(
  db: any,
  comp: PreparedComponent
): Promise<{ id: number; inserted: boolean }> {
  const normName = normalizeComponentName(comp.name);

  // 1. Fresh pre-insert lookup: exact name or normalized name
  const existing = await db.prepare('SELECT id, name FROM components').all();
  const rows = existing?.results ?? [];
  const found = rows.find((r: any) =>
    r.name.trim().toLowerCase() === comp.name.trim().toLowerCase() ||
    normalizeComponentName(r.name) === normName
  );
  if (found) {
    return { id: found.id, inserted: false };
  }

  // 2. Safe insert
  const t = Math.floor(Date.now() / 1000);
  const res = await db.prepare(
    'INSERT INTO components (name, store, buy_url, is_affiliate, unit_price_inr, price_checked, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    comp.name.trim(),
    comp.store || 'Robu / Amazon',
    comp.buy_url || '',
    comp.buy_url ? 1 : 0,
    comp.unit_price_inr || 0,
    new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    comp.notes || '',
    t,
    t
  ).run();

  return { id: res.meta.last_row_id as number, inserted: true };
}
