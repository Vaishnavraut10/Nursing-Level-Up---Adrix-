# Nursing Level Up

## Master Product Requirements Document (PRD)

### Full-Stack Web Application — Frontend, Backend, Database, Authentication, RBAC & CMS

**Product:** Nursing Level Up
**Product Type:** Nursing MCQ Test-Series Platform
**Primary Users:** Nursing students / exam aspirants
**Platform:** Responsive Web Application
**Primary Stack:** Next.js + React + TypeScript + Tailwind CSS + Express.js + PostgreSQL/Neon
**Authentication:** Google OAuth
**Payments:** Razorpay / Stripe architecture, with Razorpay as the primary planned provider
**Admin:** Server-protected Admin CMS
**Deployment:** Frontend and backend deployable independently

---

# 1. PRODUCT OVERVIEW

Nursing Level Up is an online nursing examination practice platform focused on **MCQ-based test series**.

The platform allows students to:

* discover nursing test series
* register/login using Google
* complete their profile
* provide a phone number
* access free tests
* purchase paid test series
* attempt MCQ tests
* submit answers
* receive automatically calculated results
* review performance
* track progress
* access previously purchased tests

Administrators can:

* manage students
* create and manage test series
* create questions
* import questions from HTML and structured files
* publish/unpublish test series
* manage purchases
* inspect attempts and results
* monitor platform statistics
* manage platform content

The system must be **database-driven**.

The database is the source of truth.

The frontend must never independently decide:

* whether a user is authenticated
* whether a user is an admin
* whether a test is paid
* whether a student has purchased a test
* whether a payment succeeded
* what the correct answer is
* what a student's score is

Those decisions must be validated by the backend.

---

# 2. CORE PRODUCT PRINCIPLES

## 2.1 Database-first architecture

The database is the authoritative source for:

* users
* roles
* test series
* questions
* purchases
* attempts
* answers
* results
* access permissions

The frontend consumes backend APIs.

The frontend must not maintain a separate authoritative copy of platform data.

---

## 2.2 Role-based access control

The platform has two primary roles:

```text
STUDENT
ADMIN
```

All authorization must happen server-side.

Frontend route protection is only a UX layer.

Backend middleware is the actual security boundary.

---

## 2.3 Public browsing, authenticated testing

Users may browse the platform without logging in.

However, authentication is required to:

* start a test
* submit a test
* view results
* access dashboard
* access profile
* purchase/unlock a paid test

---

## 2.4 Payment-controlled access

A paid test cannot be accessed simply because the frontend says it is unlocked.

Access must be determined from:

```text
authenticated user
+
test series
+
successful purchase
```

---

## 2.5 Correct-answer security

Correct answers must never be sent to students before submission.

The server must perform scoring.

---

# 3. USER TYPES

## 3.1 Guest

A visitor who is not authenticated.

Can:

* view landing page
* view test-series catalog
* view individual test-series information
* view public creator information
* access login page

Cannot:

* start a test
* access dashboard
* access results
* access profile
* access paid test content
* access admin
* access private APIs

---

# 3.2 Student

Authenticated normal user.

Can:

* manage own profile
* provide phone number
* browse tests
* attempt free tests
* purchase paid tests
* access purchased tests
* submit attempts
* view own results
* view own progress
* view own purchases

Cannot:

* view other users
* manage test series
* modify questions
* publish content
* view platform-wide purchases
* view platform-wide attempts
* access admin APIs

---

# 3.3 Admin

Authenticated user with:

```text
role = ADMIN
```

Can:

* access admin dashboard
* manage users
* manage test series
* manage questions
* import questions
* publish/unpublish tests
* view purchases
* view attempts
* view student progress
* view platform statistics

Admin APIs must verify the role server-side.

---

# 4. COMPLETE SITE ARCHITECTURE

## Public routes

```text
/
 /login
 /test-series
 /test-series/[id]
```

## Student routes

```text
/dashboard
/profile
/complete-profile
/unlock/[id]
/tests/[id]
/results/[id]
```

## Admin routes

```text
/admin/login
/admin
/admin/users
/admin/users/[id]
/admin/test-series
/admin/test-series/create
/admin/test-series/[id]
/admin/test-series/[id]/edit
/admin/test-series/[id]/questions
/admin/test-series/[id]/import
/admin/purchases
/admin/attempts
/admin/attempts/[id]
/admin/settings
```

