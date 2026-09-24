# Nursing Level Up — Nursing Exam Preparation Platform

A comprehensive, full-stack web platform built for nursing officer aspirants preparing for NORCET, GMCH, AIIMS, and state-level exams. The platform features a unified course pass model, daily drip-scheduled test series, interactive timed exam solving, clinical rationales, and an admin management panel.

---

## 🌟 Key Highlights & Architecture

- **Unified Course Model**: Students purchase the complete **Nursing Level Up Course** for ₹299 (or ₹199 using instant promo code `NLUP199`), granting access to all 200+ test series. Individual test series purchases are discontinued in favor of this single all-inclusive pass.
- **Daily Drip Release Engine**:
  - Test Series 1 unlocks **immediately** upon course enrollment (`release_after_days = 0`).
  - Test Series 2 unlocks on **Day 2 at 5:00 PM IST** (`release_after_days = 1`), Series 3 on **Day 3 at 5:00 PM IST**, and so on.
  - Release dates are dynamically calculated per-student based on `access_started_at`.
- **Direct Test Solving from Course Page (`/course`)**:
  - The main course page displays course details, pricing, coupon applicator, and all listed test series below it.
  - Students can click **"Solve Test →"** to launch directly into the timed exam runner (`/tests/[id]`).
- **Dual Authentication**:
  - **Google OAuth**: Fast single-click sign-in.
  - **Email & Password**: Built-in account registration and credential authentication secured with bcryptjs password hashing.
  - **Dev Login**: Optional single-click bypass for rapid local testing.
- **Interactive Timed Exam Interface (`/tests/:id`)**:
  - Full-screen distraction-free test runner with real-time server-synced countdown timer.
  - Question palette, mark for review, question jump, autosave (session & server), and auto-submit on time expiry.
  - Instant score calculation, percentile estimation, and clinical rationale breakdown for each option.
