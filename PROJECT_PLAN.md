# FitFlow Landing Page - Complete Project Plan

## 📋 Project Overview

**Project:** FitFlow Landing Page & SaaS Platform
**Purpose:** Marketing website + user management for FitFlow gym management desktop app
**Start Date:** January 2026
**Status:** Phase 1-6 Complete ✅ | Database Setup Complete

---

## 🎉 Current Progress

**Milestone Reached:** Database Setup Complete!

**✅ Completed (6/22 phases):**
- Phase 1: Project Setup & Foundation
- Phase 2: i18n Configuration (6 languages)
- Phase 3: Translation Files (English, Arabic, Spanish, Portuguese, French, German)
- Phase 4: Tailwind CSS + RTL + Dark Mode
- Phase 5: Database Schema with Prisma
- Phase 6: Supabase Connection & Migrations

**🎯 Next Up:**
- Phase 7: Authentication System (NextAuth.js v5)

**📊 Completion:** 27% (6 of 22 phases)

---

## 🎯 Core Features

### 1. **Microsoft Office-Style Licensing**
- ✅ One license key, multiple device activations (based on plan)
- ✅ Device limits: Basic (1), Pro (3), Enterprise (Unlimited)
- ✅ Both subscription AND perpetual license options
- ✅ Online validation every 7 days
- ✅ 30-day offline grace period
- ✅ Auto-deactivation of inactive devices (90+ days)
- ✅ Perpetual licenses include 1 year of updates

### 2. **Multi-Currency System (Udemy-style)**
- ✅ Auto-detect user's country/currency via IP
- ✅ 15+ supported currencies (USD, EUR, GBP, EGP, SAR, AED, etc.)
- ✅ Manual currency selector in header
- ✅ Daily exchange rate updates (cached)
- ✅ Smart price rounding for psychological pricing
- ✅ Multi-currency checkout via LemonSqueezy

### 3. **6-Language Internationalization**
Languages from launch:
1. **English** (en) - 🇺🇸 Primary
2. **Arabic** (ar) - 🇸🇦 RTL support
3. **Spanish** (es) - 🇪🇸 Latin America + Spain
4. **Portuguese** (pt) - 🇧🇷 Brazil + Portugal
5. **French** (fr) - 🇫🇷 Europe + Canada + Africa
6. **German** (de) - 🇩🇪 Germany + Austria + Switzerland

**Coverage:** 100+ countries, 2.5+ billion people

### 4. **Trial & Subscription System**
- ✅ 30-day free trial (no credit card required)
- ✅ 1 device during trial
- ✅ Email reminders (7 days, 1 day before expiry)
- ✅ Upgrade prompts in app
- ✅ Subscription or perpetual purchase options

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS 3** | Styling |
| **shadcn/ui** | UI components (Radix UI) |
| **next-intl** | Internationalization (6 languages) |
| **next-themes** | Dark mode support |
| **Lucide Icons** | Icon library |

### Backend & Services
| Service | Purpose | Free Tier | Paid Tier |
|---------|---------|-----------|-----------|
| **Supabase** | PostgreSQL database | 500MB, Unlimited API requests | $25/month Pro |
| **NextAuth.js v5** | Authentication | Free (self-hosted) | - |
| **Prisma ORM** | Database queries | Free | - |
| **LemonSqueezy** | Payments | ~5% per transaction | Same |
| **Vercel** | Hosting | Free tier | $20/month Pro |
| **Resend** | Transactional emails | 3K emails/month | $20/month |
| **ipapi.co** | IP geolocation | 1K requests/day | $12/month |
| **exchangerate-api** | Currency rates | 1.5K requests/month | Free |

**Total Starting Cost:** $0/month (all free tiers!)

---

## 📊 Pricing Plans