The exact routing structure may be adjusted to match the existing application, but the functionality and access rules must remain.

---

# 5. PAGE REQUIREMENTS

# 5.1 Landing Page `/`

### Purpose

Introduce Nursing Level Up and direct users toward test-series practice.

### Sections

1. Header/navigation
2. Hero
3. Test-series CTA
4. Free test-series section
5. Paid test-series section
6. Interactive sample MCQ
7. How it works
8. Creator section
9. Footer

### Header

Guest:

* Logo
* Test Series
* Login

Authenticated student:

* Logo
* Test Series
* Dashboard
* Profile/account menu

Admin:

Admin access does not need to appear in public navigation.

### Hero

Primary messaging:

* Nursing MCQ practice
* Practice smarter
* Prepare better

Primary CTA:

```text
Explore Test Series
```

Secondary CTA:

```text
Try Free Test
```

---

# 5.2 Login `/login`

Purpose:

Student authentication.

Primary authentication method:

```text
Continue with Google
```

Google authentication must provide:

* Google ID
* name
* email

Phone number is collected separately.

### Login flow

```text
Login
↓
Google OAuth
↓
Backend verifies Google identity
↓
Find user
↓
Existing user?
 ├─ YES → Login
 └─ NO → Create Student
↓
Phone available?
 ├─ YES → Dashboard
 └─ NO → Complete Profile
```

---

# 5.3 Complete Profile `/complete-profile`

Required after first Google login if phone number is missing.

Display:

* Name
* Email
* Phone number

Name/email come from authenticated Google identity.

Phone is collected from the student.

After completion:

```text
Complete Profile
↓
Save phone
↓
Dashboard / requested destination
```

Phone validation must happen server-side as well.

---

# 5.4 Test Series `/test-series`

Publicly accessible.

Display published tests only.

Each card should contain:

* title
* description
* question count
* duration
* FREE or ₹199
* access state

Possible states:

```text
FREE
LOGIN REQUIRED
PURCHASE REQUIRED
PURCHASED
```

Only:

```text
status = PUBLISHED
```

test series should appear.

---

# 5.5 Test Series Detail `/test-series/[id]`

Public information page.

Display:

* test title
* description
* number of questions
* duration
* price
* free/paid status
* creator/platform information
* instructions
* CTA

CTA behavior:

### Guest + free test

```text
Login to Start
```

### Guest + paid test

```text
Login to Unlock
```

### Logged-in student + free test

```text
Start Test
```

### Logged-in student + unpaid paid test

```text
Unlock for ₹199
```

### Logged-in student + purchased test

```text
Start Test
```

---

# 5.6 Unlock `/unlock/[id]`

For paid test series.

Display:

* test information
* price
* purchase CTA
* payment information
* terms/notice if required

Payment provider integration will eventually be:

```text
Razorpay
```

The backend verifies payment.

Frontend must never independently mark the purchase as successful.

---

# 5.7 Student Dashboard `/dashboard`

Authentication required.

Display:

### Profile summary

* name
* email
* phone

### Test activity

* tests attempted
* tests completed
* average score
* best score

### Purchased tests

List purchased test series.

### Recent attempts

Show:

* test
* date
* score
* percentage

### Progress

Show meaningful student-specific progress.

All dashboard information must come from authenticated backend APIs.

---

# 5.8 Test Page `/tests/[id]`

Authentication required.

Backend validates:

1. user is authenticated
2. test exists
3. test is published/available
4. user has access

Access rules:

### Free

Authenticated student → allowed.

### Paid

Authenticated student + successful purchase → allowed.

Otherwise:

```text
403 / purchase required
```

or redirect to unlock page.

---

## Test UI

Display:

* test title
* timer
* question number
* progress
* question navigator
* question text
* four options
* mark for review
* next
* previous
* submit

Do not send correct answers to frontend.

---

# 5.9 Results `/results/[id]`

Authentication required.

Students can only view their own results.

Display:

* test name
* score
* total questions
* percentage
* correct
* incorrect
* unanswered
* time taken
* completion date

Potentially:

* question-wise review
* explanation
* selected answer
* correct answer

Correct answers are allowed **after submission** for review, subject to product rules.

---

# 5.10 Profile `/profile`

Authentication required.

Display/edit:

* name
* email
* phone

Google-managed identity fields should be treated appropriately.

Allow phone update.

---

# 6. ADMIN ARCHITECTURE

Admin application should have its own layout.

