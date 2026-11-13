# Zunora dry fruits commerce

A production-oriented Next.js 14 App Router storefront for premium dry fruits, with a configurable brand file, catalog, cart, checkout, auth, Prisma data model, admin dashboard, and SEO endpoints.

## Stack

- Next.js 14, React, TypeScript
- Tailwind CSS with local shadcn-style UI primitives
- Prisma + PostgreSQL
- NextAuth credentials auth with optional Google provider
- Zustand persisted cart
- Zod + React Hook Form
- COD checkout and Razorpay configuration placeholders
- EmailJS order confirmation hook with SMTP fallback
- Recharts admin dashboard

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables in PowerShell:

```bash
Copy-Item .env.example .env
```

3. Edit `.env` and set `DATABASE_URL` to a PostgreSQL database that exists, set a private random `NEXTAUTH_SECRET`, and set `NEXTAUTH_URL` to the URL and port the app uses (for example, `http://localhost:3001`).

For Vercel, set `NEXTAUTH_URL` to the exact public site origin (for example, `https://your-project.vercel.app`, with no path or port), and set it in the same deployment environment as the site. Do not use a localhost URL in Vercel. Redeploy after changing environment variables.

### Google sign-in redirect

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the same environment as the app. In Google Cloud Console, add this exact URI under the OAuth client's **Authorized redirect URIs**:

`<NEXTAUTH_URL>/api/auth/callback/google`

The URI must use the same scheme, hostname, and port as `NEXTAUTH_URL`. Add every environment you use to the same Google OAuth client; local and production redirect URIs can both be registered. For the local `.env` example using port 3001, add `http://localhost:3001/api/auth/callback/google`. For production on Vercel, this app uses the stable `VERCEL_PROJECT_PRODUCTION_URL` host so OAuth does not use a deployment-specific preview URL; add `https://zunora.vercel.app/api/auth/callback/google` for the current production domain. The deployed `GOOGLE_CLIENT_ID` must belong to this same OAuth client. Save the Google OAuth client settings, then restart locally or redeploy after changing environment variables.

Checkout's map pin coordinates are stored with the delivery address. The additive SQL change is in `prisma/manual-migrations/20261113_add_address_coordinates.sql`; apply it to the target database before deploying code that writes coordinates. The production database has legacy objects not represented in the Prisma schema, so review `prisma migrate diff` before using `db:push` against it; a blind push would drop those objects.

4. Create the database if needed, then generate Prisma and push the schema:

```bash
createdb nutrinest
npm run db:generate
npm run db:push
```

On Windows, if `createdb` is unavailable, create the database named in `DATABASE_URL` using pgAdmin or PostgreSQL's SQL shell before running the Prisma commands.

5. Seed the catalog and demo data:

```bash
npm run db:seed
```

For local development only, create the demo admin explicitly:

```bash
npm run db:seed -- --demo-admin
```

Demo admin credentials:

- Email: `admin@zunora.example`
- Password: `ChangeMe123!`

Run `npm run db:seed` to create or reset this local demo admin account. After signing in, admin accounts open the dashboard automatically at `/admin`. The demo account uses a known password and must never be created in production. Create a separate admin account and grant it the `ADMIN` role securely for production.

6. Start development:

```bash
npm run dev
```

## Brand configuration

All replaceable brand values live in [config/site.ts](config/site.ts):

- name, tagline, logo text
- colors
- contact details
- social links
- GST and FSSAI numbers
- shipping fee, free shipping threshold, GST rate

## Key routes

- `/` storefront home
- `/shop` searchable, filterable product grid
- `/product/[slug]` product detail with JSON-LD
- `/cart` full cart
- `/checkout` checkout flow
- `/account` customer account
- `/admin` protected admin dashboard
- `/admin/products` admin product table/editor
- `/api/admin/orders-export` protected order CSV export
- `/sitemap.xml` dynamic sitemap
- `/robots.txt` robots rules

## Production notes

