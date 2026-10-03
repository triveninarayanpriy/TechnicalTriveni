UPDATE bom_items SET is_required = 0 WHERE project_id = 12 AND name IN (
  'LiPo Balance Charger (iMAX B6 type)',
  'LiPo Safe Bag',
  'LiPo Voltage Alarm (1–8S)',
  'Soldering Iron Kit, Heat Shrink, Zip Ties',
  'Multimeter'
);
