# 🚀 Deploy Technical Triveni (free, always-on)

This guide takes you from zero to a live website on **Cloudflare's free tier**.
Your only paid item is a **domain name** (~₹800–1000/year). Everything else —
hosting, database, file storage, bandwidth — is free and never sleeps.

> Do the steps in order. Copy-paste the commands. It takes about 30–45 minutes
> the first time.

---

## What you need first

1. **A Cloudflare account** — free: https://dash.cloudflare.com/sign-up
2. **A Razorpay account** — free to create, ~2% fee per sale only:
   https://razorpay.com (needed to accept payments)
3. **Node.js 20+** installed on your computer: https://nodejs.org
4. A **domain name** (buy from Cloudflare Registrar, GoDaddy, Namecheap, etc.).
   You can deploy and test on the free `*.pages.dev` URL first and add the
   domain later.

---

## Step 1 — Install & log in

Open a terminal in this project folder and run:

```bash
npm install
npx wrangler login
```

`wrangler login` opens your browser — approve access to your Cloudflare account.

---

## Step 2 — Create the database (D1)

```bash
npx wrangler d1 create triveni-db
```

It prints a block like:

```
[[d1_databases]]
binding = "DB"
database_name = "triveni-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and paste it into `wrangler.toml`, replacing
`REPLACE_ME_AFTER_CREATING_D1`.

Now create the tables (and optionally the sample projects):

```bash
npm run db:migrate:remote
npm run db:seed:remote      # optional — adds 4 sample projects you can edit/delete
```

---

## Step 3 — Create file storage (R2)

```bash
npx wrangler r2 bucket create triveni-files
npx wrangler r2 bucket create triveni-media
```

- `triveni-files` = private paid files (code, schematics, 3D, PDFs)
- `triveni-media` = project images shown on the site

(These bucket names already match `wrangler.toml` — nothing to edit.)

> **Optional — bot-protection rate limiting (KV):**
> ```bash
> npx wrangler kv namespace create KV
> ```
> Paste the printed `id` into `wrangler.toml` and un-comment the
> `[[kv_namespaces]]` block. The site works fine without this.

---

## Step 4 — First deploy (creates your site)

```bash
npm run cf:deploy
```

This builds the site and uploads it. The first run creates a Pages project
named **technical-triveni** and gives you a live URL like
`https://technical-triveni.pages.dev`. Open it — the public site works already.
(The admin login won't work yet — that needs the secrets in the next step.)

---

## Step 5 — Set your secrets

Secrets are encrypted values that never live in your code. Set each one with
`wrangler pages secret put NAME` (it asks you to paste the value).

**5a. Session secret** (signs logins). Generate a random one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copy the output, then:

```bash
npx wrangler pages secret put SESSION_SECRET --project-name technical-triveni
```

**5b. Admin login.** Choose your email + a strong password, then create the hash:

```bash
node scripts/hash-password.mjs "your-strong-password"
```

Set both:

```bash
npx wrangler pages secret put ADMIN_EMAIL --project-name technical-triveni
npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name technical-triveni
```

(Paste your email for the first, and the printed `pbkdf2$...` hash for the second.)

**5c. Razorpay** (from Razorpay Dashboard → Settings → API Keys → Generate):

```bash
npx wrangler pages secret put RAZORPAY_KEY_ID --project-name technical-triveni
npx wrangler pages secret put RAZORPAY_KEY_SECRET --project-name technical-triveni
```

Then in `wrangler.toml`, change `RAZORPAY_ENABLED = "false"` to `"true"`.

**5d. (Optional) Turnstile** — free bot protection for the contact form & login.
Create a widget at Cloudflare Dashboard → Turnstile, then:

```bash
npx wrangler pages secret put TURNSTILE_SITE_KEY --project-name technical-triveni
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name technical-triveni
```

And set `TURNSTILE_ENABLED = "true"` in `wrangler.toml`.

**5e. Redeploy** so the new settings take effect:

```bash
npm run cf:deploy
```

Now visit `https://…pages.dev/admin/login` and sign in. 🎉

---

## Step 6 — Razorpay webhook (recommended)

This confirms payments even if a customer closes their browser mid-payment.

1. Razorpay Dashboard → Settings → **Webhooks** → Add New Webhook.
2. URL: `https://YOUR-DOMAIN/api/razorpay/webhook`
3. Choose events: **payment.captured** and **order.paid**.
4. Set a **secret** (any strong string). Then:
   ```bash
   npx wrangler pages secret put RAZORPAY_WEBHOOK_SECRET --project-name technical-triveni
   ```
   Paste the same secret. Redeploy.

---

## Step 7 — Connect your domain

1. In Cloudflare Dashboard → **Workers & Pages** → your `technical-triveni`
   project → **Custom domains** → add your domain (e.g. `technicaltriveni.com`).
2. If your domain isn't on Cloudflare yet, it walks you through pointing your
   nameservers to Cloudflare (free). DNS + SSL are automatic.
3. Update `SITE_URL` in `wrangler.toml` to your real domain
   (e.g. `https://technicaltriveni.com`), update the `Sitemap:` line in
   `public/robots.txt`, then redeploy: `npm run cf:deploy`.

---

## Step 8 — Add your real content

1. Log in at `/admin`.
2. **Delete the sample projects** (or edit them) and create your own.
3. For each project: add gallery images, upload the combo files (code,
   schematic, 3D), build the parts list with **your affiliate links**, set the
   price, and hit **Publish**.
4. Replace your affiliate links in the parts list with your real ones
   (Amazon Associates, Robu, etc.).

---

## Everyday updates

- **Content** (projects, prices, images, orders): all from `/admin`. No redeploy.
- **Code/design changes**: edit files, then `npm run cf:deploy`.
- **Change admin password**: `node scripts/hash-password.mjs "new-pass"` then
  `npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name technical-triveni`.

---

## Notes

- The build shows *"Enabling sessions with the SESSION KV binding."* You can
  ignore it — this app uses its own secure cookie sessions and does not require
  that binding.
- Free-tier limits are generous (D1: 5 GB + 5M reads/day, R2: 10 GB + free
  egress, Pages: unlimited requests). You'd need serious traffic to exceed them.
- Keep your `.dev.vars` file private — it's already git-ignored.
