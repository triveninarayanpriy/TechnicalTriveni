INSERT INTO settings (key, value) VALUES ('site_announcement', 'Need help with an order? Email technicaltriveniyt@gmail.com')
ON CONFLICT(key) DO UPDATE SET value = 'Need help with an order? Email technicaltriveniyt@gmail.com';

INSERT INTO settings (key, value) VALUES ('announcement_enabled', '0')
ON CONFLICT(key) DO NOTHING;
