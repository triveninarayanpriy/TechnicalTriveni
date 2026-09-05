-- ============================================================================
--  Sample data for Technical Triveni.
--  Safe to re-run: it clears sample rows first. REPLACE this content with your
--  real projects from the admin panel — these are illustrative placeholders.
-- ============================================================================

DELETE FROM project_links;
DELETE FROM bom_items;
DELETE FROM project_files;
DELETE FROM project_images;
DELETE FROM projects;

-- Default editable settings ------------------------------------------------
INSERT INTO settings (key, value) VALUES
  ('site_announcement', '') ON CONFLICT(key) DO NOTHING;
INSERT INTO settings (key, value) VALUES
  ('contact_email', 'hello@technicaltriveni.com') ON CONFLICT(key) DO NOTHING;

-- Projects ------------------------------------------------------------------
INSERT INTO projects
  (id, slug, title, summary, description, category, difficulty, cover_image, video_url, tags, build_time,
   price_inr, combo_enabled, combo_title, combo_description, featured, published, sort, created_at, updated_at)
VALUES
(1, 'iot-weather-station-esp32',
 'IoT Weather Station with ESP32',
 'Live temperature, humidity & air-quality on a phone dashboard — powered by an ESP32 and a tiny web server.',
 '## What you''ll build

A compact, WiFi-connected weather station that reads temperature, humidity, pressure and air quality, then serves a clean live dashboard you can open from any phone on your network.

### How it works
The **ESP32** samples the sensors every few seconds and hosts a lightweight web dashboard over WiFi. Readings update in real time using a small polling loop — no cloud account required. An optional MQTT mode lets you push data to Home Assistant.

### You''ll learn
- Reading I²C sensors (BME280 + MQ-135)
- Hosting a responsive dashboard from the ESP32 itself
- Clean, non-blocking firmware structure
- Optional MQTT publishing for home-automation

### Skills
Beginner-friendly wiring, with well-commented code so you understand every line.',
 'Electronics', 'Intermediate', '/covers/esp32-weather.png', 'https://youtube.com/@TechnicalTriveni',
 'ESP32,IoT,Sensors,WiFi,Dashboard', '2–3 hours',
 299, 1, 'Complete Project Combo',
 'Arduino/PlatformIO source code, wiring schematic (PDF), dashboard web files, 3D-printable enclosure (STL), and a step-by-step build guide.',
 1, 1, 1, strftime('%s','now'), strftime('%s','now')),

(2, 'line-following-robot-arduino',
 'Line-Following Robot (Arduino)',
 'A classic first robotics build — an Arduino car that follows a track using IR sensors and smooth PID steering.',
 '## What you''ll build

A two-wheeled robot that follows a black line on a white surface, using IR reflectance sensors and a tuned **PID controller** for smooth, fast cornering.

### How it works
Two IR sensors detect the line edges; the Arduino computes a correction with a lightweight PID loop and drives the motors through an L298N driver. We include a calibration routine so it works on any track.

### You''ll learn
- Reading and calibrating IR sensor arrays
- Writing a simple, readable PID controller
- Motor driver wiring and PWM speed control
- Tuning for speed vs. stability',
 'Robotics', 'Beginner', '/covers/line-robot.png', 'https://youtube.com/@TechnicalTriveni',
 'Arduino,Robotics,PID,Motors', '2 hours',
 149, 1, 'Complete Project Combo',
 'Arduino source with tunable PID, wiring schematic (PDF), chassis layout, and a calibration guide.',
 1, 1, 2, strftime('%s','now'), strftime('%s','now')),

(3, 'ai-voice-home-hub',
 'AI Voice Home Hub',
 'An offline-first voice assistant hub that controls your devices and answers with a local AI model.',
 '## What you''ll build

A desktop voice hub that listens for a wake word, understands commands, and controls smart devices — with responses from a local AI model, so it keeps working without the cloud.

### How it works
A Raspberry Pi (or any Linux box) runs the wake-word engine and a small language model. Commands map to device actions over MQTT. A crisp web UI shows status and lets you type commands too.

### You''ll learn
- Wake-word detection and speech-to-text
- Wiring an AI model into a command pipeline
- Controlling devices over MQTT
- Building a clean local web UI',
 'AI', 'Advanced', '/covers/ai-voice-dashboard.png', 'https://youtube.com/@TechnicalTriveni',
 'AI,Voice,Raspberry Pi,MQTT,Software', '4–6 hours',
 499, 1, 'Complete Project Combo',
 'Full Python source, setup scripts, the web UI, wiring notes for the mic/speaker HAT, and a deployment guide.',
 1, 1, 3, strftime('%s','now'), strftime('%s','now')),

(4, 'rfid-door-lock-system',
 'RFID Door Lock System',
 'A secure RFID access control with a solenoid lock, buzzer feedback, and an admin card to enrol new tags.',
 '## What you''ll build

A tidy RFID door-lock: tap an authorised card to release a solenoid lock, with clear LED/buzzer feedback. An **admin card** lets you enrol or remove tags without reflashing.

### How it works
An RC522 reader checks each card against a stored list in EEPROM. Authorised tags trigger a relay driving the solenoid; unknown tags get a rejection beep. Everything is documented for safe wiring of the lock supply.

### You''ll learn
- Reading RFID tags with the RC522
- Storing authorised tags in EEPROM
- Safe relay + solenoid wiring
- A simple enrolment workflow',
 'Electronics', 'Beginner', '/covers/rfid-lock.png', 'https://youtube.com/@TechnicalTriveni',
 'RFID,Access,Security,Arduino', '2–3 hours',
 199, 1, 'Complete Project Combo',
 'Arduino source with enrolment mode, wiring schematic (PDF), relay/solenoid safety notes, and a 3D-printable mount (STL).',
 0, 1, 4, strftime('%s','now'), strftime('%s','now'));

