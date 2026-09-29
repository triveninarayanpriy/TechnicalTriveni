/**
 * Central site configuration.
 * Edit brand text, links, and socials here — these are the values that are
 * safe to hard-code. Dynamic content (projects, prices, orders) lives in the
 * database and is managed from the admin panel.
 */

export const SITE = {
  name: 'Technical Triveni',
  shortName: 'Triveni',
  /** Confluence metaphor: three streams meeting — the brand's core idea. */
  tagline: 'Where electronics, software, and AI converge.',
  description:
    'Build real electronics projects the right way. Every project on Technical Triveni ships with full schematics, circuit diagrams, source code, 3D files, a complete bill of materials, and direct component links — plus optional done-for-you resource combos.',
  /** Short one-liner for social cards. */
  ogDescription:
    'Full build details, schematics, code, and resources for electronics & tech projects — from the Technical Triveni channel.',
  locale: 'en_IN',
  currency: 'INR',
  currencySymbol: '₹',
  email: 'technicaltriveniyt@gmail.com',
  /** The three "streams" of the Triveni brand — Electronics · Software · AI. */
  streams: [
    { key: 'electronics', label: 'Electronics', blurb: 'Circuits, PCBs & real components.' },
    { key: 'software', label: 'Software', blurb: 'Firmware & code that just works.' },
    { key: 'ai', label: 'AI', blurb: 'Smart features that set builds apart.' },
  ],
  socials: {
    youtube: 'https://youtube.com/@TechnicalTriveni',
    instagram: 'https://instagram.com/technicaltriveni',
    github: 'https://github.com/triveninarayanpriy',
    linkedin: 'https://linkedin.com/in/triveninarayanpriy',
    x: '',
  },
} as const;

/**
 * The person behind the channel — powers the About page.
 * Replace the photo by dropping your image at `public/brand/profile.jpg`.
 */
export const PROFILE = {
  name: 'Triveni Narayan Priy',
  pronouns: 'He/Him',
  role: 'Founder · Technical Triveni',
  title: 'B.Tech ECE (VLSI), NIT Patna · Manager, Innovation Hub NIT Patna',
  location: 'Patna, Bihar, India',
  photo: '/brand/profile.jpg',
  lead:
    "I'm Triveni — a B.Tech ECE (VLSI) student at NIT Patna. Every electronics, software and AI project on Technical Triveni is built and tested by me.",
  bio: [
    'I study Electronics & Communication Engineering (VLSI) at the National Institute of Technology, Patna (CGPA 8.05). I came in as State Rank 10 and Rohtas District Topper in the Bihar Board 2022 — and I like turning what I learn into things that actually work.',
    'My interests span VLSI design, IoT, AI/ML and app development. I build hands-on hardware — Arduino & ESP32 projects, home automation, remote-control systems and robots — alongside cross-platform apps with Flutter and Django.',
    'I serve as Manager of the Innovation Hub at NIT Patna, co-founded the Samvad Debate Club, and volunteer with Sankalp (NSS). I was selected in the Internal Round of Smart India Hackathon 2025, and I freelance as a subject-matter expert with Physics Wallah — which keeps my fundamentals sharp and my explanations clear.',
  ],
  skills: [
    'VLSI Design', 'Embedded Systems', 'IoT', 'Arduino', 'ESP32', 'Robotics',
    'AI / ML', 'Flutter', 'Python', 'C', 'Django', 'Home Automation',
  ],
  highlights: [
    { value: '8.05', label: 'CGPA · NIT Patna' },
    { value: 'Rank 10', label: 'Bihar Board 2022' },
    { value: 'Manager', label: 'Innovation Hub NITP' },
    { value: 'SIH 2025', label: 'Internal round' },
  ],
  channel: [
    'Hardware — Arduino, ESP32, IoT, home automation & robotics',
    'Software — Python, C, Flutter apps & AI-assisted development',
    'AI tools & agents that are genuinely useful for students and engineers',
    'Engineering guidance — VLSI, projects, placements & NIT student life',
  ],
  mission:
    "YouTube shows the highlight reel. Technical Triveni is the permanent, searchable home for the full build — every schematic, wiring table, parts list and line of code — so that a student who pauses a video can actually finish the project. Free to learn from, honest about cost and risk, and built to last.",
  experience: [
    { role: 'Manager, Innovation Hub', org: 'NIT Patna', note: 'Student-led hardware & prototyping space' },
    { role: 'Co-founder', org: 'Samvad Debate Club', note: 'NIT Patna' },
    { role: 'Volunteer', org: 'Sankalp (NSS)', note: 'Community & outreach' },
    { role: 'Subject-matter expert (freelance)', org: 'Physics Wallah', note: 'Keeps the fundamentals sharp' },
    { role: 'Selected — Internal Round', org: 'Smart India Hackathon 2025', note: '' },
  ],
} as const;

/** Primary navigation shown in the header. */
export const NAV: { label: string; href: string }[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'My purchases', href: '/account/downloads' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/** Footer link groups. */
export const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'All projects', href: '/projects' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'My downloads', href: '/account/downloads' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Disclaimer', href: '/legal/disclaimer' },
      { label: 'Affiliate Disclosure', href: '/legal/affiliate' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'Refund Policy', href: '/legal/refund' },
    ],
  },
];

/** Difficulty levels used by project cards & filters. */
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** File categories for the resources shown on a project page. */
export const FILE_KINDS = [
  { key: 'code', label: 'Source code', icon: 'code' },
  { key: 'schematic', label: 'Schematic', icon: 'schematic' },
  { key: 'pcb', label: 'PCB / Gerber', icon: 'pcb' },
  { key: 'model3d', label: '3D files', icon: 'cube' },
  { key: 'doc', label: 'Documentation', icon: 'doc' },
  { key: 'other', label: 'Other', icon: 'file' },
] as const;
export type FileKind = (typeof FILE_KINDS)[number]['key'];
