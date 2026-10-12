# YOUR BRAND — Premium Ethiopian E-Commerce Platform

A production-ready e-commerce platform built for clothing, footwear, and general retail in Ethiopia. Inspired by the editorial aesthetics of **COS** and **Zara**, with the clarity and usability of **Apple**.

---

## 1. Key Platform Features

- **Editorial Storefront Experience**: Warm ivory backgrounds (`#FAF9F6`), deep charcoal typography (`#121212`), high-impact product photography, and responsive layouts.
- **Dynamic Store Architecture**: Store sections (e.g. Men's, Women's, Footwear, Heritage Fusion) and categories configurable from the admin dashboard with zero code deployment.
- **Inventory & Variant Matrix**: Sizing (clothing & footwear), color ways, SKU tracking, low-stock threshold triggers, and server-side atomic stock deductions to prevent overselling.
- **Dual Fulfillment Logistics**:
  - **Home Delivery**: Configurable delivery zones across Addis Ababa sub-cities (Bole, Kirkos, Yeka, etc.) and regional cities (Hawassa, Adama, Bahir Dar) with free-delivery thresholds in ETB.
  - **Store Pickup**: Multiple physical boutique pickup locations with automated collection PIN generation (`PK-XXXXX`) and staff confirmation.
- **Payment Solutions**:
  - **Cash on Delivery (COD)**: Managed courier collection with admin verification.
  - **Chapa Gateway**: Online payments (Telebirr, CBE Birr, cards) with server-side transaction verification and HMAC SHA256 signed webhooks.
- **Unique-Lowest-Bid Competition System**:
  - Deterministic mathematical solver for unique-lowest bids.
  - Authoritative server timestamp validation and paid entry checks.
  - Administrative review and publication lock before winner announcements.
- **Customer CRM & ExcelJS Export**:
  - Customer profile aggregation matching on normalized Ethiopian phone numbers (`+2519...` / `+2517...`).
  - Real downloadable `.xlsx` spreadsheets with formula injection sanitization and leading-zero preservation.
- **Telegram Operational Alerts**:
  - Server-side notification queue with exponential backoff retries for new orders, verified payments, low inventory, and competition winners.

---

## 2. Technology Stack

