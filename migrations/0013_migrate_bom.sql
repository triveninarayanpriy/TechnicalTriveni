INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'ESP32 DevKit V1', 'Robu.in', 450, 'https://robu.in/', 0, '', 'Any ESP32 dev board works', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'ESP32 DevKit V1');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'BME280 sensor (temp/humidity/pressure)', 'Amazon', 250, 'https://www.amazon.in/', 0, '', 'I²C module', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'BME280 sensor (temp/humidity/pressure)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'MQ-135 air-quality sensor', 'Amazon', 150, 'https://www.amazon.in/', 0, '', 'Optional but recommended', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'MQ-135 air-quality sensor');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Breadboard + jumper wires', 'Amazon', 200, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Breadboard + jumper wires');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Arduino Uno (or Nano)', 'Amazon', 500, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Arduino Uno (or Nano)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'L298N motor driver', 'Robu.in', 120, 'https://robu.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'L298N motor driver');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'IR line sensors', 'Amazon', 80, 'https://www.amazon.in/', 0, '', 'TCRT5000 modules', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'IR line sensors');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'TT gear motors + wheels', 'Amazon', 350, 'https://www.amazon.in/', 0, '', 'With chassis', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'TT gear motors + wheels');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Raspberry Pi 4 (2GB+)', 'Amazon', 4500, 'https://www.amazon.in/', 0, '', 'Or any Linux SBC', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Raspberry Pi 4 (2GB+)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'USB microphone', 'Amazon', 600, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'USB microphone');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Small speaker', 'Amazon', 400, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Small speaker');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'RC522 RFID reader + cards', 'Amazon', 180, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'RC522 RFID reader + cards');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Arduino Uno', 'Amazon', 500, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Arduino Uno');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '12V solenoid lock', 'Amazon', 550, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '12V solenoid lock');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Relay module + 12V supply', 'Amazon', 250, 'https://www.amazon.in/', 0, '', 'Handle mains/12V safely', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Relay module + 12V supply');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'ESP32 DevKit', 'Robu.in', 450, 'https://robu.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'ESP32 DevKit');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'WS2812B LED strip', 'Amazon', 250, 'https://www.amazon.in/', 0, '', 'Addressable RGB', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'WS2812B LED strip');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '5V power supply', 'Amazon', 200, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '5V power supply');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Arduino Nano', 'Amazon', 400, 'https://www.amazon.in/', 0, '', 'One per unit', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Arduino Nano');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'MPU6050 IMU', 'Amazon', 120, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'MPU6050 IMU');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'nRF24L01 module', 'Robu.in', 160, 'https://robu.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'nRF24L01 module');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'SCT-013 CT sensor', 'Amazon', 350, 'https://www.amazon.in/', 0, '', 'Clamp meter', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'SCT-013 CT sensor');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Burden resistor + caps', 'Amazon', 90, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Burden resistor + caps');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Raspberry Pi 4', 'Amazon', 4500, 'https://www.amazon.in/', 0, '', '2GB+', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Raspberry Pi 4');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Pi Camera Module', 'Amazon', 700, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Pi Camera Module');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Heatsink + fan', 'Amazon', 250, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Heatsink + fan');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'TM1637 4-digit display', 'Amazon', 130, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'TM1637 4-digit display');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'DS3231 RTC module', 'Amazon', 120, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'DS3231 RTC module');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'ESP8266 (NodeMCU)', 'Amazon', 250, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'ESP8266 (NodeMCU)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Soil moisture sensor', 'Amazon', 90, 'https://www.amazon.in/', 0, '', 'Capacitive preferred', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Soil moisture sensor');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Mini pump + relay', 'Amazon', 260, 'https://www.amazon.in/', 0, '', '', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Mini pump + relay');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '2-Axis Joystick Module', 'Amazon', 180, 'https://link.amazon/B01jEcaYm', 1, '', 'Analog thumb joystick', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '2-Axis Joystick Module');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '10K Potentiometer', 'Amazon', 140, 'https://link.amazon/B0gGbQayb', 1, '', 'Rotary, with knob', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '10K Potentiometer');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Mini Toggle Switch SPDT', 'Amazon', 130, 'https://link.amazon/B06HJUbQY', 1, '', 'ARM and MODE switches', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Mini Toggle Switch SPDT');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Rocker Switch', 'Amazon', 120, 'https://link.amazon/B02A8SIkr', 1, '', 'Main power on/off', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Rocker Switch');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Tactile Push Buttons', 'Amazon', 130, 'https://link.amazon/B0dP2TM6c', 1, '', 'Roll/pitch/yaw trims', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Tactile Push Buttons');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '2S LiPo 7.4V', 'Amazon', 550, 'https://link.amazon/B0aP6Pv1Y', 1, '', '500–1000 mAh — Transmitter battery', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '2S LiPo 7.4V');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '5mm LED + 330Ω Resistor', 'Amazon', 120, 'https://link.amazon/B0dHwCltG', 1, '', 'Power indicator', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '5mm LED + 330Ω Resistor');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Perfboard or Enclosure', 'Amazon', 150, 'https://link.amazon/B09ImKJ0X', 1, '', 'To mount everything', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Perfboard or Enclosure');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Arduino Nano (Receiver)', 'Amazon', 310, 'https://link.amazon/B01dPWJR4', 1, '', 'Same as the transmitter — on the drone', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Arduino Nano (Receiver)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Male Header Strip 2.54mm', 'Amazon', 120, 'https://link.amazon/B0aCRxHK2', 1, '', '3-pin output header for the 6 channels', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Male Header Strip 2.54mm');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'NRF24L01+ PA+LNA with SMA Antenna', 'Amazon', 420, 'https://link.amazon/B04vjzTFc', 1, '', 'Long-range version — one for each side', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'NRF24L01+ PA+LNA with SMA Antenna');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'NRF24 3.3V Adapter Board', 'Amazon', 150, 'https://link.amazon/B0cVqOZAu', 1, '', 'Socket adapter with onboard regulator', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'NRF24 3.3V Adapter Board');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Electrolytic Capacitor 100–470µF', 'Amazon', 110, 'https://link.amazon/B0eejb9ia', 1, '', 'One across VCC–GND on each radio', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Electrolytic Capacitor 100–470µF');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'F450 Frame with Integrated PCB', 'Amazon', 850, 'https://link.amazon/B05Y8tCwg', 1, '', 'Bottom plate doubles as power distribution', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'F450 Frame with Integrated PCB');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'A2212 1400KV Motors + 30A ESCs + 1045 Props', 'Amazon', 3450, 'https://link.amazon/B0bIRgHjv', 1, '', 'Combo set of 4', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'A2212 1400KV Motors + 30A ESCs + 1045 Props');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Spare 1045 Props (CW + CCW)', 'Amazon', 150, 'https://link.amazon/B0hVXKd8P', 1, '', 'You will break some', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Spare 1045 Props (CW + CCW)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '3S LiPo 11.1V', 'Amazon', 1480, 'https://link.amazon/B01IQieYl', 1, '', '2200–3800 mAh, 20C or higher, XT60', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '3S LiPo 11.1V');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Arduino UNO R3', 'Amazon', 490, 'https://link.amazon/B06x42q5l', 1, '', 'Flight controller in the YMFC-3D schematic', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Arduino UNO R3');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'MPU-6050 (GY-521)', 'Amazon', 220, 'https://link.amazon/B0b6Z9OkX', 1, '', 'Gyro and accelerometer', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'MPU-6050 (GY-521)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Resistors 330Ω, 1kΩ, 1.5kΩ', 'Amazon', 140, 'https://link.amazon/B01Xwr02c', 1, '', 'LED and battery voltage divider', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Resistors 330Ω, 1kΩ, 1.5kΩ');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT '1N4001 Diode', 'Amazon', 100, 'https://link.amazon/B0h2jSRyA', 1, '', 'D1 on the schematic', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = '1N4001 Diode');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'XT60 Connector Pigtail', 'Amazon', 190, 'https://link.amazon/B07sJcyMa', 1, '', 'Battery to frame', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'XT60 Connector Pigtail');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'LiPo Balance Charger (iMAX B6 type)', 'Amazon', 1550, 'https://www.amazon.in/s?k=imax+b6+lipo+balance+charger', 0, '', 'Essential — nothing else charges the 3S pack safely', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'LiPo Balance Charger (iMAX B6 type)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'LiPo Safe Bag', 'Amazon', 290, 'https://www.amazon.in/s?k=lipo+safe+bag', 0, '', 'Fire-safe charging and storage bag', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'LiPo Safe Bag');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'LiPo Voltage Alarm (1–8S)', 'Amazon', 230, 'https://www.amazon.in/s?k=lipo+battery+voltage+tester+buzzer+alarm', 0, '', 'Low-voltage buzzer alarm', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'LiPo Voltage Alarm (1–8S)');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Battery Strap', 'Amazon', 150, 'https://www.amazon.in/s?k=lipo+battery+strap', 0, '', 'Holds LiPo to the frame', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Battery Strap');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Dupont Jumper Wires', 'Amazon', 210, 'https://www.amazon.in/s?k=dupont+jumper+wires+male+female', 0, '', 'Male-female assortment', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Dupont Jumper Wires');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Soldering Iron Kit, Heat Shrink, Zip Ties', 'Amazon', 430, 'https://www.amazon.in/s?k=soldering+iron+kit+with+solder+wire', 0, '', 'Basic soldering setup', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Soldering Iron Kit, Heat Shrink, Zip Ties');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Multimeter', 'Amazon', 250, 'https://www.amazon.in/s?k=digital+multimeter', 0, '', 'Digital multimeter for debugging', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Multimeter');
INSERT INTO components (name, store, unit_price_inr, buy_url, is_affiliate, price_checked, notes, created_at, updated_at) 
    SELECT 'Vibration Damping Foam for MPU-6050', 'Amazon', 180, 'https://www.amazon.in/s?k=flight+controller+vibration+damping+foam', 0, '', 'Isolates gyro from motor vibrations', strftime('%s','now'), strftime('%s','now')
    WHERE NOT EXISTS (SELECT 1 FROM components WHERE name = 'Vibration Damping Foam for MPU-6050');

UPDATE bom_items SET component_id = (SELECT id FROM components WHERE components.name = bom_items.name) WHERE component_id = 0;
