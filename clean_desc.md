## Overview

This project takes a pile of loose parts to a **bench-verified quadcopter**: a hand-built 6-channel Arduino remote, a matching nRF24L01 receiver, and an Arduino Uno flight controller with an MPU-6050 gyro that drives four brushless motors.

It is written as a **bring-up log**, not just a wiring diagram. Every stage has a small test sketch, an expected result, and the real errors I hit along the way ΓÇö including a gyro chip that turned out to be a look-alike and made the flight-controller setup stop with **ERROR 3**.

**What you will learn**
- How a 2.4 GHz nRF24L01 radio link carries six stick, switch and knob channels
- How to prove each part works before you connect the next one
- How a receiver's servo-style pulses feed a flight controller
- How to calibrate the flight controller and check motor directions safely
- How to read and fix the errors that stop most first builds

**Who this is for:** builders comfortable with Arduino sketches and basic wiring. Difficulty is **Advanced** because it involves a LiPo battery, ESCs and spinning motors.

**What this is not:** it is not a from-scratch flight controller. The stabilisation firmware is the community **YMFC-AL** flight controller by **Joop Brokking** (www.brokking.net). It is **not included** here ΓÇö you download it from its author. This project covers the radio side, the test tooling, the wiring, and the debugging that gets that firmware running with a DIY receiver.

## System overview

```
[Sticks / toggle / pot]
        |  analog + digital inputs
        v
[TX Arduino Nano] --nRF24L01+ (2.4 GHz, channel 108, 250 kbps)--> [RX Arduino Nano]
                                                                        |  4 x servo-style PWM (1000-2000 us)
                                                                        v
                                                [Flight controller: Arduino Uno + MPU-6050 gyro]
                                                                        |  4 x ESC pulses
                                                                        v
                                                          [4 x ESC] --> [4 x brushless motor]
```

**In words:** the remote reads your controls and sends them over the radio. The receiver turns them back into normal RC pulses. The flight controller reads those pulses, measures how the frame is tilting with the gyro, and adjusts the four motors many times a second to keep the drone stable.

**Why two extra boards?** The flight-controller firmware expects an ordinary RC receiver. The DIY nRF24 receiver produces exactly that, so it slots into the receiver position. A single-board design is possible later, but this two-board layout is much easier to debug.

## Parts list

