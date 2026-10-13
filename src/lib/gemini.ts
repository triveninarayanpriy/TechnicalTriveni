import type { D1Database } from '@cloudflare/workers-types';
import { getSetting } from './db';

const GEMINI_MODEL = 'gemini-2.5-flash';

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

export interface ProjectNotesDraft {
  title?: string;
  summary?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  build_time?: string;
  description?: string;
  outcomes?: string[];
  prerequisites?: string[];
  troubleshooting?: Array<{
    symptom: string;
    cause: string;
    fix: string;
  }>;
}

export async function callGemini(apiKey: string, prompt: string, systemInstruction?: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

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
}

export async function generateDraftFromNotes(apiKey: string, notes: string): Promise<ProjectNotesDraft> {
  const systemPrompt = `You are an expert electronics and robotics engineer helping technical creators document maker projects.
Analyze the user's raw notes, code, bill of materials, or transcript, and synthesize a polished, structured draft for a project page.
Strictly output a JSON object with:
- "title": Short, descriptive project title (e.g. "ESP32 LoRa Field Telemetry Gateway")
- "summary": 1-2 sentence compelling hook summarizing what this device is and what problem it solves.
- "category": Project category (e.g. "IoT & Wireless", "Robotics", "Drones", "Automation", "Audio & DSP", "Home Lab")
- "difficulty": "beginner", "intermediate", or "advanced"
- "build_time": Estimated build time (e.g. "3-4 hours")
- "description": Comprehensive overview formatted in clean GitHub-Flavored Markdown explaining how the circuit/firmware works, key hardware architectures, and operating principles.
- "outcomes": Array of 3 to 5 clear learning outcomes (e.g. ["Configure ESP32 SX1278 SPI bus", "Implement low-power deep sleep cycles"]).
- "prerequisites": Array of 2 to 4 prerequisite skills or equipment (e.g. ["Basic soldering iron and lead-free solder", "Arduino IDE or PlatformIO installed"]).
- "troubleshooting": Array of objects { "symptom": string, "cause": string, "fix": string } capturing any error messages, terminal logs, or typical hardware pitfalls found or inferred from the notes.`;

  return await callGemini(apiKey, notes, systemPrompt);
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