| Feature | Trial | Basic | Pro | Enterprise |
|---------|-------|-------|-----|------------|
| **Duration** | 30 days | Ongoing | Ongoing | Ongoing |
| **Price (Subscription)** | Free | $29/mo | $59/mo | $99/mo |
| **Price (Perpetual)** | - | $299 | $599 | $999 |
| **Device Activations** | 1 | 1 | 3 | Unlimited |
| **Updates** | All | 1 yr (perpetual) | 1 yr (perpetual) | 1 yr (perpetual) |
| **Support** | Email | Email | Priority | Premium + Dedicated |
| **Multi-Location** | ❌ | ❌ | ✅ | ✅ |
| **Custom Branding** | ❌ | ❌ | ✅ | ✅ |

---

## 🗄️ Database Schema

```prisma
// User model
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  name                   String?
  passwordHash           String

  // Localization preferences
  language               String    @default("en") // en, ar, es, pt, fr, de
  preferredCurrency      String    @default("USD")
  detectedCountry        String?   // ISO 3166-1 alpha-2

  // Trial tracking
  trialStartAt           DateTime  @default(now())
  trialEndAt             DateTime  // +30 days from start

  // Subscription tracking
  subscriptionStatus     String    @default("trial") // trial, active, cancelled, expired
  subscriptionType       String?   // subscription, perpetual
  planTier               String?   // basic, pro, enterprise
  deviceLimit            Int       @default(1) // 1, 3, or 999999

  // License key
  licenseKey             String?   @unique

  // LemonSqueezy integration
  lemonSqueezyCustomerId String?
  lemonSqueezySubscriptionId String?

  // Perpetual license tracking
  perpetualLicensePurchasedAt DateTime?
  perpetualLicenseUpdatesUntil DateTime? // +1 year from purchase

  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  // Relationships
  activatedDevices       ActivatedDevice[]
  downloads              Download[]

  @@index([email])
  @@index([licenseKey])
}

// Device activation tracking
model ActivatedDevice {
  id              String   @id @default(cuid())
  userId          String
  deviceId        String   // Unique hardware fingerprint
  deviceName      String?  // Optional: "Office PC"
  platform        String   // windows, mac, linux
  appVersion      String   // Track installed version

  activatedAt     DateTime @default(now())
  lastValidatedAt DateTime @default(now())
  isActive        Boolean  @default(true)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
  @@index([userId])
  @@index([lastValidatedAt])
}

// Download history
model Download {
  id          String   @id @default(cuid())
  userId      String
  version     String
  platform    String   // windows, mac, linux
  downloadedAt DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// Currency exchange rates (cached daily)
model CurrencyRate {
  id          String   @id @default(cuid())
  currency    String   @unique // "EGP", "SAR", etc.
  rateToUSD   Float    // 1 USD = X currency
  lastUpdated DateTime @default(now())

  @@index([currency])
  @@index([lastUpdated])
}
```

---

## 🔄 User Flow

### Initial Setup Flow
1. **User visits landing page** → Auto-detect language + currency
2. **User clicks "Start Free Trial"** → Sign up page
3. **User signs up** (email/password) → Account created
4. **Generate trial license** → 30 days, 1 device, unique key
5. **Redirect to dashboard** → Shows license key, download button
6. **User downloads app** → Windows/Mac/Linux installer
7. **User installs & launches app** → License activation screen
8. **User enters license key** → Device activation request to API
9. **API validates & stores device** → Check device limit
10. **App activated** → Start using FitFlow

### During Trial (Days 1-30)
- App validates license every 7 days
- Offline grace period: 30 days
- Email reminders at 7 days and 1 day before expiry
- Trial status shown in app + dashboard

### Trial Expiration & Upgrade
1. **Trial expires** → App shows "Trial Expired" screen
2. **User clicks upgrade** → Redirected to pricing page
3. **User selects plan** → Basic/Pro/Enterprise
4. **User selects type** → Subscription or Perpetual
5. **User completes payment** → LemonSqueezy checkout
6. **Webhook updates database** → Subscription status, plan tier, device limit
7. **User returns to app** → Re-validates license → Fully activated

