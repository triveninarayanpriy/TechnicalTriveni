UPDATE projects SET 
  prereqs_json = '["Soldering basic wires", "Arduino IDE installation"]',
  outcomes_json = '["Build a custom 6-channel remote", "Wire a flight controller from scratch", "Learn NRF24 radio pairing"]',
  not_included_json = '["LiPo Battery Charger", "Soldering Iron", "Tools"]',
  faq_json = '[{"q":"Can I use an Arduino Uno for the remote?", "a":"Yes. A7 does not exist on the Uno, so move AUX2 to A5."},{"q":"Why is auto-acknowledge off?", "a":"The remote streams one-way without waiting for replies, which keeps latency low."},{"q":"Can I use this receiver with Betaflight or iNav?", "a":"Not directly. It outputs six separate PWM signals."}]'
WHERE id = 12;