- **Comprehensive Admin Panel (`/admin`)**:
  - **Course Management (`/admin/courses`)**: Create and edit courses, set prices, discount prices, promo codes, publish/unpublish/archive, and view student enrollment & revenue analytics.
  - **Test Series Management (`/admin/test-series`)**: Create and edit tests, assign to courses, set `release_after_days` drip schedules, manage duration and question counts.
  - **Question Bank**: Bulk import (JSON/CSV), rich text question creation, options, and clinical rationales.
  - **Purchases & Attempts**: Track payment orders, Razorpay verifications, student attempt logs, and audit trails.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens, glassmorphism, and responsive layouts
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/) or local PostgreSQL) using connection pooling (`pg`)
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with Google OAuth & Credentials Provider (`bcryptjs`)
- **Payments**: [Razorpay](https://razorpay.com/) (UPI, Netbanking, Cards, Wallets)
- **Testing**: [Vitest](https://vitest.dev/) for unit & integration testing, [Playwright](https://playwright.dev/) for E2E testing
- **Validation**: [Zod](https://zod.dev/) for robust schema validation across API routes and forms

---

## 📁 Project Structure

The entire application is located in the `web/` directory:

```
web/
├── src/
│   ├── app/
│   │   ├── (focus)/                 # Distraction-free test solving
│   │   │   └── tests/[id]/          # Interactive timed test runner
│   │   ├── (site)/                  # Public student-facing pages
│   │   │   ├── page.tsx             # Main homepage with Course Showcase
│   │   │   ├── course/              # Course details & listed test series
│   │   │   ├── test-series/         # Test series catalog & detail views
│   │   │   ├── unlock/[id]/         # Course enrollment gateway for locked tests
│   │   │   ├── dashboard/           # Student progress & test history
│   │   │   ├── results/[id]/        # Detailed exam results & explanations
│   │   │   ├── profile/             # Profile & account settings
│   │   │   └── complete-profile/    # Mobile number collection
│   │   ├── admin/
│   │   │   ├── (panel)/             # Admin dashboard pages
│   │   │   │   ├── courses/         # Course CRUD & drip schedule manager
│   │   │   │   ├── test-series/     # Test series management
│   │   │   │   ├── purchases/       # Payment & revenue reports
│   │   │   │   ├── attempts/        # Student exam logs
│   │   │   │   └── users/           # User management
│   │   │   └── login/               # Admin portal login
│   │   ├── api/                     # Backend API endpoints
│   │   │   ├── admin/courses/       # Admin course operations
│   │   │   ├── auth/register/       # Email/password registration
│   │   │   ├── courses/             # Course lookup & promo validation
│   │   │   ├── payments/razorpay/   # Order creation & signature verification
│   │   │   └── tests/               # Test start, autosave, and submission
│   │   ├── login/                   # Dual student login & signup
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── admin/                   # Admin CourseForm, TestSeriesForm, Sidebar
│   │   ├── auth/                    # LoginPanel with Google + Password forms
│   │   ├── course/                  # CourseTestSeriesList with direct solve
│   │   ├── navigation/              # Header, Logo, UserMenu
│   │   ├── payments/                # Dynamic Razorpay Checkout with coupon
│   │   ├── test/                    # TestRunner exam engine
│   │   ├── test-series/             # Test cards and catalog grids
│   │   └── ui/                      # Buttons, Cards, Inputs, Modals
│   ├── lib/
│   │   ├── server/                  # Server-only services
│   │   │   ├── db.ts                # PostgreSQL pool queries & transactions
│   │   │   ├── auth.ts              # NextAuth configuration
│   │   │   ├── session.ts           # Route guards & user sessions
│   │   │   └── services/            # courseService, testSeriesService, etc.
│   │   ├── api.ts                   # Client-side API fetch client
│   │   └── validation.ts            # Zod validation schemas
│   └── types/                       # TypeScript interfaces
├── db/                              # SQL schema and migration scripts
│   ├── schema.sql                   # Full database schema
│   ├── add-courses.sql              # Courses table & drip columns migration
│   └── add-password-auth.sql        # Password authentication migration
├── scripts/                         # Migration and utility scripts
│   ├── migrate-courses.mjs          # Executes course migration & seeds default course
│   └── migrate-password.mjs         # Executes password auth migration
├── package.json
└── next.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18 or higher (v20+ recommended)
- **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase)
- **npm** or **pnpm** / **yarn**

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/animesh-1121/adrix-courese-web.git
cd adrix-courese-web/web
npm install
```

### 2. Environment Variables Configuration

Create a `.env.local` file inside the `web/` directory:

```bash
cp .env.example .env.local
```

Configure your environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | NextAuth encryption secret | **Yes** | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application canonical URL | **Yes** | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional (for Google Auth) | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional (for Google Auth) | `GOCSPX-...` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | Optional (for Payments) | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | Optional (for Payments) | `...` |
| `ENABLE_DEV_LOGIN` | Bypass login buttons in dev mode | Development only | `true` |

### 3. Database Migration

Run the migration scripts to initialize the database schema, add course tables, and enable password auth:

```bash
# Apply schema and initial seed
npm run db:migrate

# Apply course and drip release migration
node scripts/migrate-courses.mjs

# Apply password authentication migration
node scripts/migrate-password.mjs
```

### 4. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be live at:
- **Main Website**: [http://localhost:3000](http://localhost:3000)
- **Course Page**: [http://localhost:3000/course](http://localhost:3000/course)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🧭 Application Routes

### Student & Public Routes

| Route | Description |
|---|---|
| `/` | Landing page featuring the **Course Showcase** and included test series |
| `/course` | **Complete Course Page** with syllabus, details, ₹299 / ₹199 coupon applicator, and listed test series with direct **Solve Test** action |
| `/test-series` | Public test catalog with search, subject filtering, and access badges |
| `/test-series/:id` | Test series syllabus, instructions, and start options |
| `/unlock/:id` | Enrollment portal for locked course test series with instant promo code applicator |
| `/tests/:id` | Distraction-free exam runner with countdown timer, question palette, and autosave |
| `/results/:id` | Detailed test score report, percentiles, and clinical rationales |
| `/dashboard` | Student dashboard showing unlocked tests, progress, and performance analytics |
| `/login` | Dual authentication portal (Google OAuth + Email/Password sign-up and sign-in) |
| `/complete-profile`| Student onboarding step for mobile number collection |

### Admin Panel Routes

| Route | Description |
|---|---|
| `/admin` | Main analytics dashboard (students, tests, revenue, recent attempts) |
| `/admin/courses` | **Course Management**: List courses, pricing, promo codes, student counts, and revenue |
| `/admin/courses/create` | Create new course with title, description, price, discount price, and promo code |
| `/admin/courses/:id` | Course details, quick publish/unpublish/archive actions, and assigned drip schedule |
| `/admin/courses/:id/edit` | Edit course information and pricing |
| `/admin/test-series` | List test series with course assignment and release day indicators |
| `/admin/test-series/create` | Create new test series and set `release_after_days` drip delay |
| `/admin/test-series/:id` | View test series questions, bulk import, review status, and publishing |
| `/admin/purchases` | Track all course enrollments and payment transaction IDs |
| `/admin/attempts` | Inspect all student exam attempts and completion percentages |
| `/admin/users` | Manage registered students and admin roles |

---

## 🧪 Testing & Verification

Run the test suite to verify validation rules, scoring logic, and parsers:

```bash
# Run Vitest unit tests
npm run test

# Typecheck TypeScript code
npm run typecheck

# Run linter
npm run lint

# Build production bundle
npm run build
```

---

## 📄 License

Proprietary — All rights reserved © Nursing Level Up.