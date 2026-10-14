import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrRepairDraftOutput } from '../src/lib/ai-schema.ts';
import { matchBomList } from '../src/lib/component-matcher.ts';

// Mocked Gemini model response from realistic ESP32 + Blynk relay input
const mockGeminiResponse = {
  title: 'ESP32 Smart Home IoT Relay with Blynk 2.0',
  slug: 'esp32-blynk-iot-relay',
  summary: 'Control AC home appliances over WiFi with ESP32 and Blynk IoT cloud with instant manual switch feedback and offline sync.',
  category: 'Home Automation',
  difficulty: 'Beginner',
  build_time: '2–3 hours',
  tags: ['ESP32', 'Blynk', 'IoT', 'Home Automation', 'Relay'],
  description_markdown: '## Overview\nThis project demonstrates how to build an Internet-of-Things (IoT) smart relay controller using an **ESP32 DevKit** board and a 5V optocoupled relay module, synchronized in real time with the **Blynk IoT platform**.',
  outcomes: [
    'Configure ESP32 WiFi and Blynk template credentials',
    'Safely wire an isolated 5V relay module to AC loads',
    'Implement non-blocking timers with BlynkTimer'
  ],
  prerequisites: [
    'Basic soldering and wire stripping',
    'Arduino IDE with ESP32 board definitions installed'
  ],
  not_included: [
    'AC appliance extension board',
    'High-voltage safety enclosure'
  ],
  faq: [
    {
      q: 'Can this work if the internet goes down?',
      a: 'Yes, physical manual switch inputs toggle relays even without WiFi.'
    }
  ],
  safety_note_markdown: '⚠️ **Mains Voltage Warning**: This project switches 230V AC mains electricity. Always unplug power before touching wiring.',
  credits_markdown: 'Designed & developed by Technical Triveni. Firmware powered by the open-source Blynk library.',
  seo: {
    meta_title: 'ESP32 IoT Relay with Blynk: Complete DIY Build Guide',
    meta_description: 'Build a WiFi smart home relay controller with ESP32 and Blynk IoT. Includes schematics, source code, BOM, and setup steps.'
  },
  steps: [
    {
      title: 'Setup Arduino IDE and Blynk Library',
      instruction_markdown: 'Install the Blynk library via Library Manager and select ESP32 Dev Module.',
      why_or_gotcha: 'Always choose the matching ESP32 board package version to avoid compiler link errors.'
    },
    {
      title: 'Wire the Low-Voltage 5V Relay Control Side',
      instruction_markdown: 'Connect GPIO 23 to IN1 on the relay module, VCC to 5V (VIN), and GND to GND.',
      why_or_gotcha: 'Do not power the 5V relay coil directly from the 3.3V pin—it will cause brownouts.'
    },
    {
      title: 'Flash Firmware and Verify Online Status',
      instruction_markdown: 'Paste your BLYNK_TEMPLATE_ID and Auth Token, select the COM port, and click Upload.',
      why_or_gotcha: 'Hold the BOOT button on the ESP32 if the serial bootloader fails to connect.'
    }
  ],
  wiring: [
    { from: 'ESP32 GPIO 23', to: 'Relay IN1', note: 'Control signal pin' },
    { from: 'ESP32 VIN (5V)', to: 'Relay VCC', note: 'Coil power' },
    { from: 'ESP32 GND', to: 'Relay GND', note: 'Common ground' }
  ],
  troubleshooting: [
    {
      symptom: 'ESP32 keeps restarting in a brownout boot loop',
      fix_markdown: 'Ensure adequate 5V power supply (at least 1A). Add a 470uF capacitor across VIN and GND.'
    },
    {
      symptom: 'Blynk app displays Device Offline',
      fix_markdown: 'Verify your 2.4GHz WiFi SSID and password in credentials.h; ESP32 does not support 5GHz networks.'
    }
  ],
  resource_links: [
    { label: 'GitHub Repository', url: 'https://github.com/technicaltriveni/esp32-blynk-relay', type: 'github' }
  ],
  bom: [
    { name: 'ESP32 DevKit v1', qty: 1, role: 'Microcontroller & WiFi gateway', approx_price_inr: 499 },
    { name: '5V 1-Channel Relay Module', qty: 1, role: 'Mains switching', approx_price_inr: 65 },
    { name: 'Custom Acrylic Din-Rail Case', qty: 1, role: 'Enclosure mounting', approx_price_inr: 220 }
  ],
  needs_review: [
    { field: 'wiring', reason: 'AC neutral load wiring omitted for safety; builder must ensure neutral return is connected to appliance directly.' }
  ]
};