```text
/admin
```

with sidebar navigation:

```text
Dashboard
Users
Test Series
Questions
Purchases
Attempts
Settings
Logout
```

---

# 6.1 Admin Login `/admin/login`

Admin-only authentication entry point.

A normal student must not gain admin access simply by visiting this URL.

After authentication:

```text
role = ADMIN
```

required.

Otherwise:

```text
403 Forbidden
```

or redirect to student application.

---

# 6.2 Admin Dashboard `/admin`

Display:

* total students
* total test series
* published tests
* paid tests
* total purchases
* successful purchases
* revenue
* total attempts
* recent registrations
* recent purchases
* recent attempts

Revenue calculation:

```text
SUM(successful purchases)
```

Do not count:

* failed
* cancelled
* pending

payments as revenue.

---

# 6.3 Users `/admin/users`

Display:

* name
* email
* phone
* role
* registration date
* last login/activity
* attempts
* purchases
* status

Features:

* search
* filters
* pagination
* user detail

---

# 6.4 User Detail `/admin/users/[id]`

Display:

### Identity

* name
* email
* phone
* role
* created date
* last login

### Purchases

* test
* amount
* payment status
* payment provider
* purchase date

### Attempts

* test
* date
* score
* percentage
* time

### Progress

* tests attempted
* average score
* best score
* completion statistics

Admin may view this data.

Students may only view their own data.

---

# 6.5 Test Series Management `/admin/test-series`

Display:

* title
* price
* free/paid
* question count
* status
* created date

Statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Actions:

* create
* edit
* view
* publish
* unpublish
* archive

---

# 6.6 Create Test Series

Fields:

* title
* description
* price
* currency
* free/paid
* duration
* instructions
* status

Question count should ideally be derived from actual questions rather than manually trusted.

---

# 6.7 Edit Test Series

Admin can modify:

* title
* description
* price
* duration
* instructions
* status

Changing price should not alter historical purchases.

Historical purchase records must preserve the amount actually paid.

---

# 6.8 Question Management

Admin can:

* add question
* edit question
* delete question
* reorder questions

Question:

```text
question_text
option_a
option_b
option_c
option_d
correct_answer
explanation
order
```

---

# 6.9 HTML Import

Admin can upload question files.

Primary supported format:

```text
HTML
```

Potential structured formats:

```text
JSON
CSV
XLSX
```

if implemented.

Flow:

```text
Upload
↓
Parse
↓
Validate
↓
Preview
↓
Admin edits
↓
Save
↓
Questions linked to Test Series
```

Never directly render arbitrary uploaded HTML.

Use server-side parsing.

Sanitize extracted content.

---

# 6.10 Purchase Management

Admin can view:

* student
* email
* test
* amount
* currency
* provider
* order ID
* payment ID
* payment status
* purchase date

Statuses:

```text
PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED
```

Only successful purchases grant access.

---

# 6.11 Attempts `/admin/attempts`

Display:

* student
* test
* date
* score
* percentage
* correct
* incorrect
* unanswered
* time taken

Admin can inspect individual attempts.

---

# 7. DATABASE ARCHITECTURE

PostgreSQL is the system of record.

Recommended core schema:

```text
users
test_series
questions
attempts
user_answers
purchases
```

Additional tables may be introduced when required.

---

# 7.1 Users

Conceptual structure:

```text
users
-----
id
google_id
name
email
phone
role
created_at
updated_at
last_login_at
```

Constraints:

* `id` primary key
* `email` unique
* `google_id` unique when present
* controlled role values

Role:

```text
STUDENT
ADMIN
```

---

# 7.2 Test Series

```text
test_series
-----------
id
title
description
price
currency
is_free
duration_minutes
status
instructions
created_at
updated_at
published_at
```

Status:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 7.3 Questions

```text
questions
---------
id
test_series_id
question_text
option_a
option_b
option_c
option_d
correct_answer
explanation
question_order
created_at
updated_at
```

Foreign key:

```text
questions.test_series_id
→ test_series.id
```

Correct answer is private data.

---

# 7.4 Purchases

```text
purchases
---------
id
user_id
test_series_id
amount
currency
provider
order_id
payment_id
status
created_at
updated_at
```

Foreign keys:

```text
user_id
→ users.id

test_series_id
→ test_series.id
```

A successful purchase grants access.

---

# 7.5 Attempts

