# Phase 2 Migration Plan: Drone Project

To move away from the giant markdown blob, we will populate the existing structured D1 tables (`project_steps`, `project_pins`, `project_troubleshooting`) and build modular Astro components to render them.

## 1. Components to Build

### `StageCard.astro`
Replaces the flat markdown "Build and test" headings.
**Features:** Renders `step.title` as a prominent card header (e.g., "Stage 1 — Is each nRF24 module alive?"), with `step.content` inside.

### `BomTable.astro`
Replaces the flat BOM table from Phase 1.
**Features:** Groups items by logical system (Transmitter, Receiver, Drone, Tools) using the existing `bom_items.category` or ID logic. Adds "I already have this" checkboxes that dynamically recalculate the `bomTotal` in JS.

### `TroubleTable.astro`
Replaces the bulleted troubleshooting list.
**Features:** A searchable, filterable table rendering rows from the `project_troubleshooting` database table.

---

## 2. Data Migration (Drone Project #12)

I will execute SQL scripts to move content out of the `description` blob and into the structured tables.

### A. System Diagram (ASCII → SVG)
I will generate a clean SVG diagram of the architecture (Sticks → TX → RF → RX → Flight Controller → ESCs → Motors) and save it to the project's media/assets, injecting it into the overview.

### B. Wiring → `project_pins`
The bulleted "Wiring" section will be converted into structured rows:
| Component | Pin | Connected To | Notes |
| :--- | :--- | :--- | :--- |
| nRF24 Adapter | VCC | 5V | Feed from 5V, never a bare module |
| nRF24 Adapter | CE, CSN | D7, D8 | |
| Remote Stick L | Y, X | A0, A1 | |
| Receiver | D9 | FC Pin 8 | CH1 Roll |
| Receiver | D2 | FC Pin 9 | CH2 Pitch |
| MPU-6050 | SDA/SCL | A4/A5 | I2C |

### C. Build Stages → `project_steps`
The 9 stages will be inserted as 9 rows:
1. **Stage 1:** Is each nRF24 module alive? (Flash TX/RX test)
2. **Stage 2:** Does every control on the remote work?
3. **Stage 3:** Do the two radios really hear each other?
4. **Stage 4:** Receiver and servo outputs
5. **Stage 5:** Motor directions
6. **Stage 6:** Receiver into the flight controller
7. **Stage 7:** Is the gyro found? (0x68 vs 0x70)
8. **Stage 8:** Setup, ESC calibration and flight code
9. **Stage 9:** Bench arm test & first flight

### D. Troubleshooting → `project_troubleshooting`
The bullet points and the "ERROR 3" gyro problem will become structured rows:
| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| ERROR 3, no gyro found | Setup sketch expects 0x68, but GY-521 reports 0x70 | Search `search_gyro(0x68, 0x75)` and change 0x68 to 0x70 |
| LINK:LOST when servos move | Power dip browning out the radio | Give servos a separate 5V supply with common ground |
| Numbers change but servo doesn't move | Servo plugged into remote instead of receiver | The remote only reads inputs. Plug servo into receiver. |

---

### Execution Plan
1. Once you approve, I will run the SQL inserts to populate these tables for Project 12.
2. I will strip these sections (Wiring, Stages, Trouble) from the main `description` text.
3. I will create `StageCard`, `BomTable`, and `TroubleTable` components.
4. I will update `[slug].astro` to render these child tables if they exist, falling back to just the markdown blob for un-migrated projects.