### Subscription Management
- **Subscription users:** Monthly/yearly billing, cancel anytime
- **Perpetual users:** One-time payment, works forever, 1 year updates
- **Payment failures:** 7-day grace period, then suspend license
- **Renewals:** Automatic for subscriptions, manual upgrade for perpetual

---

## 📁 Project Structure

```
fitflow-landing/
├── frontend/
│   ├── app/
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── pricing/           # Pricing page
│   │   │   ├── features/          # Features page
│   │   │   ├── auth/
│   │   │   │   ├── signin/        # Sign in
│   │   │   │   └── signup/        # Sign up
│   │   │   ├── dashboard/         # User dashboard
│   │   │   │   ├── page.tsx       # Overview
│   │   │   │   ├── billing/       # Billing management
│   │   │   │   └── settings/      # Account settings
│   │   │   └── download/          # Download page
│   │   ├── api/
│   │   │   ├── auth/              # NextAuth routes
│   │   │   ├── webhooks/
│   │   │   │   └── lemon-squeezy/ # Payment webhooks
│   │   │   ├── license/
│   │   │   │   ├── generate/      # Generate license key
│   │   │   │   ├── activate/      # Activate device
│   │   │   │   └── validate/      # Validate license
│   │   │   └── currency/
│   │   │       ├── detect/        # Detect user currency
│   │   │       └── convert/       # Convert prices
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── landing/               # Landing page sections
│   │   ├── pricing/               # Pricing cards
│   │   ├── dashboard/             # Dashboard components
│   │   ├── LanguageSelector.tsx  # Language switcher
│   │   └── CurrencySelector.tsx  # Currency switcher
│   ├── lib/
│   │   ├── db/                    # Database utilities
│   │   │   └── prisma.ts
│   │   ├── auth/                  # NextAuth config
│   │   │   └── auth.ts
│   │   ├── license/               # License key logic
│   │   │   ├── generate.ts
│   │   │   ├── validate.ts
│   │   │   └── device.ts
│   │   ├── currency/              # Currency system
│   │   │   ├── detect.ts
│   │   │   ├── convert.ts
│   │   │   └── rates.ts
│   │   └── email/                 # Email templates
│   │       └── send.ts
│   ├── i18n/
│   │   ├── routing.ts             # next-intl routing
│   │   └── request.ts             # next-intl config
│   ├── messages/                  # Translation files
│   │   ├── en.json                # English
│   │   ├── ar.json                # Arabic
│   │   ├── es.json                # Spanish
│   │   ├── pt.json                # Portuguese
│   │   ├── fr.json                # French
│   │   └── de.json                # German
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   └── downloads/             # Or use S3/CDN
│   └── package.json
└── backend/ (optional - API can be in Next.js)
```

---

## 🚀 Implementation Phases

### ✅ Phase 1: Project Setup & Foundation (COMPLETED)
- [x] Initialize Next.js 15 with TypeScript
- [x] Install all dependencies
- [x] Setup folder structure
- [x] Configure ESLint, Prettier, Tailwind

### ✅ Phase 2: Configure next-intl (COMPLETED)
- [x] Setup i18n routing for 6 languages
- [x] Create middleware for locale detection
- [x] Configure locale-specific layouts

### ✅ Phase 3: Generate All 6 Language Translation Files (COMPLETED)
- [] Create comprehensive English translation file
- [] Generate Arabic translation (with RTL considerations)
- [] Generate Spanish translation
- [] Generate Portuguese translation
- [] Generate French translation
- [] Generate German translation

### ✅ Phase 4: Setup Tailwind CSS with RTL + Dark Mode (COMPLETED)
- [x] Configure Tailwind with custom theme
- [x] Add dark mode support (next-themes)
- [x] Add RTL direction support for Arabic
- [x] Create CSS variables for theming

### ✅ Phase 5: Database Schema with Prisma (COMPLETED)
- [x] Create complete Prisma schema (User, Device, Currency, etc.)
- [x] Setup database relationships
- [x] Create indexes for performance
- [x] Add validation and constraints

