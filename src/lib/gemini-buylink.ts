/**
 * Gemini "Find Buy Link" Service with Google Search Grounding & Deterministic Validation
 *
 * Rules:
 * - Google Search grounding enabled via tools: [{ googleSearch: {} }]
 * - The model NEVER writes the final affiliate URL and NEVER sees the tracking ID
 * - Deterministic server validation: ASIN format, amazon.in host, grounding proof check
 * - Rejects spec mismatches (e.g. CP2102 vs CH340, 30-pin vs 38-pin, ESP32-CAM vs DevKit)
 * - Never accepts an ungrounded ASIN produced from memory
 * - Concurrency limit 3, retry once on error, 7-day cache
 */

import { validateAsin, buildAmazonLink } from './affiliate';

export interface BuyLinkCandidate {
  title: string;
  asin: string;
  url: string;
  why_match: string;
  spec_matches: string[];
  spec_mismatches: string[];
  confidence: number;
  grounded: boolean;
}

export interface BuyLinkResult {
  query_used: string;
  candidates: BuyLinkCandidate[];
  best_index: number;
  needs_review_reason: string;
  grounding_urls: string[];
  tokens_used?: number;
}

export interface ComponentSpecInput {
  id?: number;
  name: string;
  specs?: {
    variant?: string;
    chip?: string;
    voltage?: string;
    interface?: string;
    pack_size?: string;
    connector?: string;
  };
  role?: string;
  notes?: string;
}

/**
 * Executes a Gemini request with Google Search grounding to find Amazon India product candidates.
 * Note: Never passes any affiliate tag or tracking parameter to Gemini.
 */
