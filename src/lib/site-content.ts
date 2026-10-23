import type { D1Database } from '@cloudflare/workers-types';
import { getSetting, setSetting } from './db';

export interface AboutHeroData {
  eyebrow: string;
  headline: string;
  intro: string;
  credentials: string[];
  btn1_text: string;
  btn1_url: string;
  btn2_text: string;
  btn2_url: string;
  badge_text: string;
  name: string;
}

export interface AboutNumbersData {
  stat3_val: string;
  stat3_label: string;
  stat4_val: string;
  stat4_label: string;
}

export interface AboutStoryData {
  eyebrow: string;
  heading: string;
  pull_quote: string;
  body_md: string;
}

export interface AboutStepItem {
  icon: string;
  title: string;
  text: string;
}

export interface AboutWorkbenchData {
  project_slugs: string[];
}

export interface AboutExpectItem {
  icon: string;
  title: string;
  text: string;
}

export interface AboutWorkWithMeData {
  heading: string;
  text: string;
  btn_text: string;
  btn_url: string;
}

export interface AboutCtaData {
  heading: string;
  subline: string;
  btn1_text: string;
  btn1_url: string;
  btn2_text: string;
  btn2_url: string;
}

export interface AboutPageData {
  hero: AboutHeroData;
  numbers: AboutNumbersData;
  story: AboutStoryData;
  steps: AboutStepItem[];
  workbench: AboutWorkbenchData;
  expect_cards: AboutExpectItem[];
  work_with_me: AboutWorkWithMeData;
  cta: AboutCtaData;
}

export const DEFAULT_ABOUT_DATA: AboutPageData = {
  hero: {
    eyebrow: 'About Technical Triveni',
    headline: "Hi, I'm Triveni. I build, break, fix and document electronics projects.",
    intro: "I'm a BTech ECE (VLSI) student at NIT Patna. Every pack on this site is built and tested on my workbench before you ever see it.",
    credentials: ['NIT Patna, ECE (VLSI)', 'Manager, Innovation Hub', 'Hindi and English videos'],
    btn1_text: 'Browse projects',
    btn1_url: '/projects',
    btn2_text: 'Watch on YouTube',
    btn2_url: 'https://youtube.com/@TechnicalTriveni',
    badge_text: 'Maker and developer',
    name: 'Triveni Narayan Priy',
  },
  numbers: {
    stat3_val: '100%',
    stat3_label: 'Tested on real hardware',
    stat4_val: '1',
    stat4_label: 'Maker answering your emails',
  },
  story: {
    eyebrow: 'My story',
    heading: 'Why I started Technical Triveni',
    pull_quote: "I was tired of electronics tutorials that don't actually work.",
    body_md: `Most guides online leave out critical pinouts, skip power decoupling, or share untested code that throws errors the moment you clone it.

So I started building the projects myself, on a real breadboard or PCB, and fixing every problem until the build actually worked. Then I filmed it and wrote it all down: the code, the wiring, the parts.

Technical Triveni is built on a single promise: **complete transparency and physical proof.**`,
  },
  steps: [
    {
      icon: 'cube',
      title: 'Build it',
      text: 'On a real breadboard or PCB, programmed and powered up.',
    },
    {
      icon: 'tool',
      title: 'Test and fix',
      text: 'Bench-test it, hit the errors, fix them, repeat.',
    },
    {
      icon: 'video',
      title: 'Film it',
      text: 'The full build, no secrets, on YouTube, step-by-step.',
    },
    {
      icon: 'book',
      title: 'Document it',
      text: 'Code, wiring tables and parts links, ready to follow.',
    },
  ],
  workbench: {
    project_slugs: [
      'arduino-drone',
      'esp32-blynk-iot-smart-relay-switch',
      'line-following-robot-arduino-obstacle-gate',
      '100-electronics-components',
    ],
  },
  expect_cards: [
    {
      icon: 'shield',
      title: 'Nothing untested',
      text: 'Every pack was built and bench-tested before any file is released.',
    },
    {
      icon: 'book',
      title: 'Everything documented',
      text: 'You get every wiring diagram, pinout and parts links in the project.',
    },
    {
      icon: 'mail',
      title: 'A real person replies',
      text: "Questions go straight to me. Include your order ID and I'll help.",
    },
  ],
  work_with_me: {
    heading: 'Work with me',
    text: 'Sponsorships, part reviews and affiliate partnerships. Mention "Sponsorship" in the subject line. I usually reply within 24 to 48 business hours.',
    btn_text: 'Get in touch',
    btn_url: '/contact',
  },
  cta: {
    heading: 'Start with a free pack',
    subline: 'No signup, no email. Download the code and guide, then build.',
    btn1_text: 'Free downloads',
    btn1_url: '/projects?price=free',
    btn2_text: 'Browse all projects',
    btn2_url: '/projects',
  },
};

