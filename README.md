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

4. Create the database if needed, then generate Prisma and push the schema:

```bash
createdb nutrinest
npm run db:generate
npm run db:push
```

On Windows, if `createdb` is unavailable, create the database named in `DATABASE_URL` using pgAdmin or PostgreSQL's SQL shell before running the Prisma commands.

5. Seed demo data:

```bash
npm run db:seed
```

Seeded demo admin:

- Email: `admin@zunora.example`
- Password: `ChangeMe123!`

Run `npm run db:seed` to create or reset this local demo admin account. After signing in, admin accounts open the dashboard automatically at `/admin`. Change the password before using this in production. The `.example` email is a placeholder for local testing.

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
- Set a strong `NEXTAUTH_SECRET`.
- To enable consent-based Google Analytics 4, set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your GA4 measurement ID (for example, `G-XXXXXXXXXX`). Analytics will not load until a visitor accepts analytics cookies; visitors can reject or change their choice through Cookie settings. If the variable is blank, analytics and the cookie prompt remain disabled.
- For free-tier email delivery, create an EmailJS account, connect and verify an email service, then create an order-confirmation template. Set the template's **To Email** to `{{to_email}}`, its subject to `{{email_subject}}`, and its HTML body to `{{{invoice_html}}}`. For the plain-text body, use `{{invoice_text}}` if the template editor supports one. Add the service ID, template ID, and public key to `.env` as `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY`. `EMAILJS_PRIVATE_KEY` is optional and can be set for server-side API authentication. These values are only read by the server; do not prefix them with `NEXT_PUBLIC_`. EmailJS is tried first when configured; if it fails, configured SMTP is tried automatically.
- The invoice includes order items, shipping address, payment status, tax, shipping, discount, and total. Email delivery failures are logged and shown on the order confirmation page without discarding the order. The EmailJS REST API allows one send request per second and the free plan has a monthly quota, so check the current limits in your EmailJS account.
- As an alternative or fallback, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and a verified `SMTP_FROM` address in `.env` (not `.env.example`). For Gmail SMTP, use `SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT="465"` or `"587"`, the sending Gmail address as `SMTP_USER`, and a Google app password as `SMTP_PASS` (not the account password). Spaces in Gmail's grouped app-password display are ignored. Keep provider credentials private in `.env`, restart the app, and place a test COD order to verify delivery.
- Configure fulfillment capacity before advertising the 12-hour dispatch estimate. For prepaid orders the estimate starts after successful payment; for COD orders it starts after order confirmation.
- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure the provider webhook URL as `/api/razorpay` and subscribe to `payment.captured` and `payment.failed`.
- Run `npm run db:push` after applying the order payment/email tracking schema changes, before deploying the new checkout.
- Test online payments in Razorpay test mode and configure automatic capture before accepting live payments.
- Connect Cloudinary upload endpoints before enabling admin image uploads.
- Deploy on Vercel or build with the included `Dockerfile`.

## Useful commands

```bash
npm run lint
npm run typecheck
npm run build
```