- **Framework**: Next.js 16+ (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase PostgreSQL with 34-table DDL schema & Row Level Security (RLS)
- **Payments**: Chapa REST API + HMAC Webhook Handler
- **Data Export**: ExcelJS
- **Icons**: Lucide React
- **Test Runner**: Node.js Test Runner with `tsx`

---

## 3. Directory Layout

```
kenas-store/
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Homepage with editorial hero & catalog
│   │   ├── shop/                              # All products & dynamic category routes
│   │   │   ├── page.tsx
│   │   │   ├── [sectionSlug]/page.tsx
│   │   │   └── [sectionSlug]/[categorySlug]/page.tsx
│   │   ├── product/[slug]/page.tsx            # Product detail with variant selector
│   │   ├── cart/page.tsx                      # Shopping bag & real-time coupon check
│   │   ├── checkout/page.tsx                  # Dual fulfillment & payment checkout
│   │   ├── order-confirmation/[orderNumber]/  # Order confirmation receipt
│   │   ├── track-order/page.tsx               # Order tracking pipeline
│   │   ├── account/                           # Customer portal & order history
│   │   ├── bids/                              # Unique-lowest-bid competitions
│   │   ├── admin/                             # Protected staff dashboard
│   │   │   ├── dashboard/page.tsx             # Real-time revenue & inventory KPIs
│   │   │   ├── products/page.tsx              # Product CRUD & variant matrix
│   │   │   ├── inventory/page.tsx             # SKU stock levels & low stock alerts
│   │   │   ├── orders/page.tsx                # Fulfillment pipeline & fee overrides
│   │   │   ├── customers/page.tsx             # CRM & Excel (.xlsx) export
│   │   │   ├── catalog/sections/page.tsx      # Dynamic section manager
│   │   │   ├── catalog/categories/page.tsx    # Category manager
│   │   │   ├── marketing/coupons/page.tsx     # Coupon rules & limits
│   │   │   ├── bids/page.tsx                  # Competition solver & audit log
│   │   │   ├── settings/store/page.tsx        # Editable store name & branding
│   │   │   ├── settings/payments/page.tsx     # Chapa keys & COD configuration
│   │   │   ├── settings/delivery/page.tsx     # Delivery zones & thresholds
│   │   │   ├── settings/pickup-locations/page.tsx # Store pickup boutiques
│   │   │   ├── staff/page.tsx                 # Staff roles & RBAC matrix
│   │   │   ├── audit-logs/page.tsx            # System audit trail
│   │   │   └── reports/page.tsx               # Financial reports in ETB
│   │   └── api/
│   │       ├── coupons/validate/route.ts      # Coupon validation API
│   │       ├── export/customers/route.ts      # ExcelJS .xlsx export route
│   │       └── webhooks/chapa/route.ts        # Chapa idempotent webhook
│   ├── components/
│   │   ├── storefront/                        # Header, Footer, ProductCard, CheckoutForm
│   │   └── admin/                             # OrdersTable, SectionManager, CouponManager
│   ├── lib/
│   │   ├── db/repository.ts                   # Universal data repository layer
│   │   ├── payments/chapa.ts                  # Chapa API & HMAC signature verification
│   │   ├── telegram/bot.ts                    # Telegram operational notifications
│   │   ├── competitions/engine.ts             # Deterministic Unique-Lowest-Bid algorithm
│   │   ├── excel/customer-export.ts           # Formula-safe ExcelJS workbook generator
│   │   └── utils/                             # Phone normalizer & ETB formatter
│   └── types/index.ts                         # Complete TypeScript definitions
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql             # 34-table PostgreSQL DDL schema
│       └── 002_seed_demo_data.sql             # Ethiopian fashion catalog seed data
├── tests/
│   ├── store.test.ts                          # Product, inventory, & checkout tests
│   ├── coupons.test.ts                        # Coupon calculations & limits tests
│   ├── customers.test.ts                      # Phone normalization & Excel sanitization tests
│   └── competitions.test.ts                   # Unique-Lowest-Bid solver tests
└── .env.example                               # Environment template
```

---

## 4. Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Automated Tests
```bash
npm test
```
All 16 automated tests in 4 suites will execute and verify the competition solver, coupons, phone normalization, formula sanitization, and checkout flow.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) to view the staff portal.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 5. Database Setup (Supabase PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Run `supabase/migrations/001_initial_schema.sql` to generate all 34 tables, indexes, and constraints.
4. Run `supabase/migrations/002_seed_demo_data.sql` to populate sample Ethiopian fashion items, pickup locations, and delivery zones.
5. Add your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

---

## 6. Payment & Telegram Integrations

### Chapa Online Payments
1. Sign up for a Chapa merchant account at [chapa.co](https://chapa.co).
2. Obtain your `CHAPA_PUBLIC_KEY` and `CHAPA_SECRET_KEY`.
3. Set your webhook URL in the Chapa dashboard to:
   `https://yourdomain.com/api/webhooks/chapa`
4. Configure `CHAPA_WEBHOOK_SECRET` for HMAC SHA256 signature verification.

### Telegram Operational Alerts
1. Create a bot using [@BotFather](https://t.me/BotFather) on Telegram and obtain the bot token.
2. Add the bot to your merchant admin group or channel and retrieve the chat ID.
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to `.env.local` or configure them in `/admin/settings/store`.

---

## 7. Unique-Lowest-Bid Competition Compliance Safeguard

Because unique-lowest-bid competitions involve product awards, confirm applicable Ethiopian consumer-protection laws, licensing requirements, and payment-provider rules before enabling real paid entries. Paid competitions remain locked by default in `/admin/bids` until explicitly authorized by the store owner.