-- Gallery images (reuse covers as sample gallery entries) --------------------
INSERT INTO project_images (project_id, url, caption, sort) VALUES
 (1, '/covers/esp32-weather.png', 'Live dashboard running on the ESP32', 0),
 (2, '/covers/line-robot.png', 'Robot tracking the test course', 0),
 (3, '/covers/ai-voice-dashboard.png', 'Local voice hub web UI', 0),
 (4, '/covers/rfid-lock.png', 'Enrolment mode with admin card', 0);

-- Resource files (locked combo contents — upload real files via admin) -------
INSERT INTO project_files (project_id, label, kind, r2_key, filename, size_bytes, is_free, in_combo, sort, created_at) VALUES
 (1, 'Firmware source (PlatformIO)', 'code', '', 'weather-firmware.zip', 0, 0, 1, 0, strftime('%s','now')),
 (1, 'Wiring schematic (PDF)', 'schematic', '', 'weather-schematic.pdf', 0, 0, 1, 1, strftime('%s','now')),
 (1, 'Enclosure (STL)', 'model3d', '', 'weather-enclosure.stl', 0, 0, 1, 2, strftime('%s','now')),
 (1, 'Build guide (PDF)', 'doc', '', 'weather-guide.pdf', 0, 0, 1, 3, strftime('%s','now')),
 (2, 'Arduino source (.ino)', 'code', '', 'line-robot.ino', 0, 0, 1, 0, strftime('%s','now')),
 (2, 'Wiring schematic (PDF)', 'schematic', '', 'line-robot-schematic.pdf', 0, 0, 1, 1, strftime('%s','now')),
 (3, 'Python source + UI', 'code', '', 'voice-hub.zip', 0, 0, 1, 0, strftime('%s','now')),
 (3, 'Deployment guide (PDF)', 'doc', '', 'voice-hub-guide.pdf', 0, 0, 1, 1, strftime('%s','now')),
 (4, 'Arduino source (.ino)', 'code', '', 'rfid-lock.ino', 0, 0, 1, 0, strftime('%s','now')),
 (4, 'Wiring schematic (PDF)', 'schematic', '', 'rfid-schematic.pdf', 0, 0, 1, 1, strftime('%s','now')),
 (4, 'Mount (STL)', 'model3d', '', 'rfid-mount.stl', 0, 0, 1, 2, strftime('%s','now'));

-- Bill of materials (EXAMPLE affiliate links — replace with your own) --------
INSERT INTO bom_items (project_id, name, qty, notes, store, affiliate_url, unit_price_inr, sort) VALUES
 (1, 'ESP32 DevKit V1', '1', 'Any ESP32 dev board works', 'Robu.in', 'https://robu.in/', 450, 0),
 (1, 'BME280 sensor (temp/humidity/pressure)', '1', 'I²C module', 'Amazon', 'https://www.amazon.in/', 250, 1),
 (1, 'MQ-135 air-quality sensor', '1', 'Optional but recommended', 'Amazon', 'https://www.amazon.in/', 150, 2),
 (1, 'Breadboard + jumper wires', '1 set', '', 'Amazon', 'https://www.amazon.in/', 200, 3),
 (2, 'Arduino Uno (or Nano)', '1', '', 'Amazon', 'https://www.amazon.in/', 500, 0),
 (2, 'L298N motor driver', '1', '', 'Robu.in', 'https://robu.in/', 120, 1),
 (2, 'IR line sensors', '2', 'TCRT5000 modules', 'Amazon', 'https://www.amazon.in/', 80, 2),
 (2, 'TT gear motors + wheels', '2', 'With chassis', 'Amazon', 'https://www.amazon.in/', 350, 3),
 (3, 'Raspberry Pi 4 (2GB+)', '1', 'Or any Linux SBC', 'Amazon', 'https://www.amazon.in/', 4500, 0),
 (3, 'USB microphone', '1', '', 'Amazon', 'https://www.amazon.in/', 600, 1),
 (3, 'Small speaker', '1', '', 'Amazon', 'https://www.amazon.in/', 400, 2),
 (4, 'RC522 RFID reader + cards', '1 kit', '', 'Amazon', 'https://www.amazon.in/', 180, 0),
 (4, 'Arduino Uno', '1', '', 'Amazon', 'https://www.amazon.in/', 500, 1),
 (4, '12V solenoid lock', '1', '', 'Amazon', 'https://www.amazon.in/', 550, 2),
 (4, 'Relay module + 12V supply', '1', 'Handle mains/12V safely', 'Amazon', 'https://www.amazon.in/', 250, 3);

-- Resource links -----------------------------------------------------------
INSERT INTO project_links (project_id, label, url, kind, sort) VALUES
 (1, 'Watch the build video', 'https://youtube.com/@TechnicalTriveni', 'video', 0),
 (2, 'Watch the build video', 'https://youtube.com/@TechnicalTriveni', 'video', 0),
 (3, 'Watch the build video', 'https://youtube.com/@TechnicalTriveni', 'video', 0),
 (4, 'Watch the build video', 'https://youtube.com/@TechnicalTriveni', 'video', 0);