```text
attempts
--------
id
user_id
test_series_id
started_at
submitted_at
score
total_questions
correct_answers
incorrect_answers
unanswered
percentage
time_taken_seconds
status
```

Status may include:

```text
IN_PROGRESS
COMPLETED
ABANDONED
```

---

# 7.6 User Answers

```text
user_answers
------------
id
attempt_id
question_id
selected_answer
is_correct
created_at
```

Foreign keys:

```text
attempt_id → attempts.id
question_id → questions.id
```

---

# 8. DATABASE RELATIONSHIPS

Core relationship:

```text
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌────────────┐
        │ PURCHASES│ │ ATTEMPTS │ │  PROFILE   │
        └────┬─────┘ └────┬─────┘ └────────────┘
             │            │
             │            │
             ▼            ▼
        ┌──────────────────────┐
        │     TEST SERIES      │
        └──────────┬───────────┘
                   │
                   ▼
             ┌───────────┐
             │ QUESTIONS │
             └─────┬─────┘
                   │
                   ▼
             USER ANSWERS
```

---

# 9. BACKEND ARCHITECTURE

Backend:

```text
Express.js
Node.js
PostgreSQL
```

Recommended structure:

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   │
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── testSeries.ts
│   │   ├── tests.ts
│   │   ├── attempts.ts
│   │   ├── results.ts
│   │   ├── purchases.ts
│   │   │
│   │   └── admin/
│   │       ├── dashboard.ts
│   │       ├── users.ts
│   │       ├── testSeries.ts
│   │       ├── questions.ts
│   │       ├── purchases.ts
│   │       └── attempts.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── testSeriesService.ts
│   │   ├── questionService.ts
│   │   ├── attemptService.ts
│   │   ├── purchaseService.ts
│   │   ├── scoringService.ts
│   │   └── importService.ts
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── security.ts
│   │   └── htmlParser.ts
│   │
│   └── server.ts
│
├── .env
└── package.json
```

The exact structure can differ, but responsibilities should remain separated.

---

# 10. FRONTEND ARCHITECTURE

Frontend:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Recommended structure:

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── test-series/
│   ├── dashboard/
│   ├── profile/
│   ├── complete-profile/
│   ├── unlock/
│   ├── tests/
│   ├── results/
│   │
│   └── admin/
│       ├── login/
│       ├── page.tsx
│       ├── users/
│       ├── test-series/
│       ├── purchases/
│       ├── attempts/
│       └── settings/
│
├── components/
│   ├── navigation/
│   ├── test-series/
│   ├── test/
│   ├── results/
│   ├── dashboard/
│   ├── admin/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── permissions.ts
│   └── validation.ts
│
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
│
└── types/
    ├── user.ts
    ├── testSeries.ts
    ├── question.ts
    ├── purchase.ts
    └── attempt.ts
```

---

# 11. FRONTEND ↔ BACKEND CONNECTION

The frontend must communicate with the backend through APIs.

Architecture:

```text
┌──────────────────────────────┐
│        Next.js Frontend      │
│                              │
│ Pages + Components + Hooks   │
└──────────────┬───────────────┘
               │
               │ HTTPS / REST API
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│                              │
│ Routes → Middleware →        │
│ Services → Validation        │
└──────────────┬───────────────┘
               │
               │ SQL
               ▼
┌──────────────────────────────┐
│       PostgreSQL / Neon      │
│                              │
│ Users / Tests / Questions    │
│ Purchases / Attempts         │
└──────────────────────────────┘
```

The frontend should not directly connect to PostgreSQL.

---

# 12. API ARCHITECTURE

## Authentication

```text
GET /api/auth/me
POST /api/auth/logout
GET /api/auth/google
GET /api/auth/google/callback
```

---

## Public Test Series

```text
GET /api/test-series
GET /api/test-series/:id
```

Only published tests should be returned publicly.

---

## Student

```text
GET /api/me
PUT /api/me/profile

GET /api/me/purchases
GET /api/me/attempts
GET /api/me/progress

POST /api/tests/:id/start
POST /api/tests/:id/submit

GET /api/results/:id
```

---

## Purchases

```text
POST /api/purchases/create
GET /api/purchases/:id
```

Future:

```text
POST /api/payments/razorpay/order
POST /api/payments/razorpay/verify
POST /api/payments/razorpay/webhook
```

---

# 13. ADMIN API

