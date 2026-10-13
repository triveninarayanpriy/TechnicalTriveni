INSERT INTO project_troubleshooting (project_id, symptom, cause, fix, sort) VALUES 
(1, 'I2C Sensor BME280 not detected (0x76 or 0x77 address error)', '', 'Run the I2C scanner sketch to confirm device address. Ensure SDA connects to GPIO21 and SCL connects to GPIO22 on ESP32.', 0),
(1, 'ESP32 resets repeatedly with ''Brownout detector was triggered''', 'Current spike during 2.4GHz WiFi transmission causes 3.3V rail voltage sag', 'Connect a 100uF or 470uF electrolytic capacitor directly between 3V3 and GND, or power ESP32 from an external 5V/2A supply.', 1);
