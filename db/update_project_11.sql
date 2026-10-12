UPDATE projects SET 
  summary = 'Comprehensive visual guide and reference handbook covering 100+ essential active, passive, and electromechanical components.',
  description = '## Overview

A complete reference guide for electronics hobbyists, students, and makers. This guide breaks down over 100 essential electronic components—ranging from fundamental passive elements like resistors and inductors to active semiconductor devices, ICs, sensors, and power management modules.

### What is Inside:
- Component symbols and high-resolution pinout diagrams
- Operating principles and typical circuit applications
- Voltage/current ratings and selection guidelines
- Practical tips for breadboard prototyping and debugging'
WHERE id = 11;

UPDATE project_files SET kind = 'doc', label = '100+ Electronics Components Guide (PDF)' WHERE id = 37;