```text
GET /api/admin/dashboard

GET /api/admin/users
GET /api/admin/users/:id

GET /api/admin/test-series
POST /api/admin/test-series
GET /api/admin/test-series/:id
PUT /api/admin/test-series/:id
DELETE /api/admin/test-series/:id

POST /api/admin/test-series/:id/publish
POST /api/admin/test-series/:id/unpublish
POST /api/admin/test-series/:id/archive

GET /api/admin/test-series/:id/questions
POST /api/admin/test-series/:id/questions

PUT /api/admin/questions/:id
DELETE /api/admin/questions/:id

POST /api/admin/test-series/:id/import/html

GET /api/admin/purchases
GET /api/admin/purchases/:id

GET /api/admin/attempts
GET /api/admin/attempts/:id
```

Every `/api/admin/*` route requires:

```text
authenticated user
+
role = ADMIN
```

---

# 14. REQUEST LIFECYCLE

Example: Student starts a test.

```text
Student clicks "Start Test"
        ↓
Next.js frontend
        ↓
POST /api/tests/:id/start
        ↓
Authentication middleware
        ↓
Identify user
        ↓
Test access service
        ↓
Is test published?
        ↓
Is test free?
       / \
     YES  NO
      │    │
      │    ▼
      │  Check successful purchase
      │    │
      └────┴──────► Access granted
                       ↓
                 Create attempt
                       ↓
                Return questions
                       ↓
                 Start frontend
```

Correct answers are excluded from the response.

---

# 15. TEST SUBMISSION FLOW

```text
Student answers questions
        ↓
Frontend sends selected answers
        ↓
POST /api/tests/:id/submit
        ↓
Authenticate user
        ↓
Verify attempt ownership
        ↓
Load correct answers from DB
        ↓
Score server-side
        ↓
Store user_answers
        ↓
Update attempts
        ↓
Calculate result
        ↓
Return result
```

Never trust a frontend-provided:

```text
score
correct
percentage
isCorrect
```

---

# 16. PAYMENT FLOW

Future production flow:

```text
Student
  ↓
Select ₹199 Test
  ↓
Frontend requests order
  ↓
Backend creates Razorpay order
  ↓
Razorpay Checkout
  ↓
Payment
  ↓
Razorpay response
  ↓
Backend verification
  ↓
Signature verified
  ↓
Purchase = SUCCESS
  ↓
Student access granted
```

Webhook should also be implemented for reliable payment-state synchronization.

Frontend payment success alone must never grant access.

---

# 17. ROLE-BASED ACCESS CONTROL

## Permission matrix

| Feature             | Guest |  Student | Admin |
| ------------------- | ----: | -------: | ----: |
| Landing             |   Yes |      Yes |   Yes |
| Browse tests        |   Yes |      Yes |   Yes |
| View test details   |   Yes |      Yes |   Yes |
| Login               |   Yes |      Yes |   Yes |
| Dashboard           |    No |      Yes |    No |
| Profile             |    No |      Yes |    No |
| Start test          |    No |      Yes |   Yes |
| Submit test         |    No |      Yes |   Yes |
| Own results         |    No |      Yes |   Yes |
| Own purchases       |    No |      Yes |   Yes |
| All users           |    No |       No |   Yes |
| User details        |    No | Own only |   Yes |
| Create test         |    No |       No |   Yes |
| Edit test           |    No |       No |   Yes |
| Delete/archive test |    No |       No |   Yes |
| Publish test        |    No |       No |   Yes |
| Manage questions    |    No |       No |   Yes |
| Import HTML         |    No |       No |   Yes |
| All purchases       |    No |       No |   Yes |
| All attempts        |    No |       No |   Yes |
| Platform analytics  |    No |       No |   Yes |
| Admin settings      |    No |       No |   Yes |

---

# 18. AUTHORIZATION LAYERS

There should be multiple layers.

## Layer 1 — Frontend route protection

Used for user experience.

Example:

```text
/dashboard
/tests/*
/results/*
/admin/*
```

---

## Layer 2 — Backend authentication

Verify session/token.

---

## Layer 3 — Backend authorization

Verify:

```text
role = ADMIN
```

for admin resources.

---

## Layer 4 — Resource ownership

Example:

Student requests:

```text
GET /api/results/123
```

Backend checks:

```text
result.user_id === authenticatedUser.id
```

unless admin.

---

## Layer 5 — Business rules

Example:

```text
paid test
+
successful purchase
=
access
```

---

