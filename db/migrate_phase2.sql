-- Phase 2 Migration Script for Project 12 (Drone)

-- 1. Insert Wiring -> Pins
INSERT INTO project_pins (project_id, from_pin, to_pin, note, sort) VALUES
(12, 'nRF24 Adapter VCC', '5V', 'Feed from 5V, never a bare module.', 10),
(12, 'nRF24 Adapter GND', 'GND', '', 20),
(12, 'nRF24 Adapter CE', 'D7', '', 30),
(12, 'nRF24 Adapter CSN', 'D8', '', 40),
(12, 'nRF24 Adapter SCK', 'D13', '', 50),
(12, 'nRF24 Adapter MOSI', 'D11', '', 60),
(12, 'nRF24 Adapter MISO', 'D12', '', 70),
(12, 'Left stick Y', 'A0', 'Throttle', 80),
(12, 'Left stick X', 'A1', 'Yaw', 90),
(12, 'Right stick Y', 'A2', 'Pitch', 100),
(12, 'Right stick X', 'A3', 'Roll', 110),
(12, 'Toggle switch', 'D2', 'AUX1', 120),
(12, 'Potentiometer wiper', 'A7', 'AUX2 (Use A5 on Uno)', 130),
(12, 'Receiver D9', 'FC Pin 8', 'CH1 Roll', 140),
(12, 'Receiver D2', 'FC Pin 9', 'CH2 Pitch', 150),
(12, 'Receiver D3', 'FC Pin 10', 'CH3 Throttle', 160),
(12, 'Receiver D4', 'FC Pin 11', 'CH4 Yaw', 170),
(12, 'Receiver GND', 'FC GND', 'Mandatory common ground', 180),
(12, 'MPU-6050 SDA/SCL', 'Uno A4/A5', 'I2C', 190),
(12, 'Status LED', 'Pin 12', 'Via 330 ohm resistor', 200),
(12, 'Battery voltage', 'A0', 'Via 1.5 k / 1 k divider and 1N4001 diode', 210);

