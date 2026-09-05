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
  email: 'hello@technicaltriveni.com',
  /** The three "streams" of the Triveni brand — Electronics · Software · AI. */
  streams: [
    { key: 'electronics', label: 'Electronics', blurb: 'Circuits, PCBs & real components.' },
    { key: 'software', label: 'Software', blurb: 'Firmware & code that just works.' },
    { key: 'ai', label: 'AI', blurb: 'Smart features that set builds apart.' },
  ],
  socials: {
    youtube: 'https://youtube.com/@TechnicalTriveni',
    instagram: 'https://instagram.com/technicaltriveni',
    // Add more as you grow:
    github: '',
    x: '',
  },
} as const;

/** Primary navigation shown in the header. */
export const NAV: { label: string; href: string }[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/** Footer link groups. */
export const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'All projects', href: '/projects' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Refund Policy', href: '/legal/refund' },
      { label: 'Licensing', href: '/legal/license' },
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
