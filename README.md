# Migrate Mate - Subscription Cancellation Flow Challenge

# My Implementation

# Migrate Mate – Subscription Cancellation Flow

A production-ready Next.js + Tailwind + Supabase implementation of the Migrate Mate **subscription cancellation** journey with a deterministic A/B downsell, multi-step branching, and secure data persistence.

> Works on desktop & mobile, matches the provided Figma as closely as possible, and records a **single final row** per cancellation.

---

## 1) Quick start

```bash
# 1) Install deps
npm install

# 2) Set our Supabase env (hosted project)
#   create .env.local with the 2 values from our Supabase project
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://<our-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<our-anon-key>
EOF

# 3) Run the app
npm run dev
# http://localhost:3000
```

> Use **Supabase hosted Postgres** — not local Docker.

---

## 2) Project structure

```
src/
  app/
    page.tsx                     # Profile page (Cancel button → /cancel/job-status)
    cancel/
      page.tsx                   # A/B entry (deterministic variant, only for “Not yet”)
      job-status/page.tsx        # Step 1: “Have you found a job yet?”
      job-survey/page.tsx        # Step 1 (A): survey + “Did you find this job with MigrateMate?”
      feedback/page.tsx          # Step 2: open feedback (min 25 chars)
      visa-support/page.tsx      # Step 3: immigration lawyer? (asks visa type if “No”)
      offer/page.tsx             # Variant B: 50% off screen (accept/decline)
      done-help/page.tsx         # Final (help coming)
      done-no-help/page.tsx      # Final (no help needed)
  lib/
    supabase.ts                  # Supabase browser client
public/images/
  imagee.png                     # image (used in all modals)
```

**Routing overview**

```
/cancel/job-status
 ├── Yes  → /cancel/job-survey → /cancel/feedback?found=true → /cancel/visa-support → (final page)
/cancel/job-status
 └── Not yet → /cancel (A/B assign) →
               ├── Variant A → reason/feedback flow (no downsell)
               └── Variant B → /cancel/offer → accept/decline → continue → final
```

Intentionally kept **“Not yet”** flowing through `/cancel` to preserve our original deterministic A/B entry. “Yes” follows the new job-found path.

---

## 3) Supabase (hosted) setup

### Authentication

- Used **Supabase hosted Postgres** and created test users in **Authentication → Users** (e.g. `testa@example.com`, `testb@example.com`, `testc@example.com`, `testd@example.com`).
- In **Authentication → URL Configuration** we set:
  - **Site URL**: `http://localhost:3000`
  - **Redirect URLs**: `http://localhost:3000`

### Database schema

Run this once in the SQL Editor to create/extend tables exactly as used by the app:

```sql
-- Extensions (for gen_random_uuid if not default)
create extension if not exists "pgcrypto";

-- Users (managed by Supabase Auth, mirrored lightly here)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- Subscriptions (price in cents)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  monthly_price int4 not null,
  status text not null default 'active',           -- 'active' | 'cancelled'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  pending_cancellation bool default false
);

-- A/B assignment (one row per user)
create table if not exists user_variants (
  user_id uuid primary key references users(id) on delete cascade,
  variant text not null,                           -- 'A' or 'B'
  created_at timestamptz default now()
);

-- Final cancellation record (single row per completed flow)
create table if not exists cancellations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  downsell_variant text,             -- 'A' | 'B'
  reason text,                        -- optional short code
  accepted_downsell bool,
  created_at timestamptz default now(),

  -- open text / survey
  reason_details text,
  survey_roles text,
  survey_emails text,
  survey_interviews text,
  max_price_willing_to_pay numeric,

  -- newly added
  found_with_migratemate boolean,
  visa_type text,
  needs_immigration_help boolean
);
```

If tables already exist, only add the three columns:

```sql
alter table cancellations add column if not exists found_with_migratemate boolean;
alter table cancellations add column if not exists visa_type text;
alter table cancellations add column if not exists needs_immigration_help boolean;
```

### Row-Level Security (RLS) & policies

Turned **RLS ON** for `cancellations`, `subscriptions`, and `user_variants`. Policies we use (matching our screenshots):

```sql
-- cancellations
create policy "Users can insert own cancellations"
on cancellations for insert
with check (auth.uid() = user_id);

create policy "Users can view own cancellations"
on cancellations for select
using (auth.uid() = user_id);

-- subscriptions
create policy "Users can view own subscriptions"
on subscriptions for select
using (auth.uid() = user_id);

create policy "Users can update own subscriptions"
on subscriptions for update
using (auth.uid() = user_id);

-- user_variants (exact from our setup)
create policy "Users can read own variant"
on user_variants for select
using (auth.uid() = user_id);

create policy "Users can insert own variant"
on user_variants for insert
with check (auth.uid() = user_id);

create policy "Users can update own variant"
on user_variants for update
using (auth.uid() = user_id);
```

Also used the **Schema Visualizer** to confirm relationships and keys.