export async function getAboutPageData(db: D1Database): Promise<AboutPageData> {
  try {
    const raw = await getSetting(db, 'page_about_data');
    if (!raw) return DEFAULT_ABOUT_DATA;
    const parsed = JSON.parse(raw);
    return {
      hero: { ...DEFAULT_ABOUT_DATA.hero, ...(parsed.hero || {}) },
      numbers: { ...DEFAULT_ABOUT_DATA.numbers, ...(parsed.numbers || {}) },
      story: { ...DEFAULT_ABOUT_DATA.story, ...(parsed.story || {}) },
      steps: Array.isArray(parsed.steps) && parsed.steps.length === 4 ? parsed.steps : DEFAULT_ABOUT_DATA.steps,
      workbench: {
        project_slugs: Array.isArray(parsed.workbench?.project_slugs) && parsed.workbench.project_slugs.length > 0
          ? parsed.workbench.project_slugs
          : DEFAULT_ABOUT_DATA.workbench.project_slugs,
      },
      expect_cards: Array.isArray(parsed.expect_cards) && parsed.expect_cards.length === 3
        ? parsed.expect_cards
        : DEFAULT_ABOUT_DATA.expect_cards,
      work_with_me: { ...DEFAULT_ABOUT_DATA.work_with_me, ...(parsed.work_with_me || {}) },
      cta: { ...DEFAULT_ABOUT_DATA.cta, ...(parsed.cta || {}) },
    };
  } catch {
    return DEFAULT_ABOUT_DATA;
  }
}

export async function saveAboutPageData(db: D1Database, data: AboutPageData): Promise<void> {
  await setSetting(db, 'page_about_data', JSON.stringify(data));
}

export interface HomeHeroData {
  eyebrow: string;
  headline: string;
  subline: string;
  btn1_text: string;
  btn1_url: string;
  btn2_text: string;
  btn2_url: string;
  proof_ticks: string[];
  featured_pack_slug: string;
}

export interface HomeFeaturedProjectsData {
  mode: 'auto' | 'manual';
  project_slugs: string[];
}

export interface HomeFeaturedVideoItem {
  title: string;
  url: string;
  thumbnail_override?: string;
}

export interface HomePageData {
  hero: HomeHeroData;
  featured_projects: HomeFeaturedProjectsData;
  featured_videos: HomeFeaturedVideoItem[];
}

export const DEFAULT_HOME_DATA: HomePageData = {
  hero: {
    eyebrow: 'Free and paid project packs for makers',
    headline: 'Engineering project packs you can <span class="text-red">actually build.</span>',
    subline: 'Tested code, wiring tables and parts links for every project, plus a build video so you see it working first.',
    btn1_text: 'Browse all projects',
    btn1_url: '/projects',
    btn2_text: 'Free downloads',
    btn2_url: '/projects?price=free',
    proof_ticks: [
      'Built and tested on real hardware',
      'Build video for every pack',
      'Instant download',
    ],
    featured_pack_slug: 'arduino-drone',
  },
  featured_projects: {
    mode: 'auto',
    project_slugs: [
      'esp32-blynk-iot-smart-relay-switch',
      'line-following-robot-arduino-obstacle-gate',
      '100-electronics-components',
      'free-tools-for-students-india-2026',
    ],
  },
  featured_videos: [
    {
      title: 'ESP32 Blynk IoT Smart Relay Switch',
      url: 'https://youtube.com/shorts/ygvydFjRUxg?si=RyVZypgjvHOJIWnN',
    },
    {
      title: 'DIY Arduino Drone Bring-Up',
      url: 'https://www.youtube.com/shorts/_qTc_ee3ZF0',
    },
    {
      title: 'Line-Following Robot with Gate',
      url: 'https://youtube.com/@TechnicalTriveni',
    },
  ],
};

export async function getHomePageData(db: D1Database): Promise<HomePageData> {
  try {
    const raw = await getSetting(db, 'page_home_settings');
    if (!raw) return DEFAULT_HOME_DATA;
    const parsed = JSON.parse(raw);
    return {
      hero: { ...DEFAULT_HOME_DATA.hero, ...(parsed.hero || {}) },
      featured_projects: { ...DEFAULT_HOME_DATA.featured_projects, ...(parsed.featured_projects || {}) },
      featured_videos: Array.isArray(parsed.featured_videos) && parsed.featured_videos.length === 3
        ? parsed.featured_videos
        : DEFAULT_HOME_DATA.featured_videos,
    };
  } catch {
    return DEFAULT_HOME_DATA;
  }
}

export async function saveHomePageData(db: D1Database, data: HomePageData): Promise<void> {
  await setSetting(db, 'page_home_settings', JSON.stringify(data));
}