### ✅ Phase 6: Supabase Connection & Migrations (COMPLETED)
- [x] Setup Supabase account and create database
- [x] Configure DATABASE_URL and DIRECT_URL in .env (PostgreSQL connection strings)
- [x] Install ts-node for seed script execution
- [x] Run initial migration (npx prisma migrate dev)
- [x] Seed database with 16 initial currency rates

### ⏳ Phase 7: Authentication System (NextAuth.js v5)
- [ ] Configure NextAuth with credentials provider
- [ ] Create sign-up flow with trial creation
- [ ] Create sign-in flow
- [ ] Password reset flow
- [ ] Email verification (optional)
- [ ] Session management

### ⏳ Phase 8: Currency Detection & Conversion System
- [ ] IP geolocation integration (ipapi.co)
- [ ] Exchange rate API integration
- [ ] Currency rate caching in database
- [ ] Smart price rounding logic
- [ ] API routes for currency detection/conversion

### ⏳ Phase 9: Language & Currency Selector Components
- [ ] Language selector dropdown
- [ ] Currency selector dropdown
- [ ] Cookie-based preference storage
- [ ] Auto-detection on first visit
- [ ] Smooth page reloads on change

### ⏳ Phase 10: Landing Page UI with Tiered Pricing
- [ ] Hero section with CTA
- [ ] Features section
- [ ] Pricing section (3 plans)
- [ ] Testimonials section
- [ ] Footer
- [ ] Responsive design
- [ ] Dark mode support

### ⏳ Phase 11: Dynamic Pricing Display (Multi-Currency)
- [ ] Client-side price fetching
- [ ] Loading states for price conversion
- [ ] Display original USD price
- [ ] Show converted local price
- [ ] Handle loading/error states

### ⏳ Phase 12: License Key System
- [ ] Generate unique license keys (crypto-based)
- [ ] Store license keys securely
- [ ] License key validation logic
- [ ] Associate license with user account

### ⏳ Phase 13: Device Activation API
- [ ] POST /api/license/activate endpoint
- [ ] Device fingerprint validation
- [ ] Check device limit per plan
- [ ] Store device in database
- [ ] Return activation success/error

### ⏳ Phase 14: License Validation API
- [ ] POST /api/license/validate endpoint
- [ ] Check license validity
- [ ] Check subscription status
- [ ] Update lastValidatedAt timestamp
- [ ] Return license status + metadata

### ⏳ Phase 15: User Dashboard
- [ ] Dashboard layout
- [ ] Trial status display (days remaining)
- [ ] License key display (copy button)
- [ ] Download section (Windows/Mac/Linux)
- [ ] Account settings page
- [ ] Billing page (current plan, payment method)

### ⏳ Phase 16: LemonSqueezy Integration
- [ ] Setup LemonSqueezy account
- [ ] Create products (Basic, Pro, Enterprise - subscription + perpetual)
- [ ] Implement checkout flow
- [ ] Create webhook handler (POST /api/webhooks/lemon-squeezy)
- [ ] Handle subscription events (created, updated, cancelled, payment_failed)
- [ ] Update user subscription status in database

### ⏳ Phase 17: Email System with i18n (Resend)
- [ ] Setup Resend account
- [ ] Create email templates (6 languages)
- [ ] Welcome email on signup
- [ ] Trial reminder emails (7 days, 1 day)
- [ ] Subscription confirmation email
- [ ] Payment failure notification
- [ ] License activation email

### ⏳ Phase 18: Electron App - License Activation Screen
- [ ] Create license activation UI in Electron app
- [ ] Input field for license key
- [ ] Activate button
- [ ] Display activation errors
- [ ] Store license key locally (encrypted)

### ⏳ Phase 19: Electron App - Device ID & Validation Logic
- [ ] Generate unique device ID (hardware fingerprint)
- [ ] Implement validation logic (check every 7 days)
- [ ] Offline grace period (30 days)
- [ ] Cache last validation response
- [ ] Display "days until validation required" in UI

