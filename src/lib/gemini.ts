import type { D1Database } from '@cloudflare/workers-types';
import { getSetting } from './db';
import { validateOrRepairDraftOutput, type AIDraftOutput } from './ai-schema';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

// In-memory rate limiting map (IP or session -> array of millisecond timestamps)
const rateLimitMap = new Map<string, number[]>();

export function checkAiRateLimit(key: string, limit = 5, windowMs = 60000): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return { allowed: true };
}

export async function getGeminiApiKey(env: any, db?: D1Database): Promise<string | null> {
  if (env?.GEMINI_API_KEY && typeof env.GEMINI_API_KEY === 'string' && env.GEMINI_API_KEY.trim()) {
    return env.GEMINI_API_KEY.trim();
  }
  if (db) {
    try {
      const stored = await getSetting(db, 'gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }
  return null;
}

export async function getGeminiModel(env: any, db?: D1Database): Promise<string> {
  if (db) {
    try {
      const stored = await getSetting(db, 'gemini_model');
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }
  if (env?.GEMINI_MODEL && typeof env.GEMINI_MODEL === 'string' && env.GEMINI_MODEL.trim()) {
    return env.GEMINI_MODEL.trim();
  }
  return DEFAULT_GEMINI_MODEL;
}

/**
 * Execute Gemini call with 35s timeout and automatic fallback across candidate models.
 */
export async function callGemini(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  modelName = DEFAULT_GEMINI_MODEL
): Promise<any> {
  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  // Model fallback candidate list in priority order
  const candidateModels = Array.from(new Set([
    modelName,
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash'
  ].filter(Boolean)));

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(currentModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No content returned from Gemini.');

      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Failed to parse Gemini structured JSON output.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Gemini API call to ${currentModel} timed out after 35 seconds.`);
      }
      // If there are more models to try, continue to the next model in the fallback chain
      if (i < candidateModels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API.');
}

export interface ComprehensiveDraftInput {
  notes: string;
  code_snippet?: string;
  bom_pasted?: string;
  wiring_notes?: string;
  project_context?: {
    title?: string;
    summary?: string;
    category?: string;
    difficulty?: string;
    description?: string;
  };
}

/**
 * Fills every editable field of a project and builds BOM, steps, wiring, troubleshooting, etc.
 */
export async function generateComprehensiveDraft(
  apiKey: string,
  modelName: string,
  input: ComprehensiveDraftInput
): Promise<AIDraftOutput> {
  // Enforce size limits (max 50,000 chars across all input parts)
  const totalLength =
    (input.notes || '').length +
    (input.code_snippet || '').length +
    (input.bom_pasted || '').length +
    (input.wiring_notes || '').length;

  if (totalLength > 50000) {
    throw new Error('Input payload too large. Please limit notes and code to under 50,000 characters total.');
  }

  const systemPrompt = `You are a world-class electronics, embedded systems, and robotics engineer for Technical Triveni (a maker store and open-source electronics hub in India).
You receive rough project notes, source code (.ino, .cpp, .py), pasted BOM, and wiring notes, and you generate a COMPLETE, production-ready project documentation pack.

RULES FOR THE MODEL:
1. Ground EVERYTHING strictly in the provided notes and code.
2. NEVER invent pin numbers, voltages, part numbers, or prices out of thin air. When something is inferred, assumed, or needs human verification, add an entry to "needs_review" [{field, reason}].
3. Steps follow logical build order: 3-5 concise, focused steps:
   - 1: Prerequisites / Install toolchains and libraries
   - 2: Configure credentials / code settings
   - 3: Wire low-voltage side (microcontroller & sensor/display/relay control pins)
   - 4: Flash firmware and verify serial / test communications
   - 5: High-voltage / mains or mechanical assembly side (if any), with strict safety checks
   Each step is one concrete action a beginner can follow with "title", "instruction_markdown" (1-2 sentences), and "why_or_gotcha".
4. Wiring entries: 3-6 essential rows using the EXACT pin names found in the code or board pinout (e.g. "GPIO 23", "D4", "SDA (GPIO 21)", "VIN", "GND"). Always tag each connection with its specific "module" or board (e.g. "ESP32", "NodeMCU ESP8266", "Relay Module") so multi-board or multi-code setups stay completely distinct.
5. Troubleshooting entries: 2-3 real hardware/firmware failure modes of this build with actionable root-cause fixes ("symptom" and "fix_markdown").
6. Prices must be realistic estimates in Indian Rupees (₹), matching typical maker prices in India (Robu.in / Amazon.in).
7. Safety note is MANDATORY whenever mains voltage (230V AC), LiPo batteries, high-torque motors, propellers, or heat elements are involved; otherwise leave safety_note_markdown as empty string.
8. Tone: Clear, practical, authoritative, maker-friendly.
9. Keep descriptions concise, punchy, and avoid unnecessary filler. Return JSON ONLY matching the required schema.`;

  const contextStr = input.project_context
    ? `\nCURRENT PROJECT DRAFT CONTEXT:
Title: ${input.project_context.title || 'Untitled'}
Category: ${input.project_context.category || 'Unset'}
Summary: ${input.project_context.summary || 'Unset'}
Description: ${(input.project_context.description || '').slice(0, 1500)}`
    : '';

  const userPrompt = `Create a complete project documentation draft based on the following input:

--- ROUGH NOTES ---
${input.notes || 'None provided'}

--- SOURCE CODE / SKETCH ---
${input.code_snippet ? input.code_snippet.slice(0, 25000) : 'None provided'}

--- PASTED BOM / HARDWARE LIST ---
${input.bom_pasted || 'None provided'}

--- WIRING NOTES ---
${input.wiring_notes || 'None provided'}
${contextStr}

STRICT OUTPUT JSON SCHEMA:
{
  "title": string,
  "slug": string (lowercase, hyphenated),
  "summary": string (max 160 characters hook),
  "category": string (e.g. IoT & Wireless, Home Automation, Robotics, Drones, Embedded Systems, Audio),
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "build_time": string (e.g. "2-3 hours"),
  "tags": string[] (3-6 tags e.g. ["ESP32", "Blynk", "IoT", "Relay"]),
  "description_markdown": string (comprehensive overview with markdown headers),
  "outcomes": string[] (3-5 specific skills learned),
  "prerequisites": string[] (2-4 tools or basic skills needed),
  "not_included": string[] (1-3 items builder supplies themselves),
  "faq": [{ "q": string, "a": string }],
  "safety_note_markdown": string (only if mains AC, batteries, motors, heat involved; else ""),
  "credits_markdown": string,
  "seo": {
    "meta_title": string (max 60 characters),
    "meta_description": string (max 160 characters)
  },
  "steps": [
    {
      "title": string,
      "instruction_markdown": string,
      "why_or_gotcha": string
    }
  ],
  "wiring": [
    {
      "module": string (e.g. "ESP32", "NodeMCU ESP8266", "Relay Module"),
      "from": string (e.g. "ESP32 GPIO 23"),
      "to": string (e.g. "Relay Module IN1"),
      "note": string
    }
  ],
  "troubleshooting": [
    {
      "symptom": string,
      "fix_markdown": string
    }
  ],
  "resource_links": [
    {
      "label": string,
      "url": string,
      "type": "github" | "doc" | "video" | "demo" | "other"
    }
  ],
  "bom": [
    {
      "name": string,
      "qty": string or number,
      "role": string,
      "approx_price_inr": number,
      "buy_url": string (optional)
    }
  ],
  "needs_review": [
    {
      "field": string,
      "reason": string
    }
  ]
}`;

  const raw = await callGemini(apiKey, userPrompt, systemPrompt, modelName);
  return validateOrRepairDraftOutput(raw);
}

// Retain legacy export for backwards compatibility
export async function generateDraftFromNotes(apiKey: string, notes: string): Promise<any> {
  const result = await generateComprehensiveDraft(apiKey, DEFAULT_GEMINI_MODEL, { notes });
  return {
    title: result.title,
    summary: result.summary,
    category: result.category,
    difficulty: result.difficulty.toLowerCase(),
    build_time: result.build_time,
    description: result.description_markdown,
    outcomes: result.outcomes,
    prerequisites: result.prerequisites,
    troubleshooting: result.troubleshooting.map(t => ({
      symptom: t.symptom,
      cause: '',
      fix: t.fix_markdown
    }))
  };
}

export async function generateTabSuggestions(apiKey: string, tab: string, projectContext: {
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  notes?: string;
}): Promise<any> {
  const contextDesc = `Project Title: ${projectContext.title || 'Untitled'}
Category: ${projectContext.category || 'Electronics'}
Summary: ${projectContext.summary || ''}
Description: ${(projectContext.description || '').slice(0, 2000)}
${projectContext.notes ? `Additional Notes: ${projectContext.notes}` : ''}`;

  if (tab === 'parts') {
    const prompt = `Based on the following project context, suggest the essential Bill of Materials (4-8 components) required to build it.
Strictly return a JSON object with an array named "parts":
{
  "parts": [
    {
      "name": "Component name with part number (e.g. ESP32-WROOM-32D Development Board)",
      "qty": "1",
      "store": "Robu or Amazon",
      "unit_price_inr": 350,
      "notes": "Ensure 38-pin version for breadboard compatibility"
    }
  ]
}

${contextDesc}`;
    return await callGemini(apiKey, prompt);
  }

  if (tab === 'wiring') {
    const prompt = `Based on the following project context, suggest the pin-to-pin wiring connections.
Strictly return a JSON object with an array named "wiring":
{
  "wiring": [
    {
      "from_pin": "ESP32 GPIO 21",
      "to_pin": "OLED Display SDA",
      "module": "I2C Display",
      "note": "4.7k pull-up resistor if long leads"
    }
  ]
}

${contextDesc}`;
    return await callGemini(apiKey, prompt);
  }

  if (tab === 'troubleshooting') {
    const prompt = `Based on the following project context, suggest 3-5 real-world hardware or firmware troubleshooting scenarios.
Strictly return a JSON object with an array named "troubleshooting":
{
  "troubleshooting": [
    {
      "symptom": "Observed symptom or error string (e.g. Brownout detector was triggered)",
      "cause": "Specific technical root cause (e.g. Inrush current on WiFi handshake sags 3.3V rail)",
      "fix": "Actionable engineering fix (e.g. Add 220uF capacitor across VCC and GND)"
    }
  ]
}

${contextDesc}`;
    return await callGemini(apiKey, prompt);
  }

  if (tab === 'seo') {
    const prompt = `Based on the following project context, craft high-CTR SEO meta tags.
Strictly return a JSON object:
{
  "meta_title": "Under 60 chars title optimized for Google search and makers",
  "meta_description": "Under 160 chars summary highlighting schematics, code, BOM and guide"
}

${contextDesc}`;
    return await callGemini(apiKey, prompt);
  }

  throw new Error(`Unsupported tab for AI suggestions: ${tab}`);
}
