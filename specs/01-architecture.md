# Nursing Level Up — System Architecture Document

**Stack (updated):** Next.js (App Router) for the frontend **and** the backend (Next.js Route Handlers act as the API layer, replacing the standalone Express server in the original PRD) + TypeScript + Tailwind CSS + PostgreSQL (Neon) + NextAuth.js (Google OAuth) + Razorpay + an external OCR/AI pipeline for auto‑generating MCQs from uploaded documents.

This document is the single source of truth for how the pieces fit together. The Frontend, Backend, and Database documents each expand on their section in detail.

---

## 1. Why Next.js for both frontend and backend

Next.js Route Handlers (`app/api/**/route.ts`) give you a real server runtime (Node.js, not edge-only) inside the same repo/deploy as the UI. This preserves every rule from your original PRD:

- The **database is still the only source of truth**.
- The **frontend still never decides** auth, role, payment, purchase, or scoring — every one of those decisions is made inside a Route Handler that runs on the server, never in client components.
- You can still **deploy frontend and backend independently** if you want, by splitting `app/` (pages) into one Next.js project and `app/api/` (route handlers) into a second Next.js project that only exports API routes. Most teams running this exact stack instead deploy both from **one** Next.js project (simpler, fewer moving parts, still fully separated in code via `lib/server/*` service modules) — this doc assumes the single-project deployment unless you tell me otherwise.

> Route Handlers replace Express `routes/*.ts`. Route Handlers call **service modules** (`lib/server/services/*.ts`) which replace Express `services/*.ts`. Auth/RBAC checks replace Express `middleware/*.ts` as reusable server-only functions (`requireUser()`, `requireAdmin()`) called at the top of each handler, or centrally in `middleware.ts` for route-level gating.

---

## 2. High-level diagram

```
                         NURSING LEVEL UP
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                                │
   STUDENT UI (RSC + Client Components)          ADMIN UI (RSC + Client Components)
        │                                                │
        └───────────────────────┬───────────────────────┘
                                 │  fetch() → same-origin
                                 ▼
                    NEXT.JS ROUTE HANDLERS (app/api/**)
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                         │
  AUTH (NextAuth.js)      SERVICES (lib/server)       VALIDATION (zod)
        │                        │                         │
        └────────────────────────┼────────────────────────┘
                                 │
                     ┌────────────┴────────────┐
                     ▼                          ▼
            PostgreSQL (Neon)         Object Storage (S3-compatible)
         users / test_series /          uploaded PDFs, DOCX, HTML
         questions / purchases /        (Neon does NOT store files —
         attempts / documents /          see §6)
         import_jobs / audit_logs
                     │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
   Google OAuth   Razorpay       OCR / AI MCQ-generation
   (identity)     (payment       provider (Tesseract.js +
                   verification)  Gemini/Groq — see §7)
```

---

## 3. Core principles (unchanged from your PRD, now mapped to Next.js)

| Principle | Enforced by |
|---|---|
| DB is source of truth | Postgres (Neon); Route Handlers are the only code path allowed to read/write it |
| Frontend never decides auth/role/payment/score | Client components only call `fetch('/api/...')`; all logic lives server-side in Route Handlers + `lib/server/services` |
| Correct answers never sent pre-submission | `GET /api/tests/:id` (start) selects columns **excluding** `correct_answer`; only `POST /api/tests/:id/submit` reads it, server-side |
| RBAC is server-side | `requireAdmin()` guard runs inside every `app/api/admin/**/route.ts` handler (and again in `middleware.ts` as a first line of defense) |

---

## 4. Two-layer route protection

1. **`middleware.ts` (edge, fast, UX-only)** — redirects unauthenticated users away from `/dashboard`, `/profile`, `/tests/*`, `/admin/*` before the page even renders. This is convenience, not security.
2. **Route Handler guard (server, authoritative)** — every `app/api/**/route.ts` (except public ones) re-verifies the session and, for admin routes, re-verifies `role = ADMIN` by querying Postgres. A request that bypasses the frontend entirely (e.g. curl) must still be rejected here.

---

## 5. Authentication & identity

- **Provider:** Google OAuth 2.0 / OpenID Connect via **NextAuth.js (Auth.js v5)**.
- **Session strategy:** JWT session (stateless, works well with serverless Next.js) containing `userId` and `role`, with the `role` re-read from Postgres on each sign-in and on session refresh — never trusted from the OAuth payload itself.
- **First login:** NextAuth's `signIn`/`jwt` callbacks look up `users.google_id`; if absent, create a row with `role = STUDENT` (role is **never** settable by the client — see §27/§28 of your original PRD, unchanged).
- Full detail in the Backend doc, §3.

---

## 6. File storage — correction on "Neon S3 bucket"

Neon is a **serverless Postgres provider only**. It has no object/blob storage product, so there is no such thing as a "Neon S3 bucket." Uploaded PDFs/DOCX/HTML files must go to a **separate S3-compatible bucket**, with only the **metadata and storage key** stored as a row in Postgres (table: `documents`).

**Recommended (free tier): Cloudflare R2**
- 10 GB storage free, **zero egress fees** (this matters — most "free" object storage still bills you per download).
- Fully S3-API compatible → use the standard `@aws-sdk/client-s3` package, just point `endpoint` at your R2 account URL.
- No credit card required to stay on the free tier.

**Alternatives** (documented for completeness, pick one):

| Provider | Free tier | Notes |
|---|---|---|
| **Cloudflare R2** (recommended) | 10 GB storage, no egress fees | Best fit — S3 API compatible, simplest |
| Backblaze B2 | 10 GB storage, egress free only via Cloudflare | Good if already using Cloudflare CDN |
| Supabase Storage | 1 GB storage on Supabase's own free Postgres plan | Only worth it if you also move off Neon, which you don't want to |
| AWS S3 | 5 GB free for 12 months only | Not free long-term; avoid for a "free" requirement |