### ⏳ Phase 20: Electron App - Trial/Upgrade UI
- [ ] Show trial status in app header
- [ ] Display days remaining
- [ ] "Upgrade" button → opens web browser to pricing page
- [ ] "Trial Expired" modal
- [ ] Restrict features when trial expires

### ⏳ Phase 21: Testing
- [ ] Test signup → download → activate flow
- [ ] Test device limit enforcement
- [ ] Test offline grace period
- [ ] Test all 6 languages
- [ ] Test RTL layout (Arabic)
- [ ] Test all currency conversions
- [ ] Test payment flows (subscription + perpetual)
- [ ] Test email notifications
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing

### ⏳ Phase 22: Deployment & Monitoring
- [ ] Setup custom domain
- [ ] Configure environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Setup error monitoring (Sentry or similar)
- [ ] Setup analytics (Vercel Analytics or Google Analytics)
- [ ] Configure CDN for app downloads
- [ ] SSL certificate verification
- [ ] Test production deployment

---

## 🔐 Security Considerations

1. **License Keys**
   - Use cryptographic signatures (JWT or custom)
   - Never expose secret keys in client-side code
   - Validate on server-side only

2. **API Rate Limiting**
   - Limit license validation requests (prevent brute force)
   - Limit currency conversion requests
   - Protect webhook endpoints

3. **Database Security**
   - Use parameterized queries (Prisma handles this)
   - Hash passwords (bcryptjs)
   - Encrypt sensitive data (license keys)
   - Regular backups

4. **Authentication**
   - Use secure session cookies
   - Implement CSRF protection (NextAuth handles this)
   - Require strong passwords
   - Optional: 2FA for enterprise users

5. **Webhooks**
   - Verify LemonSqueezy webhook signatures
   - Use HTTPS only
   - Validate payload structure

---

## 💰 Cost Breakdown

### Free Tier (0-100 users)
- Vercel: $0
- Supabase: $0 (500MB database, unlimited API requests)
- Resend: $0 (3K emails/month)
- ipapi.co: $0 (1K requests/day)
- exchangerate-api: $0
- **LemonSqueezy:** ~5% + payment processing per transaction
- **Total:** $0/month + transaction fees

### Small Scale (100-500 users)
- Vercel: $0-20/month
- Supabase: $0 (still within free tier limits)
- Resend: $0-10/month
- **Total:** ~$0-30/month + transaction fees

### Medium Scale (500-2000 users)
- Vercel: $20/month (Pro plan)
- Supabase: $25/month (Pro plan for more storage/bandwidth)
- Resend: $20/month
- **Total:** ~$65/month + transaction fees

---

## 🌍 Supported Currencies

| Currency | Symbol | Countries |
|----------|--------|-----------|
| USD | $ | United States, international |
| EUR | € | Eurozone (27 countries) |
| GBP | £ | United Kingdom |
| EGP | E£ | Egypt |
| SAR | SR | Saudi Arabia |
| AED | AED | United Arab Emirates |
| KWD | KD | Kuwait |
| QAR | QR | Qatar |
| MAD | MAD | Morocco |
| BRL | R$ | Brazil |
| MXN | MX$ | Mexico |
| ARS | ARS$ | Argentina |
| COP | COP$ | Colombia |
| CLP | CLP$ | Chile |
| INR | ₹ | India |
| TRY | ₺ | Turkey |

---

## 📧 Email Templates (All 6 Languages)

### 1. Welcome Email
- Sent immediately after signup
- Includes license key
- Link to download page
- Getting started guide

### 2. Trial Reminder (7 days left)
- "Your trial expires in 7 days"
- Highlight what they'll lose
- CTA to upgrade

### 3. Trial Reminder (1 day left)
- "Last chance - trial expires tomorrow"
- Urgent tone
- Direct link to pricing

### 4. Trial Expired
- "Your trial has expired"
- Show what they're missing
- Special upgrade offer

