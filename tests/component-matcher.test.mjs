import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeComponentName,
  trigramSimilarity,
  matchBomItem,
  matchBomList,
  buildPreparedComponent
} from '../src/lib/component-matcher.ts';

// Sample component library mock matching the site DB
const mockLibrary = [
  {
    id: 1,
    name: 'ESP32 DevKit v1',
    store: 'Robu',
    buy_url: 'https://robu.in/esp32',
    is_affiliate: 1,
    unit_price_inr: 499,
    price_checked: 'Oct 2026',
    notes: '30-pin version',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 2,
    name: 'Arduino Uno R3',
    store: 'Robu',
    buy_url: 'https://robu.in/arduino-uno-r3',
    is_affiliate: 1,
    unit_price_inr: 550,
    price_checked: 'Oct 2026',
    notes: 'Standard microcontroller board',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 3,
    name: 'BME280 Sensor Module',
    store: 'Robu',
    buy_url: 'https://robu.in/bme280',
    is_affiliate: 1,
    unit_price_inr: 280,
    price_checked: 'Oct 2026',
    notes: 'Temp, humidity & pressure I2C',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 4,
    name: 'L298N Motor Driver Module',
    store: 'Robu',
    buy_url: 'https://robu.in/l298n',
    is_affiliate: 1,
    unit_price_inr: 140,
    price_checked: 'Oct 2026',
    notes: 'Dual DC motor controller',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 5,
    name: '5V 1-Channel Relay Module',
    store: 'Robu',
    buy_url: 'https://robu.in/5v-relay',
    is_affiliate: 1,
    unit_price_inr: 65,
    price_checked: 'Oct 2026',
    notes: 'Optocoupler isolated',
    created_at: 1728000000,
    updated_at: 1728000000
  },
  {
    id: 6,
    name: 'Arduino Nano V3',
    store: 'Amazon',
    buy_url: 'https://amazon.in/nano',
    is_affiliate: 1,
    unit_price_inr: 320,
    price_checked: 'Oct 2026',
    notes: 'CH340 driver',
    created_at: 1728000000,
    updated_at: 1728000000
  }
];

test('Component Matcher: normalizes names correctly', () => {
  assert.equal(normalizeComponentName('ESP32 DevKit v1 (30 pin)'), 'esp32 devkit v1');
  assert.equal(normalizeComponentName('BME280 Sensor Module [I2C]'), 'bme280 i2c');
  assert.equal(normalizeComponentName('5V 1-Channel Relay Board!'), '5v 1 channel relay');
});

test('Component Matcher: trigram similarity calculates Dice coefficient', () => {
  const simExact = trigramSimilarity('bme280', 'bme280');
  assert.equal(simExact, 1.0);

  const simHigh = trigramSimilarity('bme280 sensor', 'bme280 module');
  assert.ok(simHigh >= 0.4);

  const simZero = trigramSimilarity('relay', 'resistor');
  assert.ok(simZero < 0.3);
});

test('Component Matcher: exact match returns matched status', () => {
  const result = matchBomItem(
    { name: 'Arduino Uno R3', qty: 1, approx_price_inr: 550 },
    mockLibrary
  );
  assert.equal(result.status, 'matched');
  assert.equal(result.component_id, 2);
  assert.equal(result.matched_component?.name, 'Arduino Uno R3');
  assert.equal(result.similarity, 1.0);
});

test('Component Matcher: alias match finds ESP32 and Relay', () => {
  // ESP32 alias test
  const espResult = matchBomItem(
    { name: 'ESP32-WROOM-32 Development Board', qty: 1, approx_price_inr: 499 },
    mockLibrary
  );
  assert.equal(espResult.status, 'matched');
  assert.equal(espResult.component_id, 1);
  assert.equal(espResult.matched_component?.name, 'ESP32 DevKit v1');

  // Relay alias test
  const relayResult = matchBomItem(
    { name: '1-Channel Relay Module (5V)', qty: 1, approx_price_inr: 70 },
    mockLibrary
  );
  assert.equal(relayResult.status, 'matched');
  assert.equal(relayResult.component_id, 5);
  assert.equal(relayResult.matched_component?.name, '5V 1-Channel Relay Module');
});

test('Component Matcher: fuzzy match with high similarity auto-selects', () => {
  const result = matchBomItem(
    { name: 'BME280 Pressure/Temp Module', qty: 1, approx_price_inr: 280 },
    mockLibrary
  );
  assert.ok(result.status === 'matched' || result.status === 'ambiguous');
  if (result.status === 'matched') {
    assert.equal(result.component_id, 3);
  } else {
    assert.ok(result.candidates?.some(c => c.component.id === 3));
  }
});