# 19. SECURITY REQUIREMENTS

The system must:

* use parameterized SQL
* validate request bodies
* validate URL parameters
* sanitize uploaded HTML
* prevent XSS
* prevent SQL injection
* prevent IDOR
* protect admin endpoints
* protect private user data
* prevent answer-key exposure
* prevent frontend-only access control
* prevent fake payment confirmation
* prevent arbitrary HTML script execution
* use HTTPS in production
* keep secrets in environment variables

Never commit:

```text
DATABASE_URL
GOOGLE_CLIENT_SECRET
RAZORPAY_SECRET
STRIPE_SECRET
SESSION_SECRET
```

to Git.

---

# 20. API ERROR STANDARD

Use consistent responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

Common HTTP codes:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Frontend must display useful error states.

Do not silently substitute fake data.

---

# 21. ENVIRONMENT ARCHITECTURE

Frontend:

```text
NEXT_PUBLIC_API_URL
```

Backend:

```text
DATABASE_URL

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL

SESSION_SECRET

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Only safe public variables should be exposed to the browser.

---

# 22. DATA OWNERSHIP RULES

## Student owns

* own profile
* own attempts
* own answers
* own purchases
* own results

## Admin owns/manages

* platform content
* users
* test series
* questions
* purchases visibility
* attempts visibility

Admin must not modify historical payment amounts to change revenue statistics.

Historical attempt data must remain intact.

---

# 23. TEST SERIES LIFECYCLE

```text
DRAFT
  ↓
Questions Added
  ↓
Validated
  ↓
PUBLISHED
  ↓
Visible Publicly
  ↓
Students Attempt/Purchase
  ↓
UNPUBLISHED or ARCHIVED
```

Unpublishing must not delete:

* purchases
* attempts
* results
* user answers

---

# 24. CONTENT MANAGEMENT WORKFLOW

Admin creates:

```text
Test Series
```

Then:

```text
Add Questions
```

or:

```text
Import HTML
```

Then:

```text
Validate
```

Then:

```text
Preview
```

Then:

```text
Save
```

Then:

```text
Publish
```

Then automatically:

```text
GET /api/test-series
```

returns the published test.

The frontend requires **no code change**.

---

# 25. STUDENT ACCESS WORKFLOW

```text
Guest
 ↓
Browse Test Series
 ↓
Select Test
 ↓
View Details
 ↓
Start
 ↓
Login Required
 ↓
Google Login
 ↓
Phone Required?
 ├── YES → Complete Profile
 └── NO
 ↓
Free?
 ├── YES → Start
 └── NO
       ↓
    Purchased?
     ├── YES → Start
     └── NO → Unlock
```

---

# 26. GOOGLE AUTHENTICATION

Production Google OAuth must use:

```text
Google OAuth 2.0 / OpenID Connect
```

Backend must verify the returned identity.

Never trust arbitrary client-provided:

```text
email
google_id
role
```

without verification.

Account matching should primarily use the verified Google identity and verified email.

---

# 27. USER REGISTRATION

First-time Google login:

```text
Google
 ↓
Verified identity
 ↓
Create users row
 ↓
role = STUDENT
 ↓
name
email
google_id
 ↓
Phone missing
 ↓
Complete profile
```

Never allow a new user to choose:

```text
role = ADMIN
```

during registration.

Admin accounts must be provisioned separately.

---

# 28. ADMIN PROVISIONING

Admin role should be assigned through:

* database seed
* controlled admin operation
* secure server-side process

Never allow:

```text
POST /register
{
  "role": "ADMIN"
}
```

to create an administrator.

---

# 29. PERFORMANCE REQUIREMENTS

The application should:

* paginate large admin tables
* avoid loading all users at once
* avoid loading all attempts at once
* index frequently queried columns
* minimize unnecessary API calls
* use appropriate database queries
* avoid N+1 query patterns where possible

Recommended indexes:

```text
users.email
users.google_id
users.role

test_series.status

questions.test_series_id

purchases.user_id
purchases.test_series_id
purchases.status

attempts.user_id
attempts.test_series_id
attempts.status