const mockLibrary = [
  {
    id: 1,
    name: 'ESP32 DevKit v1',
    store: 'Robu',
    buy_url: 'https://robu.in/esp32',
    is_affiliate: 1,
    unit_price_inr: 499,
    price_checked: 'Oct 2026',
    notes: '',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 5,
    name: '5V 1-Channel Relay Module',
    store: 'Robu',
    buy_url: 'https://robu.in/relay-5v',
    is_affiliate: 1,
    unit_price_inr: 65,
    price_checked: 'Oct 2026',
    notes: '',
    created_at: 1728000000,
    updated_at: 1728000000
  }
];

test('AI Pipeline Fixture: parses and repairs raw model output into validated schema', () => {
  const validated = validateOrRepairDraftOutput(mockGeminiResponse);

  assert.equal(validated.title, 'ESP32 Smart Home IoT Relay with Blynk 2.0');
  assert.equal(validated.slug, 'esp32-blynk-iot-relay');
  assert.ok(validated.summary.length <= 160);
  assert.equal(validated.category, 'Home Automation');
  assert.equal(validated.difficulty, 'Beginner');
  assert.equal(validated.tags.length, 5);
  assert.ok(validated.seo.meta_title.length <= 60);
  assert.ok(validated.seo.meta_description.length <= 160);
  assert.equal(validated.steps.length, 3);
  assert.equal(validated.wiring.length, 3);
  assert.equal(validated.troubleshooting.length, 2);
  assert.equal(validated.needs_review.length, 1);
  assert.equal(validated.needs_review[0].field, 'wiring');
});

test('AI Pipeline Fixture: matches parts against component library with expected statuses', () => {
  const validated = validateOrRepairDraftOutput(mockGeminiResponse);
  const matchedBom = matchBomList(validated.bom, mockLibrary);

  assert.equal(matchedBom.length, 3);

  // 1. ESP32 DevKit -> Matched to existing component
  assert.equal(matchedBom[0].status, 'matched');
  assert.equal(matchedBom[0].component_id, 1);
  assert.equal(matchedBom[0].matched_component?.name, 'ESP32 DevKit v1');

  // 2. 5V Relay Module -> Matched to existing component
  assert.equal(matchedBom[1].status, 'matched');
  assert.equal(matchedBom[1].component_id, 5);
  assert.equal(matchedBom[1].matched_component?.name, '5V 1-Channel Relay Module');

  // 3. Custom Acrylic Din-Rail Case -> New component proposal
  assert.equal(matchedBom[2].status, 'new');
  assert.equal(matchedBom[2].component_id, undefined);
  assert.ok(matchedBom[2].prepared_component);
  assert.equal(matchedBom[2].prepared_component.name, 'Custom Acrylic Din-Rail Case');
  assert.equal(matchedBom[2].prepared_component.unit_price_inr, 220);
});

test('AI Pipeline Fixture: clamps long summaries and sanitizes script tags', () => {
  const maliciousRaw = {
    title: 'Hack Project <script>alert(1)</script>',
    summary: 'A'.repeat(250),
    seo: {
      meta_title: 'Title '.repeat(20),
      meta_description: 'Desc '.repeat(50)
    },
    resource_links: [
      { label: 'Evil Link', url: 'javascript:alert(1)' },
      { label: 'Good Link', url: 'https://example.com' }
    ]
  };

  const cleaned = validateOrRepairDraftOutput(maliciousRaw);

  assert.ok(!cleaned.title.includes('<script>'));
  assert.ok(cleaned.summary.length <= 160);
  assert.ok(cleaned.seo.meta_title.length <= 60);
  assert.ok(cleaned.seo.meta_description.length <= 160);
  assert.equal(cleaned.resource_links[0].url, ''); // javascript: was stripped
  assert.equal(cleaned.resource_links[1].url, 'https://example.com');
});