**Remote (transmitter)**
- Arduino Nano ├ù1
- nRF24L01+ PA+LNA module ├ù1 with a 3.3 V adapter board
- 100ΓÇô470 ┬╡F electrolytic capacitor ├ù1 (across the module's 3.3 V and GND)
- Dual-axis joystick modules ├ù2 (left: throttle and yaw, right: pitch and roll)
- Toggle switch ├ù1 (AUX1) and potentiometer ├ù1 (AUX2)
- 2S LiPo (7.4 V) into the Nano's VIN, plus a power switch ΓÇö or USB while testing

**Receiver**
- Arduino Nano ├ù1
- nRF24L01+ PA+LNA module ├ù1 with a 3.3 V adapter board
- 100ΓÇô470 ┬╡F electrolytic capacitor ├ù1
- 3-pin headers for the six output channels

**Flight controller and airframe**
- Arduino Uno ├ù1
- MPU-6050 (GY-521) gyro module ├ù1
- Brushless motors ├ù4, ESCs ├ù4, quadcopter frame, propellers (2 CW + 2 CCW)
- 3S LiPo (11.1 V) ΓÇö the battery-voltage circuit is built for 3S only
- 1N4001 diode ├ù1, resistors 1.5 k╬⌐, 1 k╬⌐ and 330 ╬⌐, one LED
- Wire, connectors, heat-shrink, zip ties

**Test gear**
- SG90 servo for receiver tests, multimeter, USB cables, LiPo-safe bag

## How the radio link works

- Radio: nRF24L01+ at 2.4 GHz, **channel 108**, **250 kbps**, CRC-8, maximum power, same address on both ends.
- **Auto-acknowledge is OFF** in the flying configuration. The remote streams packets one way and does not wait for a reply. The link-check sketches turn it ON temporarily, only as a diagnostic.
- Each packet is **6 bytes** (0ΓÇô255 each): throttle, yaw, pitch, roll, aux1, aux2.
- The receiver converts each byte to a **1000ΓÇô2000 ┬╡s** pulse with the Servo library ΓÇö the same signal a hobby receiver produces.
- **Failsafe:** if no packet arrives for about 1 second, the receiver sets throttle to about 1047 ┬╡s and re-centres the sticks near 1500 ┬╡s.

**Channel map**
- CH1 roll: right stick X ΓåÆ remote A3 ΓåÆ receiver D9
- CH2 pitch: right stick Y ΓåÆ remote A2 ΓåÆ receiver D2
- CH3 throttle: left stick Y ΓåÆ remote A0 ΓåÆ receiver D3
- CH4 yaw: left stick X ΓåÆ remote A1 ΓåÆ receiver D4
- CH5 aux1: toggle ΓåÆ remote D2 ΓåÆ receiver D5
- CH6 aux2: potentiometer ΓåÆ remote A7 ΓåÆ receiver D6

Only CH1ΓÇôCH4 go to the flight controller. CH5 and CH6 are free for extras.

## Wiring

**nRF24 module, both ends (through the 3.3 V adapter)**
- Adapter VCC ΓåÆ 5V, GND ΓåÆ GND
- CE ΓåÆ D7, CSN ΓåÆ D8
- SCK ΓåÆ D13, MOSI ΓåÆ D11, MISO ΓåÆ D12
- IRQ ΓåÆ not connected
- Capacitor across the module's 3.3 V and GND, positive leg to VCC, as close to the module as possible

**Golden rule:** feed the adapter board from 5 V, never a bare module. A bare module on 5 V is destroyed instantly, and an under-powered PA+LNA module browns out and looks like a wiring fault.

**Remote inputs**
- Left stick Y ΓåÆ A0, left stick X ΓåÆ A1
- Right stick Y ΓåÆ A2, right stick X ΓåÆ A3
- Toggle ΓåÆ D2, potentiometer wiper ΓåÆ A7
- Sticks and pot: +5V and GND
- A6 and A7 exist on the **Nano only**. On an Uno, move AUX2 to A5 (a ready-made Uno variant is in the downloads).

**Receiver to flight controller**
- Receiver D9 ΓåÆ flight-controller pin 8
- Receiver D2 ΓåÆ flight-controller pin 9
- Receiver D3 ΓåÆ flight-controller pin 10
- Receiver D4 ΓåÆ flight-controller pin 11
- Receiver GND ΓåÆ flight-controller GND (**mandatory**)
- Channel order does not matter ΓÇö the setup step detects which stick is which.

**Flight controller (YMFC-AL pin layout)**
- Receiver inputs on pins 8ΓÇô11, ESC signals on pins 4ΓÇô7
- MPU-6050 on the Uno's SDA/SCL pins (the same nets as A4/A5), VCC to 5V, GND to GND
- Status LED on pin 12 through a 330 ╬⌐ resistor
- Battery voltage on A0 through a 1.5 k╬⌐ / 1 k╬⌐ divider, with a 1N4001 diode in the battery feed
- ESC signal and ground wires only. Leave each ESC's 5 V (BEC) wire **unconnected** ΓÇö the Uno is powered from the battery through its own regulator.

**Motor positions and directions:** M1 right-front CCW, M2 right-rear CW, M3 left-rear CCW, M4 left-front CW. Diagonal motors match and neighbours oppose ΓÇö that cancels yaw torque. To reverse a motor, swap any two of its three wires.

**Receiver power on the drone:** the receiver Nano and radio are a small load and can run from the flight controller's 5 V. Feel the Uno's regulator after a few minutes; if it runs hot, give the receiver its own 5 V supply and share ground.

## Build and test, stage by stage

Do every stage with **propellers OFF**. Do not move on until a stage passes. All test sketches are in the downloads and use 115200 baud unless stated.

### Stage 1 ΓÇö Is each nRF24 module alive?
Flash `NRF_TX_test` on one Nano and `NRF_RX_test` on the other. Open the receiver's Serial Monitor.
- **Pass:** "Module OK" at boot, then a counter climbing: Received #0, #1, #2 ΓÇª
- **Fail:** "begin() failed" or "chip not connected" means power or SPI wiring. Check the 5 V feed, the six signal wires and the capacitor.
- Keep the boards 1ΓÇô2 m apart; PA+LNA modules can overload each other point-blank.

### Stage 2 ΓÇö Does every control on the remote work?
Flash `Transmitter_RemoteTest`. Move every stick, flip the toggle, turn the pot.
- Centred sticks read about 500 raw and about 128 sent. Full travel reaches about 0 and 255.
- The toggle flips OFF and ON cleanly. The pot sweeps smoothly.
- The first field shows **TX:on** when the radio is detected and **TX:OFF** when it is not. The controls are still testable either way.
- If the toggle flickers, wire it firmly between D2 and 5 V/GND, or use the internal pull-up and wire it to GND.

### Stage 3 ΓÇö Do the two radios really hear each other?
Flash `TX_LinkCheck` on the remote and `RX_LinkCheck` on the receiver, keep them 1ΓÇô2 m apart, and watch the remote's monitor.
- **ACK:YES** means the receiver is heard. The link is good.
- **RADIO: NOT DETECTED** means the remote's own module has a power or wiring problem.
- **TX:on | ACK:no** means the remote is fine but the receiver is not powered, not wired, or not listening.

### Stage 4 ΓÇö Receiver and servo outputs
Flash `Receiver_Test` on the receiver Nano. It prints every channel and drives six servo outputs at the same time.
- **LINK:OK** with numbers moving means packets are arriving.
- Plug a servo into the **receiver's** pin for the channel you are moving (D3 for throttle, and so on). Signal to the pin, + to 5 V, ΓêÆ to GND.
- **Common mistake:** the remote never drives a servo. A servo on the remote's A0 will never move ΓÇö the value changes on screen only because A0 is an input.
- Run one small servo from the Nano's 5 V. Several servos need their own 5 V supply with a common ground, or they brown out the radio and cause false LINK:LOST.
- `Servo_Standalone_Test` proves a servo works on a single board with no radio.
- **Failsafe test:** switch the remote off. Within about a second the monitor shows LINK:LOST and throttle drops to about 1047 ┬╡s.

### Stage 5 ΓÇö Motor directions
Flash `Motor_Direction_Test_UNO`. ESC signals go to D3, D5, D6 and D9, with grounds shared with the Uno. Bolt the motors down and keep the ESCs' 5 V wires unplugged from the Arduino.
- It arms the ESCs, ramps all four motors from 0 to 50 %, holds, then ramps down.
- Compare each motor with the directions above. Wrong way? Power off and swap two motor wires.

### Stage 6 ΓÇö Receiver into the flight controller
Wire the receiver to the flight controller (see Wiring) and flash `FC_Receiver_PinTest` on the Uno.
- **Pass:** P8, P9, P10 and P11 all show about 1000ΓÇô2000 and move with the sticks.
- **0 on a pin** means nothing arrives there: a loose wire, a missing common ground, or a receiver stuck on LINK:LOST.
- In my build, one channel (pin 10) read 0 while the other three were fine. The tester pointed straight at the connection to fix.

### Stage 7 ΓÇö Is the gyro found, and which ID does it report?
Flash `I2C_Scanner`, then `MPU_WhoAmI`.
- The scan should find a device at **0x68**.
- `MPU_WhoAmI` prints the chip's ID. A genuine MPU-6050 answers **0x68**. Many modules sold as MPU-6050 answer **0x70** ΓÇö a compatible MPU-6500-class chip.
- Nothing found: check SDA/SCL, VCC (5 V on a GY-521) and GND, and reseat the header pins.

### Stage 8 ΓÇö Setup, ESC calibration and flight code (YMFC-AL)
Download the YMFC-AL package from its author and upload the three sketches in this order: **setup ΓåÆ ESC calibration ΓåÆ flight controller**. Re-run setup whenever you change the transmitter, receiver or frame orientation.

**8a. Setup sketch (Serial Monitor 57600 baud)**
- Checks the I┬▓C clock and waits for valid receiver pulses.
- Asks you to centre all sticks (10 seconds), then move each stick fully so it learns which channel is roll, pitch, throttle and yaw and which way each goes.
- Calibrates the gyro (about 8 seconds ΓÇö keep the drone dead still).
- Asks you to lift the left side about 45┬░, lift the nose about 45┬░, and rotate the nose about 45┬░ to the right, returning to level each time.
- Finishes with **"Setup is finished"** and stores everything in EEPROM.

**8b. ESC calibration sketch (57600 baud)**
- Passes your throttle stick straight to all four ESCs so they learn their endpoints. Follow the on-screen prompts and your ESC's beep sequence.
- Then use the serial menu to read receiver values, read angles, and spin each motor alone or all together. Check spin, direction and vibration.

**8c. Flight code**
- **Arm:** throttle fully down and yaw fully left, then yaw back to centre.
- **Disarm:** throttle fully down and yaw fully right.
- The LED on pin 12 warns of low battery (around 10 V on 3S).
- Leave the PID gains at their defaults until it hovers.

### Stage 9 ΓÇö Bench arm test, then first flight
See the checklist below.

## The gyro problem: ERROR 3 and the 0x70 fix

My setup run stopped every time with **"No gyro device found (ERROR 3)"** even though the I┬▓C scanner found the sensor at 0x68 and it was wired correctly.

**Cause:** the setup sketch checks the chip's WHO_AM_I ID and only accepts the genuine MPU-6050 value, **0x68**. My module reported **0x70**, so a working gyro was rejected.

**Fix (in your own downloaded copy of the setup sketch):**
1. Search for `search_gyro(0x68, 0x75)` and `search_gyro(0x69, 0x75)`. In v1.4 these are the two checks near the top of the gyro search (lines 209 and 218).
2. Change the expected ID at the end of each comparison from `0x68` to `0x70`.
3. Leave the other gyro checks alone. In v1.4 only the setup sketch tests the ID ΓÇö search the other two sketches for `0x75` to confirm in your copy.
4. Upload (not just Verify) and confirm the monitor now prints "MPU-6050 found on address 0x68".

**Tips:** if the old message keeps appearing, the new code did not reach the board. Check the port, and temporarily change a line of text to a unique word so you can see the new sketch running.

## Troubleshooting

- **TX:OFF, radio not detected:** adapter fed from 5 V? SCK/MOSI/MISO/CSN/GND correct (MISO and MOSI swapped is the classic)? Module fully seated? Capacitor fitted? Try the receiver's module and adapter in its place.
- **LINK:LOST while the remote is on:** the radios are not linked. Run Stage 3.
- **Numbers change but the servo does not move:** the servo is on the wrong pin. Use the receiver's D-pins, not an A-pin.
- **Random LINK:LOST when servos move:** power dip. Give the servos a separate 5 V supply with common ground.
- **YMFC ERROR 1, no valid receiver signals:** common ground between receiver and flight controller, wires on pins 8ΓÇô11, receiver showing LINK:OK. Use Stage 6 to see exactly which pin is silent.
- **ERROR 2, no stick movement for 30 seconds:** move the sticks when a step asks for it.
- **ERROR 3, no gyro found:** Stage 7, then the 0x70 fix above.
- **ERROR 4, no angular motion detected:** turn the whole drone about **one** axis by a clear 30ΓÇô45┬░ within 10 seconds, then level it. Rotating around two axes at once, or too gently, triggers it. The calibration offsets it prints are raw sensor counts ΓÇö values in the low hundreds are normal.
- **ERROR 5, EEPROM verification failed:** re-run setup from the start.
- **ERROR 6, receiver channel verification failed:** two functions landed on the same input. Move only the one stick named at each prompt, fully, then back to centre.
- **ERROR 7, gyro axes verification failed:** re-run setup and keep the frame still between the tilt steps.
- **ERROR 8, I┬▓C clock not 400 kHz:** check the board selection is Arduino Uno (16 MHz).

## First-flight checklist

- [ ] Setup, ESC calibration and motor directions verified with props OFF
- [ ] Arm test and disarm test work; tilting the frame by hand makes the low-side motors speed up
- [ ] Props fitted: CW props on CW motors, CCW props on CCW motors, nuts tight
- [ ] Fresh 3S LiPo strapped down; wires and antenna clear of the props
- [ ] Outdoors, open area, calm wind, nobody nearby, in a place where flying is allowed
- [ ] Remote ON first with throttle down, then connect the LiPo; keep the drone still during gyro calibration; step back 5 m
- [ ] Arm, raise throttle slowly until it is almost light on its legs; if it tips or lunges, cut throttle and disarm
- [ ] Low hover only, small stick movements, gentle landing
- [ ] LED on means low battery ΓÇö land now. Disconnect the LiPo first, then switch the remote off

## Safety

- Props off for all bench work. Stay clear of spinning motors.
- Charge and store LiPo packs properly, in a LiPo-safe bag, and never over-discharge them.
- **Signal loss in flight drops the throttle to idle, so the drone will fall.** Fly only where that is acceptable.
- Check the current drone rules for your country and your drone's weight class before flying outdoors.
- This is a learning project. Everything is provided as is, without warranty.

## FAQ

**Can I use an Arduino Uno for the remote?** Yes. A7 does not exist on the Uno, so move AUX2 to A5. A ready-made variant is in the downloads.

**Why is auto-acknowledge off?** The remote streams one-way without waiting for replies, which keeps latency low. Turn it on only for diagnostics.

**Can I use this receiver with Betaflight or iNav?** Not directly. It outputs six separate PWM signals, while those flight controllers expect one wire (PPM, SBUS and similar). A PPM-output version of the receiver would be the next step.

**Can I use a 4S battery?** Not with this build. The battery-voltage divider and the firmware are set up for 3S.

**Do I need the throttle stick "down" to be the lowest value?** Yes. Throttle fully down must read below 1050 ┬╡s at the flight controller, or the drone will not arm.

## Downloads

- **Drone Bring-Up Pack:** 12 test sketches, an optional Uno transmitter, README with the full test order, wiring quick reference and checklist, and CREDITS
- Not included: the YMFC-AL firmware (get it from its author) and the RF24 library (Arduino Library Manager: "RF24 by TMRh20")

## Credits

- **YMFC-AL flight controller firmware and schematic:** Joop Brokking ΓÇö www.brokking.net
- **6-channel nRF24 transmitter/receiver design:** Swapnil Nimbalkar / The DC Minds
- **RF24 library:** TMRh20 and contributors
- Test sketches, wiring notes and troubleshooting written for Technical Triveni