-- 2. Insert Stages -> Steps
INSERT INTO project_steps (project_id, title, body, why, image_url, sort) VALUES
(12, 'Stage 1 — Is each nRF24 module alive?', 'Flash `NRF_TX_test` on one Nano and `NRF_RX_test` on the other. Open the receiver''s Serial Monitor.
- **Pass:** "Module OK" at boot, then a counter climbing: Received #0, #1, #2...
- **Fail:** "begin() failed" or "chip not connected" means power or SPI wiring. Check the 5 V feed, the six signal wires and the capacitor.
- Keep the boards 1–2 m apart; PA+LNA modules can overload each other point-blank.', 'Proves SPI wiring and module health before complicating things.', '', 10),

(12, 'Stage 2 — Does every control on the remote work?', 'Flash `Transmitter_RemoteTest`. Move every stick, flip the toggle, turn the pot.
- Centred sticks read about 500 raw and about 128 sent. Full travel reaches about 0 and 255.
- The toggle flips OFF and ON cleanly. The pot sweeps smoothly.
- The first field shows **TX:on** when the radio is detected and **TX:OFF** when it is not.
- If the toggle flickers, wire it firmly between D2 and 5 V/GND.', 'Catches faulty analog sticks and bad solder joints on the inputs.', '', 20),

(12, 'Stage 3 — Do the two radios really hear each other?', 'Flash `TX_LinkCheck` on the remote and `RX_LinkCheck` on the receiver, keep them 1–2 m apart, and watch the remote''s monitor.
- **ACK:YES** means the receiver is heard. The link is good.
- **RADIO: NOT DETECTED** means the remote''s own module has a power or wiring problem.
- **TX:on | ACK:no** means the remote is fine but the receiver is not powered, not wired, or not listening.', 'Verifies RF communication without the distraction of servo outputs.', '', 30),

(12, 'Stage 4 — Receiver and servo outputs', 'Flash `Receiver_Test` on the receiver Nano. It prints every channel and drives six servo outputs at the same time.
- **LINK:OK** with numbers moving means packets are arriving.
- Plug a servo into the **receiver''s** pin for the channel you are moving (D3 for throttle, etc.). Signal to the pin, + to 5 V, - to GND.
- **Failsafe test:** switch the remote off. Within about a second the monitor shows LINK:LOST and throttle drops to about 1047 µs.', 'Proves the receiver can generate the exact PWM pulses the flight controller expects.', '', 40),

(12, 'Stage 5 — Motor directions', 'Flash `Motor_Direction_Test_UNO`. ESC signals go to D3, D5, D6 and D9, with grounds shared with the Uno. Bolt the motors down and keep the ESCs'' 5 V wires unplugged from the Arduino.
- It arms the ESCs, ramps all four motors from 0 to 50 %, holds, then ramps down.
- Compare each motor with the directions above. Wrong way? Power off and swap two motor wires.', 'Testing motors directly isolates ESC/motor issues from FC/PID issues.', '', 50),

(12, 'Stage 6 — Receiver into the flight controller', 'Wire the receiver to the flight controller and flash `FC_Receiver_PinTest` on the Uno.
- **Pass:** P8, P9, P10 and P11 all show about 1000–2000 and move with the sticks.
- **0 on a pin** means nothing arrives there: a loose wire, a missing common ground, or a receiver stuck on LINK:LOST.', 'Confirms the FC is successfully reading the receiver pulses.', '', 60),

(12, 'Stage 7 — Is the gyro found, and which ID does it report?', 'Flash `I2C_Scanner`, then `MPU_WhoAmI`.
- The scan should find a device at **0x68**.
- `MPU_WhoAmI` prints the chip''s ID. A genuine MPU-6050 answers **0x68**. Many modules sold as MPU-6050 answer **0x70** — a compatible MPU-6500-class chip.
- Nothing found: check SDA/SCL, VCC (5 V on a GY-521) and GND.', 'Identifies fake/clone gyros before the flight firmware rejects them.', '', 70),

(12, 'Stage 8 — Setup, ESC calibration and flight code', 'Upload the three YMFC-AL sketches in this order: **setup → ESC calibration → flight controller**.
**8a. Setup:** Checks I2C, waits for receiver pulses, asks you to centre/move sticks, calibrates gyro (keep still!), and measures angles.
**8b. ESC calibration:** Passes throttle straight to ESCs to learn endpoints.
**8c. Flight code:** Arm by moving throttle down and yaw left. Disarm with throttle down and yaw right.', 'The final configuration and persistent EEPROM storage.', '', 80),

(12, 'Stage 9 — Bench arm test, then first flight', 'Go through the First-flight checklist. Always test arming and disarming without propellers first.
- Low hover only initially, small stick movements, gentle landing.
- If it tips or lunges, cut throttle and disarm instantly.', 'Safety first.', '', 90);

-- 3. Insert Troubleshooting -> Troubleshoot
INSERT INTO project_troubleshooting (project_id, symptom, fix, sort) VALUES
(12, 'ERROR 3, no gyro found', 'The setup sketch expects 0x68, but your GY-521 might report 0x70. Search the setup code for `search_gyro(0x68, 0x75)` and change 0x68 to 0x70.', 10),
(12, 'TX:OFF, radio not detected', 'Check adapter is fed from 5V. Ensure SCK/MOSI/MISO/CSN/GND are correct (MISO and MOSI swapped is classic). Check capacitor.', 20),
(12, 'LINK:LOST while the remote is on', 'The radios are not linked. Re-run Stage 3 LinkCheck to diagnose.', 30),
(12, 'Numbers change but the servo does not move', 'The servo is on the wrong pin. Plug the servo into the receiver''s D-pins, not the remote.', 40),
(12, 'Random LINK:LOST when servos move', 'Power dip. Give the servos a separate 5 V supply with common ground.', 50),
(12, 'YMFC ERROR 1, no valid receiver signals', 'Check common ground between receiver and flight controller, wires on pins 8–11. Use Stage 6 to see which pin is silent.', 60),
(12, 'ERROR 4, no angular motion detected', 'Turn the whole drone about ONE axis by a clear 30–45° within 10 seconds, then level it. Rotating too gently triggers this.', 70),
(12, 'ERROR 6, receiver channel verification failed', 'Two functions landed on the same input. Move only the ONE stick named at each prompt, fully, then back to centre.', 80),
(12, 'ERROR 8, I2C clock not 400 kHz', 'Check the board selection in Arduino IDE is Arduino Uno (16 MHz).', 90);

-- 4. Update the giant description blob to remove the extracted sections
-- We keep only Overview, System Overview, How radio link works, FAQ, Downloads, Credits.
UPDATE projects SET description = '## Overview

This project takes a pile of loose parts to a **bench-verified quadcopter**: a hand-built 6-channel Arduino remote, a matching nRF24L01 receiver, and an Arduino Uno flight controller with an MPU-6050 gyro that drives four brushless motors.

It is written as a **bring-up log**, not just a wiring diagram. Every stage has a small test sketch, an expected result, and the real errors I hit along the way.

**What you will learn**
- How a 2.4 GHz nRF24L01 radio link carries six stick, switch and knob channels
- How to prove each part works before you connect the next one
- How a receiver''s servo-style pulses feed a flight controller
- How to calibrate the flight controller and check motor directions safely

**Who this is for:** builders comfortable with Arduino sketches and basic wiring. Difficulty is **Advanced** because it involves a LiPo battery, ESCs and spinning motors.

**What this is not:** it is not a from-scratch flight controller. The stabilisation firmware is the community **YMFC-AL** flight controller by **Joop Brokking** (www.brokking.net). It is **not included** here — you download it from its author. This project covers the radio side, the test tooling, the wiring, and the debugging that gets that firmware running with a DIY receiver.

## Architecture

![System Architecture Diagram](/media/drone-arch.svg)

**In words:** the remote reads your controls and sends them over the radio. The receiver turns them back into normal RC pulses. The flight controller reads those pulses, measures how the frame is tilting with the gyro, and adjusts the four motors many times a second to keep the drone stable.

## How the radio link works

- Radio: nRF24L01+ at 2.4 GHz, **channel 108**, **250 kbps**, CRC-8, maximum power, same address on both ends.
- **Auto-acknowledge is OFF** in the flying configuration. The remote streams packets one way and does not wait for a reply. The link-check sketches turn it ON temporarily, only as a diagnostic.
- Each packet is **6 bytes** (0–255 each): throttle, yaw, pitch, roll, aux1, aux2.
- The receiver converts each byte to a **1000–2000 µs** pulse with the Servo library — the same signal a hobby receiver produces.
- **Failsafe:** if no packet arrives for about 1 second, the receiver sets throttle to about 1047 µs and re-centres the sticks near 1500 µs.

**Channel map**
- CH1 roll: right stick X → remote A3 → receiver D9
- CH2 pitch: right stick Y → remote A2 → receiver D2
- CH3 throttle: left stick Y → remote A0 → receiver D3
- CH4 yaw: left stick X → remote A1 → receiver D4
- CH5 aux1: toggle → remote D2 → receiver D5
- CH6 aux2: potentiometer → remote A7 → receiver D6

Only CH1–CH4 go to the flight controller. CH5 and CH6 are free for extras.

## FAQ

**Can I use an Arduino Uno for the remote?** Yes. A7 does not exist on the Uno, so move AUX2 to A5. A ready-made variant is in the downloads.

**Why is auto-acknowledge off?** The remote streams one-way without waiting for replies, which keeps latency low. Turn it on only for diagnostics.

**Can I use this receiver with Betaflight or iNav?** Not directly. It outputs six separate PWM signals, while those flight controllers expect one wire (PPM, SBUS and similar). A PPM-output version of the receiver would be the next step.

**Can I use a 4S battery?** Not with this build. The battery-voltage divider and the firmware are set up for 3S.

**Do I need the throttle stick "down" to be the lowest value?** Yes. Throttle fully down must read below 1050 µs at the flight controller, or the drone will not arm.'
WHERE id = 12;