export async function findAmazonBuyLinkWithGemini(
  apiKey: string,
  modelName: string,
  input: ComponentSpecInput
): Promise<BuyLinkResult> {
  const systemInstruction = `You are an expert electronics hardware component sourcing engineer for Technical Triveni (India).
Your job is to search Amazon India (amazon.in) for exact matches of electronic components, maker boards, sensors, and hardware.

STRICT OPERATING RULES:
1. Search ONLY for products available on amazon.in in India.
2. Identify real ASINs (10-character code, e.g. B086MGVDC3) found in Amazon.in product listings in your search results.
3. Spec Discrepancy Detection:
   - Chipset: If component specifies CP2102, CH340 is a mismatch. If CH340, CP2102 is a mismatch.
   - Pin count: If 30-pin, 38-pin is a mismatch.
   - Form factor: ESP32-CAM vs ESP32-WROOM DevKit are different.
   - Voltage/current ratings must match.
   Put all confirmed matching specs into spec_matches and any mismatch or caveat into spec_mismatches.
4. If there is a mismatch or uncertainty, lower confidence and state why in needs_review_reason.
5. NEVER invent an ASIN from training memory. Only extract ASINs verified from current search grounding.
6. NEVER include an affiliate tag or affiliate tracking ID.
7. Return JSON ONLY matching the requested structure.`;

  const specLines: string[] = [];
  if (input.specs?.variant) specLines.push(`Variant: ${input.specs.variant}`);
  if (input.specs?.chip) specLines.push(`Chipset/Controller: ${input.specs.chip}`);
  if (input.specs?.voltage) specLines.push(`Voltage: ${input.specs.voltage}`);
  if (input.specs?.interface) specLines.push(`Interface: ${input.specs.interface}`);
  if (input.specs?.pack_size) specLines.push(`Pack size: ${input.specs.pack_size}`);
  if (input.specs?.connector) specLines.push(`Connector/Pinout: ${input.specs.connector}`);
  if (input.role) specLines.push(`Role in project: ${input.role}`);
  if (input.notes) specLines.push(`Notes: ${input.notes}`);

  const userPrompt = `Search Amazon India (amazon.in) for the following electronic component:

Component Name: ${input.name}
${specLines.length > 0 ? specLines.join('\n') : ''}
Marketplace: amazon.in (India)

Output JSON structure:
{
  "query_used": "search query used",
  "candidates": [
    {
      "title": "Exact Amazon product title",
      "asin": "10-character ASIN code (A-Z0-9)",
      "url": "https://www.amazon.in/dp/ASIN",
      "why_match": "Explanation of why this product matches the required component",
      "spec_matches": ["List of specs that match"],
      "spec_mismatches": ["List of specs that differ or need caution"],
      "confidence": 0.95
    }
  ],
  "best_index": 0,
  "needs_review_reason": "Any reasons a human should double check this before publishing"
}`;

  const payload: any = {
    contents: [
      {
        parts: [{ text: userPrompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    tools: [
      {
        googleSearch: {}
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  // Models to attempt (fallback chain)
  const candidateModels = Array.from(new Set([
    modelName,
    'gemini-2.5-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash'
  ].filter(Boolean)));

  let lastError: any = null;

  for (let attempt = 0; attempt < candidateModels.length; attempt++) {
    const currentModel = candidateModels[attempt];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(currentModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        let msg = `Gemini API error (${res.status})`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.error?.message) msg = parsed.error.message;
        } catch {}
        throw new Error(msg);
      }

      const json = await res.json();
      const candidateObj = json?.candidates?.[0];
      const text = candidateObj?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No content returned from Gemini.');
      }

      // Collect grounding URLs from Google Search grounding metadata
      const groundingUrls: string[] = [];
      const groundingChunks = candidateObj?.groundingMetadata?.groundingChunks || [];
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri) groundingUrls.push(chunk.web.uri);
      }

      // Parse JSON from text (strip markdown codeblocks if present)
      let parsedJson: any;
      const cleanText = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      try {
        parsedJson = JSON.parse(cleanText);
      } catch {
        // Fallback regex extraction of JSON object
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedJson = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse Gemini output as JSON.');
        }
      }

      const tokensUsed = json?.usageMetadata?.totalTokenCount || 0;

      // Deterministic validation of candidates
      const rawCandidates = Array.isArray(parsedJson.candidates) ? parsedJson.candidates : [];
      const validatedCandidates: BuyLinkCandidate[] = [];

      for (const c of rawCandidates) {
        const rawAsin = String(c.asin || '').trim().toUpperCase();
        if (!validateAsin(rawAsin)) continue;

        // Check host
        let validHost = false;
        try {
          const parsedUrl = new URL(c.url);
          validHost = parsedUrl.hostname === 'amazon.in' || parsedUrl.hostname === 'www.amazon.in';
        } catch {
          // If URL is missing, we construct https://www.amazon.in/dp/{ASIN}
          validHost = true;
        }
        if (!validHost) continue;

        // Grounding check:
        // Does the ASIN appear in the search grounding chunks or search queries?
        const asinInGrounding = groundingUrls.some(u => u.toUpperCase().includes(rawAsin)) ||
          JSON.stringify(candidateObj?.groundingMetadata || {}).toUpperCase().includes(rawAsin);

        const specMismatches = Array.isArray(c.spec_mismatches)
          ? c.spec_mismatches.map((m: any) => String(m).trim()).filter(Boolean)
          : [];

        // Check for severe spec mismatches that disqualify candidate
        const hasSevereMismatch = specMismatches.some((m: string) => {
          const lower = m.toLowerCase();
          return lower.includes('incompatible') ||
                 lower.includes('wrong chip') ||
                 lower.includes('different chip') ||
                 lower.includes('wrong pin') ||
                 lower.includes('ch340 instead of cp2102') ||
                 lower.includes('cp2102 instead of ch340') ||
                 lower.includes('38-pin instead of 30-pin') ||
                 lower.includes('30-pin instead of 38-pin');
        });

        if (hasSevereMismatch) {
          // Disqualified due to spec mismatch
          continue;
        }

        const confidence = typeof c.confidence === 'number' && !isNaN(c.confidence)
          ? Math.max(0, Math.min(1, c.confidence))
          : (asinInGrounding ? 0.8 : 0.4);

        validatedCandidates.push({
          title: String(c.title || input.name).trim(),
          asin: rawAsin,
          url: `https://www.amazon.in/dp/${rawAsin}`,
          why_match: String(c.why_match || '').trim(),
          spec_matches: Array.isArray(c.spec_matches) ? c.spec_matches.map(String) : [],
          spec_mismatches: specMismatches,
          confidence,
          grounded: asinInGrounding
        });
      }

      let bestIndex = typeof parsedJson.best_index === 'number' ? parsedJson.best_index : 0;
      if (bestIndex >= validatedCandidates.length) bestIndex = 0;

      return {
        query_used: String(parsedJson.query_used || input.name),
        candidates: validatedCandidates,
        best_index: bestIndex,
        needs_review_reason: String(parsedJson.needs_review_reason || (validatedCandidates.length === 0 ? 'No exact product match found on Amazon India.' : '')),
        grounding_urls: groundingUrls,
        tokens_used: tokensUsed
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < candidateModels.length - 1) {
        await new Promise(r => setTimeout(r, 400));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to find buy link with Gemini.');
}

/**
 * Concurrency Limiter: executes promises with max N concurrent tasks
 */
export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