user_answers.attempt_id
```

---

# 30. RESPONSIVE DESIGN

The student website must work on:

* desktop
* laptop
* tablet
* mobile

The test interface is particularly important on mobile.

Admin dashboard should support responsive layouts, but desktop is the primary administration environment.

---

# 31. UI/UX DIRECTION

The student experience should be:

* clean
* academic
* nursing-focused
* calm
* readable
* simple
* professional

Avoid:

* excessive glassmorphism
* excessive gradients
* neon effects
* unnecessary 3D
* excessive floating cards
* generic AI-dashboard appearance

Animations should be:

* subtle
* purposeful
* fast
* accessible

Support:

```text
prefers-reduced-motion
```

---

# 32. ADMIN UI DIRECTION

Admin UI should prioritize:

* information density
* clarity
* tables
* filters
* forms
* status badges
* predictable navigation
* confirmation dialogs
* clear error states

It does not need the same visual treatment as the student-facing site.

---

# 33. FORM VALIDATION

Frontend validation provides immediate feedback.

Backend validation is mandatory.

Examples:

Test Series:

```text
title required
price >= 0
duration > 0
status valid
```

Question:

```text
question required
A required
B required
C required
D required
correct answer ∈ A/B/C/D
```

Phone:

```text
valid format
required for completed student profile
```

---

# 34. ADMIN AUDIT CONSIDERATIONS

For important administrative actions, consider recording:

* admin user
* action
* entity
* entity ID
* timestamp

Examples:

```text
TEST_CREATED
TEST_UPDATED
TEST_PUBLISHED
TEST_UNPUBLISHED
QUESTION_IMPORTED
QUESTION_DELETED
```

An audit-log table may be introduced if required.

---

# 35. FILE IMPORT ARCHITECTURE

```text
Browser
 ↓
Multipart upload
 ↓
Backend
 ↓
File type validation
 ↓
Size validation
 ↓
Parser
 ↓
Sanitization
 ↓
Question extraction
 ↓
Validation
 ↓
Preview response
 ↓
Admin confirmation
 ↓
Database insertion
```

Do not execute uploaded files.

Limit upload size.

Validate file extension and MIME type where practical.

---

# 36. DEVELOPMENT DATA

Seed development environment with:

```text
1 Admin
5 Students
5 Test Series
25 Questions
Sample Purchases
Sample Attempts
```

Use realistic but clearly fictional development data.

---

# 37. END-TO-END SYSTEM FLOW

## Student

```text
Landing
 ↓
Test Series
 ↓
Test Details
 ↓
Login
 ↓
Google
 ↓
Complete Profile
 ↓
Dashboard
 ↓
Test
 ↓
Submit
 ↓
Score
 ↓
Results
 ↓
Progress
```

## Paid Student

```text
Test Details
 ↓
Login
 ↓
Unlock
 ↓
Razorpay
 ↓
Backend Verification
 ↓
Purchase SUCCESS
 ↓
Access Granted
 ↓
Test
 ↓
Results
```

## Admin

```text
Admin Login
 ↓
Dashboard
 ↓
Create Test
 ↓
Import Questions
 ↓
Validate
 ↓
Publish
 ↓
Public Website
 ↓
Students Access
 ↓
Attempts/Purchases
 ↓
