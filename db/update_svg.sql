UPDATE projects SET description = REPLACE(REPLACE(description, '![System Architecture Diagram](/drone-arch.svg?v=2)', '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
  <div style="min-width: 900px;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
  <defs>
    <style>
      .box { fill: #f5f6f8; stroke: #111827; stroke-width: 2; rx: 8; }
      .text { font-family: ''Space Grotesk'', system-ui, sans-serif; font-size: 14px; fill: #111827; text-anchor: middle; }
      .text-bold { font-weight: 700; }
      .text-small { font-size: 12px; fill: #4b5563; }
      .line { fill: none; stroke: #e7242a; stroke-width: 2; marker-end: url(#arrow); }
      .line-dashed { fill: none; stroke: #e7242a; stroke-width: 2; stroke-dasharray: 6 4; marker-end: url(#arrow); }
      .label { font-family: ''Inter'', sans-serif; font-size: 12px; fill: #4b5563; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#e7242a" />
    </marker>
  </defs>

  <!-- Sticks/Inputs -->
  <rect x="50" y="30" width="160" height="50" class="box" />
  <text x="130" y="60" class="text text-bold">Sticks / Toggle / Pot</text>

  <!-- TX Nano -->
  <rect x="50" y="130" width="160" height="50" class="box" />
  <text x="130" y="160" class="text text-bold">TX Arduino Nano</text>
  
  <path d="M 130 80 L 130 120" class="line" />
  <text x="140" y="105" class="label">Analog/Digital In</text>

  <!-- RF Link -->
  <path d="M 210 155 L 430 155" class="line-dashed" />
  <text x="320" y="145" class="label text-bold" fill="#e7242a">nRF24L01+ (2.4 GHz)</text>
  <text x="320" y="170" class="label">Channel 108, 250 kbps</text>

  <!-- RX Nano -->
  <rect x="440" y="130" width="160" height="50" class="box" />
  <text x="520" y="160" class="text text-bold">RX Arduino Nano</text>

  <!-- Flight Controller -->
  <rect x="440" y="230" width="280" height="50" class="box" />
  <text x="580" y="260" class="text text-bold">Flight Controller: Uno + MPU-6050</text>
  
  <path d="M 520 180 L 520 220" class="line" />
  <text x="530" y="205" class="label">4× PWM (1000-2000µs)</text>

  <!-- ESCs -->
  <rect x="440" y="330" width="100" height="50" class="box" />
  <text x="490" y="360" class="text text-bold">4× ESC</text>

  <path d="M 490 280 L 490 320" class="line" />
  <text x="500" y="305" class="label">4× ESC Pulses</text>

  <!-- Motors -->
  <rect x="620" y="330" width="140" height="50" class="box" />
  <text x="690" y="360" class="text text-bold">4× Brushless Motor</text>

  <path d="M 540 355 L 610 355" class="line" />
</svg>

  </div>
</div>'), '![System Architecture Diagram](/drone-arch.svg)', '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
  <div style="min-width: 900px;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
  <defs>
    <style>
      .box { fill: #f5f6f8; stroke: #111827; stroke-width: 2; rx: 8; }
      .text { font-family: ''Space Grotesk'', system-ui, sans-serif; font-size: 14px; fill: #111827; text-anchor: middle; }
      .text-bold { font-weight: 700; }
      .text-small { font-size: 12px; fill: #4b5563; }
      .line { fill: none; stroke: #e7242a; stroke-width: 2; marker-end: url(#arrow); }
      .line-dashed { fill: none; stroke: #e7242a; stroke-width: 2; stroke-dasharray: 6 4; marker-end: url(#arrow); }
      .label { font-family: ''Inter'', sans-serif; font-size: 12px; fill: #4b5563; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#e7242a" />
    </marker>
  </defs>

  <!-- Sticks/Inputs -->
  <rect x="50" y="30" width="160" height="50" class="box" />
  <text x="130" y="60" class="text text-bold">Sticks / Toggle / Pot</text>

  <!-- TX Nano -->
  <rect x="50" y="130" width="160" height="50" class="box" />
  <text x="130" y="160" class="text text-bold">TX Arduino Nano</text>
  
  <path d="M 130 80 L 130 120" class="line" />
  <text x="140" y="105" class="label">Analog/Digital In</text>

  <!-- RF Link -->
  <path d="M 210 155 L 430 155" class="line-dashed" />
  <text x="320" y="145" class="label text-bold" fill="#e7242a">nRF24L01+ (2.4 GHz)</text>
  <text x="320" y="170" class="label">Channel 108, 250 kbps</text>

  <!-- RX Nano -->
  <rect x="440" y="130" width="160" height="50" class="box" />
  <text x="520" y="160" class="text text-bold">RX Arduino Nano</text>

  <!-- Flight Controller -->
  <rect x="440" y="230" width="280" height="50" class="box" />
  <text x="580" y="260" class="text text-bold">Flight Controller: Uno + MPU-6050</text>
  
  <path d="M 520 180 L 520 220" class="line" />
  <text x="530" y="205" class="label">4× PWM (1000-2000µs)</text>

  <!-- ESCs -->
  <rect x="440" y="330" width="100" height="50" class="box" />
  <text x="490" y="360" class="text text-bold">4× ESC</text>

  <path d="M 490 280 L 490 320" class="line" />
  <text x="500" y="305" class="label">4× ESC Pulses</text>

  <!-- Motors -->
  <rect x="620" y="330" width="140" height="50" class="box" />
  <text x="690" y="360" class="text text-bold">4× Brushless Motor</text>

  <path d="M 540 355 L 610 355" class="line" />
</svg>

  </div>
</div>') WHERE id = 12;