- Use managed PostgreSQL for `DATABASE_URL`.
- Set `NEXT_PUBLIC_SITE_URL` to your public canonical HTTPS domain (for example, `https://www.example.com`) in Vercel so canonical links, structured data, and the sitemap point to the production site.
- After deploying the launch catalog changes, run `npm run db:seed` with `DATABASE_URL` set to the Render database. This upserts the new 25 g cashew SKUs and the 15 g zero-price gift SKU; it preserves existing order items, reviews, and on-hand variant stock. New SKUs start with the stock configured in `lib/catalog.ts` and should be checked against physical inventory before accepting orders.
- Verify the production domain as a Domain property in Google Search Console, submit `https://zunora.vercel.app/sitemap.xml`, and inspect/request indexing for the home page, `/dry-fruits-belgaum`, the shop page, and each product URL. The code publishes a sitemap and `robots.txt` already references it. A sitemap is a crawl hint, not an indexing or ranking guarantee.
- Keep the public business name, phone, email, address, and site URL consistent across the Contact page, Organization structured data, and any public business listings. Create a Google Business Profile only if Zunora meets Google's in-person customer-contact eligibility; online-only businesses aren't eligible.
- Set a strong `NEXTAUTH_SECRET`.
- Backend protections now include PostgreSQL-backed request throttles, size-limited request parsing, bounded input validation, generic signup/reset responses, one-time hashed reset tokens that expire after 30 minutes, password-reset session revocation, 12-hour JWT sessions, current database role checks for admin pages, and security response headers including a restrictive CSP for framing, objects, base URLs, and form targets. These changes add `authVersion`, `RateLimitBucket`, and `PasswordResetToken`. Before deploying, back up the target database and review/apply `prisma/manual-migrations/20261114_backend_security.sql`; do not run `db:push` blindly on the existing production database. The app fails closed for throttled endpoints if the rate-limit table is missing. Configure SMTP for password-reset emails; they use SMTP rather than the order EmailJS template. New account passwords require 12 characters; existing accounts can still sign in with their current password. Existing sessions will need to sign in again after this migration.
- To enable consent-based Google Analytics 4, set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your GA4 measurement ID (for example, `G-XXXXXXXXXX`). Analytics will not load until a visitor accepts analytics cookies; visitors can reject or change their choice through Cookie settings. If the variable is blank, analytics and the cookie prompt remain disabled.
- For free-tier email delivery, create an EmailJS account, connect and verify an email service, then create an order-confirmation template. Set the template's **To Email** to `{{to_email}}`, its subject to `{{email_subject}}`, and its HTML body to `{{{invoice_html}}}`. For the plain-text body, use `{{invoice_text}}` if the template editor supports one. Add the service ID, template ID, and public key to `.env` as `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY`. `EMAILJS_PRIVATE_KEY` is optional and can be set for server-side API authentication. These values are only read by the server; do not prefix them with `NEXT_PUBLIC_`. EmailJS is tried first when configured; if it fails, configured SMTP is tried automatically.
- The invoice includes order items, shipping address, payment status, tax, shipping, discount, and total. Email delivery failures are logged and shown on the order confirmation page without discarding the order. The EmailJS REST API allows one send request per second and the free plan has a monthly quota, so check the current limits in your EmailJS account.
- As an alternative or fallback, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and a verified `SMTP_FROM` address in `.env` (not `.env.example`). For Gmail SMTP, use `SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT="465"` or `"587"`, the sending Gmail address as `SMTP_USER`, and a Google app password as `SMTP_PASS` (not the account password). Spaces in Gmail's grouped app-password display are ignored. Keep provider credentials private in `.env`, restart the app, and place a test COD order to verify delivery.
- Configure fulfillment capacity before advertising the 12-hour dispatch estimate. For prepaid orders the estimate starts after successful payment; for COD orders it starts after order confirmation.
- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure the provider webhook URL as `/api/razorpay` and subscribe to `payment.captured` and `payment.failed`.
- For production schema changes, compare the live database with `prisma/schema.prisma` first and use reviewed, additive migrations. Do not run `npm run db:push` blindly against the current production database because its schema includes legacy objects absent from Prisma.
- For a new production database, run `npm run db:push` and then `npm run db:seed` from a trusted environment with `DATABASE_URL` set to the Render External Database URL. `db:seed` initializes catalog data but does not create the demo admin unless `--demo-admin` is explicitly supplied. Back up existing production data before seeding because seeded catalog entries are updated to match the local catalog.
- Test online payments in Razorpay test mode and configure automatic capture before accepting live payments.
- Connect Cloudinary upload endpoints before enabling admin image uploads.
- Deploy on Vercel or use the Docker + Nginx self-hosting path below. Nginx runs on a Linux VPS and proxies HTTPS requests to the Next.js server; it is not part of Vercel deployments.