---

## 4) A/B testing logic (deterministic)

- The A/B split is evaluated only when we enter `/cancel` from the **“Not yet”** branch.
- And generate a secure byte via `crypto.getRandomValues`, map to **A/B**, and **persist** in `user_variants`.
- On subsequent visits we **reuse** the variant (no re-randomizing).
- The chosen variant is copied to `cancellations.downsell_variant` when we write the final row.
- Users on the **“Yes, I’ve found a job”** path skip the downsell and behave like **Variant A**.

---

## 5) Data flow & persistence (single final row)

- Kept answers in `localStorage` during the steps:
  - `mm_found_with_migratemate`, `mm_survey_roles`, `mm_survey_emails`, `mm_survey_interviews`, `mm_feedback`.
- We **insert exactly one row** into `cancellations` at the end of each flow:
  - **Job found path**: write on `/cancel/visa-support` → **Complete cancellation**.
  - **Not yet path**:
    - If Variant **B accepted**: write early with `accepted_downsell=true` and keep subscription active (no billing integration in this challenge).
    - If **declined**: continue steps and write at the last screen with `accepted_downsell=false`.
- We mark `subscriptions.status='cancelled'` and `pending_cancellation=false` only on finalization.

This avoids duplicate rows from writing at each intermediate step.

---

## 6) Styling & colors

- Primary purple: `#8952fc` (CTA) with hover `#7b40fc`.
- Offer CTA uses Tailwind **green** shades.
- Offer card uses a lilac panel (`bg-[#EBDDFF]`) with `border-violet-300`.
- Grays: `text-gray-600`, `border-gray-200`, `bg-gray-50`.
- Rounded cards: `rounded-xl`, subtle shadows: `shadow-md`.
- Two-column layout on `lg`, stacked layout on mobile; right image panel uses `/public/images/imagee.png`.

---

## 7) End-to-end testing

We sign in with our test users (created in Supabase Auth). In development we can call `signInWithPassword` in the pages to swap users quickly.

1. Start the app: `npm run dev` → open `http://localhost:3000`.
2. From the profile page, **Manage Subscription → Cancel Migrate Mate** (routes to `/cancel/job-status`).

**Path A – “Yes, I’ve found a job”**

- Fill the four survey questions → **Continue**.
- Type 25+ chars of feedback → **Continue**.
- Visa step:
  - **Yes, company provides lawyer** → **Complete cancellation** → `/cancel/done-help`.
  - **No** → enter visa type → **Complete cancellation** → `/cancel/done-no-help`.
- Verify in DB:
  ```sql
  select * from cancellations order by created_at desc limit 5;
  select * from subscriptions where user_id = '<UID>';
  ```
  We expect one `cancellations` row and `subscriptions.status='cancelled'`.

**Path B – “Not yet”**

- Go to `/cancel` to assign or reuse A/B.
- If **Variant B**: we see 50% offer.
  - **Accept** → insert row with `accepted_downsell=true`; keep subscription `active`; return to profile.
  - **No thanks** → continue to feedback; finalize; see one `cancellations` row with `accepted_downsell=false`.
- If **Variant A**: we continue to reason/feedback flow (no downsell).

**Reset for re-tests**

```sql
delete from cancellations where user_id = '<UID>';
update subscriptions set status='active', pending_cancellation=false where user_id = '<UID>';
delete from user_variants where user_id = '<UID>';
```

**Seed helpers** (if needed)

```sql
-- Mirror Auth UIDs into our users table
insert into users (id, email) values
  ('<UID_a>', 'testa@example.com') on conflict (id) do nothing,
  ('<UID_b>', 'testb@example.com') on conflict (id) do nothing;

-- Give them subscriptions (cents: 2500=$25; 2900=$29)
insert into subscriptions (user_id, monthly_price, status, pending_cancellation) values
  ('<UID_a>', 2500, 'active', false),
  ('<UID_b>', 2900, 'active', false);
```

---

## 8) Security

- **RLS enabled** everywhere; policies restrict access to `auth.uid() = user_id`.
- Inputs are constrained via UI; open text is stored as plain text (challenge scope). We would add stricter validation/escaping in production.
- No payment processing or Stripe calls; downsell accept records a boolean only.

---

## 9) Useful SQL

```sql
-- latest cancellations
select id, user_id, subscription_id, downsell_variant, accepted_downsell,
       reason, reason_details, survey_roles, survey_emails, survey_interviews,
       found_with_migratemate, visa_type, needs_immigration_help, created_at
from cancellations
order by created_at desc
limit 20;

-- subscription state
select * from subscriptions where user_id = '<UID>';
```

---

## 10) Assumptions