### 5. Subscription Confirmation
- Thank you for subscribing
- Plan details
- Billing information
- Invoice

### 6. Payment Failure
- Payment could not be processed
- Update payment method
- 7-day grace period warning

---

## 🎨 Design Guidelines

### Colors
- **Primary:** Purple (#7C3AED) - Energetic, modern
- **Secondary:** Dark gray
- **Accent:** Green (success), Red (destructive)
- **Background:** White (light mode), Dark gray (dark mode)

### Typography
- **Headings:** Bold, large
- **Body:** Readable, 16px minimum
- **CTAs:** Prominent, contrasting colors

### Layout
- **Mobile-first:** Design for small screens first
- **Responsive breakpoints:** 640px, 768px, 1024px, 1280px
- **RTL Support:** Mirror layout for Arabic
- **Spacing:** Consistent padding/margins (Tailwind scale)

---

## 📝 Environment Variables Needed

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="random-secret-key-here"
NEXTAUTH_URL="https://fitflow.com" # or http://localhost:3000

# LemonSqueezy
LEMONSQUEEZY_API_KEY="your-api-key"
LEMONSQUEEZY_STORE_ID="your-store-id"
LEMONSQUEEZY_WEBHOOK_SECRET="your-webhook-secret"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@fitflow.com"

# Optional: Currency API
EXCHANGE_RATE_API_KEY="" # Free tier doesn't need key

# Optional: IP Geolocation
IPAPI_KEY="" # Free tier doesn't need key
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] License key generation
- [ ] Device fingerprint creation
- [ ] Currency conversion logic
- [ ] Price rounding logic

### Integration Tests
- [ ] Signup flow
- [ ] License activation
- [ ] Device limit enforcement
- [ ] Payment webhook handling

### E2E Tests
- [ ] Complete user journey (signup → download → activate → upgrade)
- [ ] Multi-language switching
- [ ] Multi-currency selection
- [ ] Payment checkout flow

### Manual Tests
- [ ] All 6 languages display correctly
- [ ] RTL layout works properly (Arabic)
- [ ] All currencies convert accurately
- [ ] Offline mode works (30-day grace)
- [ ] Device limit enforced correctly
- [ ] Trial expiration works
- [ ] Email notifications sent

---

## 📚 Resources & Documentation

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### next-intl
- [next-intl Docs](https://next-intl-docs.vercel.app/)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase + Prisma](https://www.prisma.io/docs/guides/database/supabase)

### NextAuth
- [NextAuth v5 Docs](https://authjs.dev/)

### LemonSqueezy
- [LemonSqueezy API Docs](https://docs.lemonsqueezy.com/)
- [Webhooks Guide](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks)

### Resend
- [Resend Docs](https://resend.com/docs)

---

## 🎯 Success Metrics

### Launch Goals (First 30 Days)
- 100 trial signups
- 50 app downloads
- 10 paid conversions (10% conversion rate)
- Support 6 languages from day one

### 3-Month Goals
- 500 trial signups
- 300 active users
- 50 paid customers
- $2,500 MRR (Monthly Recurring Revenue)

### 6-Month Goals
- 2,000 trial signups
- 1,000 active users
- 200 paid customers
- $10,000 MRR

---

## 🔮 Future Enhancements (Post-Launch)

### Phase 2 Features
- [ ] Add more languages (Italian, Polish, Hindi, Japanese)
- [ ] Affiliate program
- [ ] Referral system
- [ ] Live chat support
- [ ] Knowledge base / Help center
- [ ] Video tutorials

### Phase 3 Features
- [ ] White-label option for Enterprise
- [ ] API access for integrations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] A/B testing for pricing

---

## 📞 Support & Contact

**Developer:** [Your Name]
**Email:** [your-email]
**Project Repository:** [GitHub URL]
**Documentation:** This file + inline code comments

---

**Last Updated:** January 12, 2026
**Version:** 1.1
**Status:** Active Development - Phases 1-6 Complete ✅ | Ready for Phase 7 (Authentication System)
