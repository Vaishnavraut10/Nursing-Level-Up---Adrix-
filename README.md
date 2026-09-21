# NurseLearn - Nursing Education Platform

A comprehensive web platform for nursing students providing courses, MCQ practice tests, and progress tracking.

## Project Overview

NurseLearn is a modern web application designed to help nursing students:
- Browse and purchase nursing courses
- Practice with interactive MCQ tests
- Track learning progress and test results
- Access a professional nursing education experience

The platform includes both a student-facing interface and an admin panel for content management. It is built as a unified full-stack application using Next.js.

## Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom design system & glassmorphism)
- **Database**: PostgreSQL (hosted on Neon)
- **Authentication**: NextAuth (Google OAuth & Dev Login)
- **Payments**: Razorpay

## Project Structure

The entire application is self-contained within the `web/` directory.

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (site)/          # Student-facing pages (Dashboard, Test Series, Profile)
│   │   ├── admin/           # Admin panel pages
│   │   ├── login/           # Authentication pages
│   │   ├── api/             # API routes and webhooks
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles & Tailwind config
│   ├── components/          # Reusable React components (UI, Auth, Navigation, Tests)
│   ├── lib/                 # Core utilities
│   │   ├── server/          # Server-only utilities (DB, Services, Auth logic)
│   │   └── validation/      # Zod schemas
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── db/                      # Database schema and migrations
├── .env.example             # Example environment variables
├── package.json             # Project dependencies
└── next.config.ts           # Next.js configuration
```

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon account recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/animesh-1121/adrix-courese-web.git
   cd adrix-courese-web
   ```

2. **Navigate to the web directory and install dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to add your actual database connection string and other required keys.

### Environment Variables (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ENABLE_DEV_LOGIN` | Enable bypass login for local testing (`true`) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No (Required for prod auth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No (Required for prod auth) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | No (Required for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | No (Required for payments) |
| `GEMINI_API_KEY` | Key for AI-assisted MCQ generation | No |

### Running the Application

To start the development server:
```bash
npm run dev
```

The application will be available at:
- **Student App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### Production Build

To build and run the application in production mode:
```bash
npm run build
npm start
```

## Available Routes

### Student Routes
- `/` - Homepage (Landing Page)
- `/login` - Authentication page
- `/test-series` - Browse all test series
- `/test-series/:id` - Test series details
- `/dashboard` - Student dashboard & progress tracking
- `/tests/:id` - Interactive timed MCQ test interface
- `/results/:id` - Detailed test results & explanations
- `/profile` - Student profile management
- `/complete-profile` - Collect missing user details (phone number)

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/login` - Admin login portal
- `/admin/users` - User management
- `/admin/test-series` - Test series management
- `/admin/purchases` - Track orders and payments
- `/admin/attempts` - View all test attempts
- `/admin/settings` - Configure app settings

## Design System

The platform uses a professional nursing education design, featuring:
- **Colors**: Deep teal ink on warm paper backgrounds (`bg-paper`, `text-ink`)
- **Typography**: Inter (Sans-serif) and Source Serif 4
- **Aesthetics**: Glassmorphism, subtle gradient text, animated cards
- **Components**: Reusable Tailwind-based components (`src/components/ui`)

## Testing
The repository includes configurations for testing APIs and UI. Use the corresponding Vitest configurations located in `web/vitest.config.mts` and `web/vitest.api.config.mts`.

## License
Proprietary - All rights reserved