- The flow always begins at `/cancel/job-status` from the profile page.
- One active subscription per user.
- We insert only one final `cancellations` row per completed flow.
- A/B applies **only** to the “Not yet” branch via `/cancel` and is persisted in `user_variants` (50/50, secure RNG).
- If we accept Variant B, we short-circuit back to profile with `accepted_downsell=true` and no cancellation.
- If we decline Variant B, we continue into the standard flow and write the final row at the end.
- For the job-found path, we collect: `found_with_migratemate`, survey counts, feedback, and visa info; and we update the subscription to `cancelled`.
- If `subscription_id` is missing, we still write the cancellation with `subscription_id=null` (acceptable for the challenge).
- All step pages are client components to allow `localStorage` and Supabase client calls.
- URL configuration for Auth is `http://localhost:3000` for both site and redirect URLs.
- Auth users are created in Supabase Auth; we mirror their id into our users table (one-to-one) for relational integrity.







-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Overview

Convert an existing Figma design into a fully-functional subscription-cancellation flow for Migrate Mate. This challenge tests your ability to implement pixel-perfect UI, handle complex business logic, and maintain security best practices.

## Objective

Implement the Figma-designed cancellation journey exactly on mobile + desktop, persist outcomes securely, and instrument the A/B downsell logic.

## What's Provided

This repository contains:
- ✅ Next.js + TypeScript + Tailwind scaffold
- ✅ `seed.sql` with users table (25/29 USD plans) and empty cancellations table
- ✅ Local Supabase configuration for development
- ✅ Basic Supabase client setup in `src/lib/supabase.ts`

## Tech Stack (Preferred)

- **Next.js** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Supabase** (Postgres + Row-Level Security)

> **Alternative stacks allowed** if your solution:
> 1. Runs with `npm install && npm run dev`
> 2. Persists to a Postgres-compatible database
> 3. Enforces table-level security

## Must-Have Features

### 1. Progressive Flow (Figma Design)
- Implement the exact cancellation journey from provided Figma
- Ensure pixel-perfect fidelity on both mobile and desktop
- Handle all user interactions and state transitions

### 2. Deterministic A/B Testing (50/50 Split)
- **On first entry**: Assign variant via cryptographically secure RNG
- **Persist** variant to `cancellations.downsell_variant` field
- **Reuse** variant on repeat visits (never re-randomize)

**Variant A**: No downsell screen
**Variant B**: Show "$10 off" offer
- Price $25 → $15, Price $29 → $19
- **Accept** → Log action, take user back to profile page (NO ACTUAL PAYMENT PROCESSING REQUIRED)
- **Decline** → Continue to reason selection in flow

### 3. Data Persistence
- Mark subscription as `pending_cancellation` in database
- Create cancellation record with:
  - `user_id`
  - `downsell_variant` (A or B)
  - `reason` (from user selection)
  - `accepted_downsell` (boolean)
  - `created_at` (timestamp)

### 4. Security Requirements
- **Row-Level Security (RLS)** policies
- **Input validation** on all user inputs
- **CSRF/XSS protection**
- Secure handling of sensitive data

### 5. Reproducible Setup
- `npm run db:setup` creates schema and seed data (local development)
- Clear documentation for environment setup

## Out of Scope

- **Payment processing** - Stub with comments only
- **User authentication** - Use mock user data
- **Email notifications** - Not required
- **Analytics tracking** - Focus on core functionality

## Getting Started

1. **Clone this repository** `git clone [repo]`
2. **Install dependencies**: `npm install`
3. **Set up local database**: `npm run db:setup`
4. **Start development**: `npm run dev`

## Database Schema

The `seed.sql` file provides a **starting point** with:
- `users` table with sample users
- `subscriptions` table with $25 and $29 plans
- `cancellations` table (minimal structure - **you'll need to expand this**)
- Basic RLS policies (enhance as needed)

### Important: Schema Design Required

The current `cancellations` table is intentionally minimal. You'll need to:
- **Analyze the cancellation flow requirements** from the Figma design
- **Design appropriate table structure(s)** to capture all necessary data
- **Consider data validation, constraints, and relationships**
- **Ensure the schema supports the A/B testing requirements**

## Evaluation Criteria

- **Functionality (40%)**: Feature completeness and correctness
- **Code Quality (25%)**: Clean, maintainable, well-structured code
- **Pixel/UX Fidelity (15%)**: Accuracy to Figma design
- **Security (10%)**: Proper RLS, validation, and protection
- **Documentation (10%)**: Clear README and code comments

## Deliverables

1. **Working implementation** in this repository
2. **NEW One-page README.md (replace this)** (≤600 words) explaining:
   - Architecture decisions
   - Security implementation
   - A/B testing approach
3. **Clean commit history** with meaningful messages

## Timeline

Submit your solution within **72 hours** of receiving this repository.

## AI Tooling

Using Cursor, ChatGPT, Copilot, etc. is **encouraged**. Use whatever accelerates your development—just ensure you understand the code and it runs correctly.

## Questions?

Review the challenge requirements carefully. If you have questions about specific implementation details, make reasonable assumptions and document them in your README.

---

**Good luck!** We're excited to see your implementation.