test('Component Matcher: ambiguous candidates when multiple boards match generic query', () => {
  const result = matchBomItem(
    { name: 'Arduino Board ATmega', qty: 1 },
    mockLibrary
  );
  assert.equal(result.status, 'ambiguous');
  assert.ok((result.candidates?.length ?? 0) >= 2);
  const ids = result.candidates?.map(c => c.component.id);
  assert.ok(ids?.includes(2) && ids?.includes(6)); // Uno and Nano
});

test('Component Matcher: unknown part returns new with prepared component', () => {
  const unknownPart = {
    name: 'VL53L1X ToF Laser Distance Sensor',
    qty: 1,
    role: 'Obstacle distance detection',
    approx_price_inr: 420,
    buy_url: 'https://robu.in/vl53l1x'
  };
  const result = matchBomItem(unknownPart, mockLibrary);

  assert.equal(result.status, 'new');
  assert.equal(result.component_id, undefined);
  assert.ok(result.prepared_component);
  assert.equal(result.prepared_component.name, 'VL53L1X ToF Laser Distance Sensor');
  assert.equal(result.prepared_component.category, 'Sensors');
  assert.equal(result.prepared_component.unit_price_inr, 420);
  assert.equal(result.prepared_component.buy_url, 'https://robu.in/vl53l1x');
  assert.equal(result.prepared_component.notes, 'Role: Obstacle distance detection');
});

test('Component Matcher: batch matching on ESP32 + Blynk Relay BOM', () => {
  const bom = [
    { name: 'ESP32 DevKit', qty: 1, role: 'Microcontroller & WiFi', approx_price_inr: 499 },
    { name: '5V Relay Module', qty: 1, role: 'Mains switching', approx_price_inr: 65 },
    { name: 'Custom 3D Enclosure Clip', qty: 2, role: 'Mounting bracket', approx_price_inr: 50 }
  ];

  const results = matchBomList(bom, mockLibrary);
  assert.equal(results.length, 3);

  // 1. ESP32 -> Matched
  assert.equal(results[0].status, 'matched');
  assert.equal(results[0].component_id, 1);

  // 2. Relay -> Matched
  assert.equal(results[1].status, 'matched');
  assert.equal(results[1].component_id, 5);

  // 3. Custom clip -> New
  assert.equal(results[2].status, 'new');
  assert.ok(results[2].prepared_component);
});

test('Component Matcher: deduplication prevents inserting existing component', async () => {
  const { getOrInsertComponent } = await import('../src/lib/component-matcher.ts');

  const componentsTable = [
    { id: 10, name: 'ESP32 DevKit V1' }
  ];

  const mockDb = {
    prepare: (sql) => ({
      all: async () => ({ results: [...componentsTable] }),
      bind: (...args) => ({
        run: async () => {
          const newId = componentsTable.length + 10;
          componentsTable.push({ id: newId, name: args[0] });
          return { meta: { last_row_id: newId } };
        }
      })
    })
  };

  // 1. Trying to insert 'esp32 devkit v1' should return existing id 10 without inserting
  const dupResult = await getOrInsertComponent(mockDb, {
    name: 'esp32 devkit v1 (30 pin)',
    store: 'Robu',
    category: 'Microcontrollers',
    unit_price_inr: 499,
    buy_url: '',
    notes: ''
  });
  assert.equal(dupResult.id, 10);
  assert.equal(dupResult.inserted, false);
  assert.equal(componentsTable.length, 1);

  // 2. Truly new component gets inserted
  const newResult = await getOrInsertComponent(mockDb, {
    name: 'SSD1306 0.96 OLED Display',
    store: 'Robu',
    category: 'Displays',
    unit_price_inr: 180,
    buy_url: '',
    notes: 'I2C 128x64'
  });
  assert.equal(newResult.inserted, true);
  assert.equal(componentsTable.length, 2);

  // 3. Re-inserting the same OLED should now be deduplicated
  const dupOled = await getOrInsertComponent(mockDb, {
    name: 'ssd1306 0.96 oled display',
    store: 'Robu',
    category: 'Displays',
    unit_price_inr: 180,
    buy_url: '',
    notes: ''
  });
  assert.equal(dupOled.id, newResult.id);
  assert.equal(dupOled.inserted, false);
  assert.equal(componentsTable.length, 2);
});