Admin Analytics
```

---

# 38. SYSTEM OF RECORD

For every important value:

| Data              | Source of Truth                        |
| ----------------- | -------------------------------------- |
| Authentication    | Backend session                        |
| User role         | PostgreSQL                             |
| User profile      | PostgreSQL                             |
| Test availability | PostgreSQL                             |
| Test price        | PostgreSQL                             |
| Test status       | PostgreSQL                             |
| Questions         | PostgreSQL                             |
| Correct answers   | PostgreSQL                             |
| Purchase status   | PostgreSQL + verified payment provider |
| Test access       | Backend business logic                 |
| Score             | Backend scoring service                |
| Results           | PostgreSQL                             |
| Progress          | Derived from backend data              |

---

# 39. IMPORTANT ANTI-PATTERNS

Do NOT implement:

```text
localStorage.role = "ADMIN"
```

Do NOT implement:

```text
localStorage.isPurchased = true
```

Do NOT implement:

```text
frontendScore = ...
```

as the authoritative result.

Do NOT expose:

```text
correct_answer
```

in pre-submission student APIs.

Do NOT allow:

```text
?role=ADMIN
```

to grant privileges.

Do NOT allow:

```text
?paid=true
```

to grant access.

Do NOT allow frontend payment callbacks alone to grant test access.

---

# 40. ACCEPTANCE CRITERIA

The product is considered functionally complete only when all of the following work.

## Authentication

* Google login works.
* New users are created.
* Existing users are recognized.
* Name is stored.
* Email is stored.
* Google ID is stored.
* Phone is collected.
* Student role is assigned automatically.
* Sessions are server validated.

## Student

* Guest can browse.
* Guest cannot start tests.
* Student can start free tests.
* Student cannot access unpaid paid tests.
* Purchased student can access paid tests.
* Student can submit.
* Backend calculates score.
* Student can see own result.
* Student cannot see another student's data.

## Admin

* Admin login works.
* Admin dashboard works.
* Users work.
* User details work.
* Test-series CRUD works.
* Questions work.
* HTML import works.
* Publish/unpublish works.
* Purchases work.
* Attempts work.
* Non-admin cannot access admin APIs.

## Database

* PostgreSQL works.
* Foreign keys work.
* Constraints work.
* Seed data works.
* API uses real database.
* No production mock data is presented as real data.

## Payments

* Paid access is based on successful purchase.
* Historical purchases remain available.
* Payment architecture is ready for Razorpay verification/webhooks.

---

# 41. DEVELOPMENT PHASES

The implementation should be completed in the following order.

## Phase 1 — Foundation

* Next.js frontend
* Express backend
* PostgreSQL
* environment configuration
* base API architecture

## Phase 2 — Student UI

* landing
* login
* test series
* test details
* dashboard
* profile
* test interface
* results

## Phase 3 — Database/API

* users
* test series
* questions
* attempts
* answers
* purchases
* APIs

## Phase 4 — Admin CMS

* admin login
* dashboard
* users
* test series
* questions
* HTML import
* purchases
* attempts

## Phase 5 — Authentication

* Google OAuth
* sessions
* profile completion
* phone number
* protected routes
* RBAC

## Phase 6 — Test Engine

* start attempt
* answer saving
* timer
* submission
* server-side scoring
* results
* progress

## Phase 7 — Payments

* Razorpay
* order creation
* payment verification
* webhook
* successful purchase
* access control

## Phase 8 — Production Hardening

* security testing
* IDOR testing
* XSS testing
* SQL injection testing
* rate limiting
* validation
* error handling
* logging
* performance
* deployment

---

# 42. FINAL ARCHITECTURAL PRINCIPLE

The final architecture must follow:

```text
                    NURSING LEVEL UP
                           │
          ┌────────────────┴────────────────┐
          │                                 │
     STUDENT APP                       ADMIN APP
          │                                 │
          └───────────────┬─────────────────┘
                          │
                     REST APIs
                          │
                    EXPRESS SERVER
                          │
          ┌───────────────┼────────────────┐
          │               │                │
       AUTH/RBAC      SERVICES         VALIDATION
          │               │                │
          └───────────────┼────────────────┘
                          │
                     PostgreSQL
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
      USERS          TEST CONTENT        TRANSACTIONS
        │                 │                  │
        │           ┌─────┴─────┐       ┌────┴─────┐
        │           │           │       │          │
      Profile    Test Series Questions Purchases Attempts
        │                                      │
        └──────────────────────────────────────┘
```

The **frontend is the presentation layer**.

The **Express backend is the business/security layer**.

The **PostgreSQL database is the system of record**.

The **payment provider is the payment verification authority**.

The **Google OAuth provider is the identity provider**.

No frontend state should be trusted as the final authority for authentication, authorization, payment, scoring, or ownership.

---

# 43. FINAL PRODUCT DEFINITION

Nursing Level Up is ultimately a:

**Full-stack nursing MCQ examination platform with public test discovery, Google-authenticated student accounts, profile management, free and paid test series, secure server-side test access, automated MCQ evaluation, student progress tracking, payment-based access, and an administrator-controlled content management system.**

The architecture must allow an administrator to create and publish a new test series without requiring a developer to modify frontend code.

The complete data flow is:

```text
ADMIN
 ↓
Creates Test Series
 ↓
Adds/Imports Questions
 ↓
Publishes
 ↓
PostgreSQL
 ↓
Backend API
 ↓
Student Website
 ↓
Student Login
 ↓
Access Validation
 ↓
Free Test OR Verified Purchase
 ↓
Attempt
 ↓
Server-Side Scoring
 ↓
Results
 ↓
Progress
 ↓
Admin Analytics
```

This architecture is the source of truth for future implementation decisions. Any new feature should integrate into this architecture rather than introducing a parallel authentication, database, payment, or authorization system.
