<div align="center">

# ⚡ Technical Triveni

**Where electronics, software, and AI converge.**

A production-grade platform for publishing electronics & tech projects with full
build details — schematics, source code, 3D files, a complete bill of materials
with affiliate links, and optional one-click paid "combos" of the project files.

Built to run **free, forever, always-on** on Cloudflare.

</div>

---

## What it does

- 🎬 A viewer sees a build on your **YouTube Short / Instagram reel**
- 🔎 They land on the project page for the **full breakdown** — free specs, wiring, parts
- 🛒 They buy the **combo** (code + schematics + 3D + guide) via **Razorpay**, and download instantly
- 🔧 They order the components through **your affiliate links**
- 🛠 You manage everything from a secure **admin panel** — no code needed

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (SSR) | Fast, SEO-first, ships almost no JS |
| Hosting | **Cloudflare Pages/Workers** | Free, always-on, global |
| Database | **Cloudflare D1** (SQLite) | Projects, orders, settings |
| File storage | **Cloudflare R2** | Private combo files + public media |
| Payments | **Razorpay** | UPI + cards, server-verified |
| Bot protection | **Cloudflare Turnstile** | Free, privacy-friendly |

## Features

- Premium dark, responsive design (mobile-first) in your **red/black/white** brand
- Project catalog with **search + category filters**
- Rich project pages: gallery, video, Markdown write-up, **BOM with affiliate links**,
  free downloads + locked combo
- **Razorpay checkout** with server-side signature verification + webhook backstop
- **Secure downloads** — private R2 bucket, token-gated per order
- **Admin panel**: dashboard, project editor (images/files/BOM/links), orders,
  messages, settings — all CSRF-protected behind hashed-password auth
- Senior-grade security: CSP with nonces, full security headers, PBKDF2 password
  hashing, HttpOnly/Secure/SameSite cookies, rate limiting, input validation
- SEO: sitemap, Open Graph, `Product` JSON-LD, per-page meta, `robots.txt`

---

## Run it locally

```bash
npm install
cp .dev.vars.example .dev.vars      # then edit values (see below)
npm run db:migrate:local            # create local tables
npm run db:seed:local               # add 4 sample projects
npm run dev                         # http://localhost:4321
```

**Local admin login:** set `ADMIN_EMAIL` and generate a hash for
`ADMIN_PASSWORD_HASH` in `.dev.vars`:

```bash
node scripts/hash-password.mjs "your-local-password"
```

Then visit `http://localhost:4321/admin`.

> Payments and Turnstile stay **off** locally unless you add real keys — the site
> is fully usable without them.

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for the complete, free, step-by-step Cloudflare
deployment (D1, R2, secrets, Razorpay, custom domain).

---

## Project structure

```
src/
├── layouts/        Base (public), Admin, Legal shells
├── components/     Logo, Header, Footer, ProjectCard, ProjectEditor, Icon
├── pages/
│   ├── index.astro                 Home
│   ├── projects/                   Catalog + [slug] detail
│   ├── about, contact              Marketing pages
│   ├── legal/                      Terms, Privacy, Refund, License
│   ├── account/download            Post-purchase file delivery
│   ├── admin/                      Dashboard, projects, orders, messages, settings
│   ├── media/[...key]              Serves R2 images
│   └── api/                        Razorpay, downloads, contact, admin endpoints
├── lib/            db, auth, crypto, razorpay, turnstile, upload, format, site
├── middleware.ts   Auth guard + security headers + CSP
└── styles/global.css   Design system (tokens, components)

migrations/         D1 schema
db/seed.sql         Sample data
scripts/            Password hasher + brand-asset generators
public/             Logo, favicons, OG image, sample covers
```

## Managing content

Everything dynamic is edited in **`/admin`** — no redeploys for content:

- **Projects** → create/edit, upload gallery + resource files, build the parts
  list, set the combo price, publish.
- **Orders** → see every paid order and gross revenue.
- **Messages** → contact-form submissions.
- **Settings** → announcement bar, contact email, integration status.

To change the brand name, socials, or nav, edit `src/lib/site.ts`.

---

<div align="center">
<sub>Built for makers. Electronics · Software · AI.</sub>
</div>
