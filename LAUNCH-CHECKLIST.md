# 🏁 Technical Triveni — Launch Checklist

Everything left to go from "built" to "live and selling", who does each part, and
exactly how. Tick items as you go.

**Legend:** 🧑 = you do it · 🤖 = Claude can do it for you · 🧑🤖 = together

---

## ✅ Already done (by Claude)
- [x] Full website (public pages, project catalog, project pages)
- [x] Admin panel (projects, orders, messages, settings)
- [x] Razorpay checkout + secure downloads + webhook
- [x] Security hardening, SEO, legal pages
- [x] Your TT logo recreated as vector + favicons + social image
- [x] 4 sample projects, docs (README, DEPLOY), tested end-to-end

---

## PHASE 1 — Accounts & domain  🧑 (only you can — needs your identity/payment)

- [ ] **1.1 Install Node.js 20+** (if not already) — https://nodejs.org (LTS)
- [ ] **1.2 Create a Cloudflare account** (free) — https://dash.cloudflare.com/sign-up
- [ ] **1.3 Create a Razorpay account** — https://razorpay.com/
      - You can use **Test Mode** immediately to try payments.
      - To take **real money** you must finish **KYC** (business/PAN + bank account) in the Razorpay dashboard. This can take 1–2 days to approve.
- [ ] **1.4 Buy a domain** (≈₹800–1000/yr). Options:
      - Cloudflare Registrar (cheapest, inside the Cloudflare dashboard) — recommended
      - Namecheap https://www.namecheap.com · GoDaddy · Hostinger · BigRock
      - Tip: `technicaltriveni.com` or `.in` if available.

> While Razorpay KYC is pending, you can still deploy and sell **nothing yet** —
> or launch in "affiliate-only" mode (projects free, components via your links).

---

## PHASE 2 — Deploy to Cloudflare  🧑🤖

Do this in a terminal inside the project folder. **Full details in `DEPLOY.md`.**

- [ ] **2.1** `npm install`
- [ ] **2.2** `npx wrangler login`  🧑 (opens your browser — approve Cloudflare access)
- [ ] **2.3 Create the database** 🤖 (I can run these once you've done 2.2):
      ```bash
      npx wrangler d1 create triveni-db
      ```
      → copy the printed `database_id` into `wrangler.toml`
- [ ] **2.4 Create file storage** 🤖:
      ```bash
      npx wrangler r2 bucket create triveni-files
      npx wrangler r2 bucket create triveni-media
      ```
- [ ] **2.5 Create the tables + sample data** 🤖:
      ```bash
      npm run db:migrate:remote
      npm run db:seed:remote
      ```
- [ ] **2.6 First deploy** 🤖:
      ```bash
      npm run cf:deploy
      ```
      → gives you a live `https://technical-triveni.pages.dev` URL

---

## PHASE 3 — Secrets (login + payments)  🧑🤖

Set each with `npx wrangler pages secret put NAME --project-name technical-triveni`.

- [ ] **3.1 Session secret** 🤖 — I generate a random value, you set it:
      `SESSION_SECRET`
- [ ] **3.2 Admin login** 🧑🤖 — you pick a password, I make the hash:
      `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`
      (I run `node scripts/hash-password.mjs "your-password"`)
- [ ] **3.3 Razorpay keys** 🧑 — get from Razorpay Dashboard → **Settings → API Keys → Generate Key**:
      `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
      → then set `RAZORPAY_ENABLED = "true"` in `wrangler.toml`
- [ ] **3.4 (Optional) Turnstile** 🧑 — free bot protection. Cloudflare Dashboard → **Turnstile → Add widget**:
      `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` → set `TURNSTILE_ENABLED = "true"`
- [ ] **3.5 Redeploy** 🤖: `npm run cf:deploy`
- [ ] **3.6 Log in** at `https://…pages.dev/admin` ✅

---

## PHASE 4 — Domain + payment webhook  🧑🤖

- [ ] **4.1 Connect your domain** 🧑 — Cloudflare Dashboard → Workers & Pages →
      `technical-triveni` → **Custom domains** → add your domain (DNS + SSL auto).
- [ ] **4.2 Update the site URL** 🤖 — set `SITE_URL` in `wrangler.toml` to your real
      domain, update `public/robots.txt`, redeploy.
- [ ] **4.3 Razorpay webhook** 🧑 — Razorpay Dashboard → **Settings → Webhooks → Add**:
      - URL: `https://YOUR-DOMAIN/api/razorpay/webhook`
      - Events: `payment.captured`, `order.paid`
      - Secret: (any strong string) → set as `RAZORPAY_WEBHOOK_SECRET` 🤖, redeploy.

---

## PHASE 5 — Real content  🧑🤖 (via `/admin` — no coding)

- [ ] **5.1** Log in → delete/edit the 4 sample projects.
- [ ] **5.2** For each real project: title, summary, Markdown description, category,
      difficulty, price, YouTube link.
- [ ] **5.3** Upload **gallery photos** and **resource files** (code .zip, schematic
      .pdf, 3D .stl, guide .pdf).
- [ ] **5.4** Build the **parts list** with **your affiliate links** (see Phase 7).
- [ ] **5.5** Set the combo price, then **Publish**.

> 🤖 If you paste me a real project's details, I can pre-load it for you.

---

## PHASE 6 — Brand polish (optional)  🧑🤖

- [ ] **6.1 Your exact logo files** — if you want your original raster art used
      anywhere, save the files into `public/brand/` and tell me; I'll wire them in.
      (The current vector monogram already matches and is sharper on the web.)
- [ ] **6.2 Confirm your social links** — tell me your real YouTube & Instagram URLs
      and I'll set them (currently placeholders in `src/lib/site.ts`).
- [ ] **6.3 Review the legal pages** — Terms/Privacy/Refund have your details as
      placeholders; update with your real business name/entity.

---

## PHASE 7 — Affiliate links (your income)  🧑

- [ ] **7.1 Amazon Associates (India)** — https://affiliate-program.amazon.in
      (join, then create links for each component).
- [ ] **7.2 Other stores** — Robu.in, Quartzcomponents, etc., if they offer affiliate
      programs; otherwise use direct product links.
- [ ] **7.3** Paste each component's link into the project's parts list in `/admin`.

---

## PHASE 8 — Marketing loop  🧑

- [ ] **8.1** Add your **website link** to your YouTube channel & Instagram bio.
- [ ] **8.2** In every Short/reel, say "full details + files on the site" and pin the
      link in comments / use the link sticker.
- [ ] **8.3** Post a new build regularly; each one sends viewers to a project page.

---

## What I (Claude) can do next — just say the word
1. **git init + first commit** so you have version control / push-to-deploy ready.
2. **Run Phases 2–4 with you** once you've done `wrangler login`.
3. **Wire in your exact logo files** (after you drop them in `public/brand/`).
4. **Pre-load a real project** (paste me the details).
5. **Set your real YouTube/Instagram URLs.**

## What only you can do (I can't, by design)
- Create the Cloudflare / Razorpay accounts and complete **KYC**.
- **Buy the domain** and enter payment details.
- Approve `wrangler login` in your browser.
- Provide your **Razorpay API keys** (you paste them into `wrangler pages secret put`).