This doc and the Database/Backend docs assume **Cloudflare R2**. Swapping providers later only touches `lib/server/storage.ts` (one file) because it's accessed through the S3 SDK.

---

## 7. Document → auto-generated MCQ pipeline (new feature)

```
Admin uploads .pdf / .docx / .html
        ↓
POST /api/admin/documents/upload  →  file streamed to R2  →  documents row (status=UPLOADED)
        ↓
POST /api/admin/documents/:id/extract
        ↓
  Text-native PDF?  → pdf-parse / pdfjs-dist
  Scanned/image PDF? → Tesseract.js OCR
  .docx?             → mammoth
  .html?              → cheerio / html-to-text (sanitized)
        ↓
documents.status = EXTRACTED, extracted_text stored
        ↓
POST /api/admin/documents/:id/generate
        ↓
  Extracted text → AI provider (Gemini Flash / Groq, see below) with a
  structured-JSON prompt: "produce N MCQs {question, A, B, C, D, correct, explanation}"
        ↓
Draft questions inserted with review_status = PENDING_REVIEW, linked to
the document via questions.source_document_id
        ↓
Admin reviews/edits in /admin/test-series/[id]/import (preview screen)
        ↓
POST /api/admin/documents/:id/approve
        ↓
review_status = APPROVED, questions now count toward the test series;
test series can be published
```

**Uploaded formats supported:** `.pdf`, `.docx`, `.html` (as requested). Never render uploaded HTML directly — extract and sanitize text only (see Backend doc §7 and Security doc references).

### Service options (all free-tier)

**Step A — Text extraction (no AI needed, digital files):**
- PDF: `pdf-parse` or `pdfjs-dist` (open source, npm, free, no external calls)
- DOCX: `mammoth` (open source, npm, free)
- HTML: `cheerio` + `html-to-text` (open source, npm, free) — output is sanitized with `sanitize-html` before storage

**Step B — OCR (only needed for scanned/image-based PDFs):**

| Option | Free tier | Trade-off |
|---|---|---|
| **Tesseract.js** (recommended) | Unlimited, fully free, runs in your own Node process | Free forever, no rate limits; slightly lower accuracy on messy scans, slower on large files |
| OCR.space API | 500 requests/day free (no key) / 25,000/mo with free key | Higher accuracy than Tesseract on poor scans; rate-limited |
| Google Cloud Vision | 1,000 units/month free, then paid | Best accuracy; not free past the trial quota — avoid if "free" must hold long-term |
| Azure Computer Vision (F0 tier) | 5,000 transactions/month free | Good accuracy; still a paid account with usage caps |

**Recommendation:** default to **Tesseract.js** (true free-forever, self-hosted, no external API key). Keep `lib/server/ocr.ts` as a thin interface so OCR.space can be swapped in later as a "high accuracy" fallback option without touching the rest of the pipeline.

**Step C — MCQ generation from extracted text (needs an LLM):**

| Option | Free tier | Trade-off |
|---|---|---|
| **Google Gemini API (Gemini 2.0/1.5 Flash)** (recommended) | Generous free tier (per-minute + per-day request quota, no credit card to start) | Best quality-to-cost ratio for structured JSON output; some daily cap |
| Groq API (Llama 3.1/3.3) | Free tier, very high inference speed | Slightly less reliable at strict JSON formatting; great as a fast fallback |
| Hugging Face Inference API | Free tier, rate-limited | Smaller open models, weaker at consistent MCQ structure — usable but needs more prompt/validation work |
| Self-hosted Ollama (Llama3/Mistral) | Free (your own compute) | No API limits at all, but needs a server with enough RAM/GPU — not a good fit for a serverless Next.js deploy |

**Recommendation:** default to **Gemini Flash free tier** as primary generator, with **Groq** configured as an automatic fallback if Gemini's daily quota is hit. Both are called through one interface (`lib/server/ai.ts`) so admins can pick a provider (see §8) without code changes.

### Admin-facing provider choice

Because you asked for "an option for which type of service to use," the Admin Settings page (`/admin/settings`) exposes:

- **OCR provider:** `Tesseract.js (default, free)` | `OCR.space (higher accuracy, free tier)`
- **MCQ generation provider:** `Gemini Flash (default, free)` | `Groq (fast fallback, free)`

These are stored as key/value rows in a `platform_settings` table (see Database doc) and read by `lib/server/ai.ts` / `lib/server/ocr.ts` at request time — no redeploy needed to switch.

---

## 8. Payments

Unchanged in substance from your original PRD: Razorpay is the primary provider, backend-verified, webhook-backed. Implemented as Route Handlers instead of Express routes:

```
POST /api/payments/razorpay/order
POST /api/payments/razorpay/verify
POST /api/payments/razorpay/webhook
```

Frontend Razorpay Checkout success is **never** trusted alone — `purchases.status` only becomes `SUCCESS` after signature verification server-side, and the webhook is the durable source of truth in case the client tab closes mid-flow.

---

## 9. Deployment

- **Single Next.js app** (recommended): deploy to Vercel or any Node host; `app/api/**` and `app/**` ship together. Simplest, matches "frontend and backend deployable independently" only loosely (you'd split by folder if you truly need two deploys later).
- **Split deployment** (if you want strict independence): two Next.js projects — Project A exports only `app/api/**` (the "backend"), Project B is the UI and calls Project A via `NEXT_PUBLIC_API_URL`. Everything in the Backend doc still applies; you'd just move `app/api` into its own repo/project and add CORS handling.

This doc defaults to the single-project model unless you tell me you need the split.