## Self-host with Docker and Nginx

The backend is already in this Next.js application: `/api/*` route handlers implement authentication, checkout, orders, payments, product data, and admin actions. Prisma stores accounts, addresses, orders, and catalog data in PostgreSQL. Nginx is the public HTTPS reverse proxy; it does not replace the app backend or database.

This path needs a Linux VPS with a public IPv4 address, Docker Compose, a domain you control, and a PostgreSQL database reachable from the VPS (managed PostgreSQL is recommended). Point the domain's DNS A record to the VPS. If the current site uses a `*.vercel.app` hostname, that hostname cannot be repointed; use a custom domain you control.

1. Install Docker Engine with the Compose plugin, Nginx, and Certbot on the VPS. Open inbound ports 80 and 443 in the VPS firewall. Keep port 3000 private; Compose binds it to localhost.
2. Copy the repository to the VPS and create `.env.production` beside `docker-compose.yml`. Start from `.env.example`, then set production values. This file is ignored by Git and Docker build context. At minimum set:

   - `DATABASE_URL` to the production PostgreSQL URL, including `sslmode=require` when required by the database provider.
   - `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com` (no trailing slash).
   - `NEXTAUTH_SECRET` to a private random value generated with `openssl rand -base64 32`.
   - Google OAuth, Razorpay, SMTP/EmailJS, and Cloudinary values only for services you have enabled. Add `https://your-domain.com/api/auth/callback/google` to the Google OAuth client's authorized redirect URIs.

   Never commit `.env.production` or paste production credentials into a README or example file. If any credential from an example file has ever been used for a real service, rotate it with that provider before deploying.
3. Build the image and prepare the database. Only for a brand-new, empty database, apply the schema with `docker compose build web` followed by `docker compose run --rm web npx prisma db push`. For an existing production database, back it up, review additive SQL, and apply it with `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/manual-migrations/20261114_backend_security.sql`; also apply `20261113_add_address_coordinates.sql` if those columns are not already present. Do not blindly run `prisma db push` against a database with legacy objects. Seed catalog data only after reviewing what the seed updates (`docker compose run --rm web npm run db:seed`).
4. Build and start the app:

   ```bash
   docker compose up -d --build
   docker compose ps
   docker compose logs -f web
   ```

   Verify `curl http://127.0.0.1:3000/api/health` on the VPS returns `{"status":"ok"}`. This endpoint is a liveness check; it does not verify PostgreSQL or payment-provider health.
5. Obtain a TLS certificate before enabling the HTTPS Nginx config. Copy `deploy/nginx/bootstrap-http.conf` to `/etc/nginx/sites-available/zunora`, replace the example hostnames, then enable and load it with `sudo ln -s /etc/nginx/sites-available/zunora /etc/nginx/sites-enabled/zunora` and `sudo nginx -t && sudo systemctl reload nginx`. Run `sudo certbot --nginx -d your-domain.com -d www.your-domain.com` and confirm the certificate was issued. Then copy `deploy/nginx/zunora.conf` over the site file, replace every `example.com` with your real domain, and run `sudo nginx -t && sudo systemctl reload nginx`. If you do not use `www`, remove that hostname from `server_name` and Certbot commands.
6. Point Google OAuth and payment webhooks at the production HTTPS domain. For Razorpay, configure `/api/razorpay` and the events documented in the production notes above. Confirm DNS, TLS renewal (`sudo certbot renew --dry-run`), order creation, email, and payment test mode before launch.

For releases, pull the reviewed code and run `docker compose up -d --build`; keep PostgreSQL backups and retain the previous image/release so you can roll back. Do not put secrets in `docker-compose.yml`; keep them in the server-only `.env.production` file with restrictive permissions (`chmod 600 .env.production`).

## Useful commands

```bash
npm run lint
npm run typecheck
npm run build
```
