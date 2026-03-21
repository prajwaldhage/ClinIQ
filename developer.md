# NexusMD (CliniQ) — Complete Developer Guide

> Last updated: 2026-03-21
> Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Groq · Deepgram
> **New:** OCR Document Ingestion · Patient Timeline · Insurance Claims · Fixed PDF Download

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Full Architecture](#2-full-architecture)
   - [Frontend](#21-frontend)
   - [Backend (API Routes)](#22-backend-api-routes)
   - [Database](#23-database)
   - [State Management](#24-state-management)
   - [End-to-End Flow](#25-end-to-end-integration-flow)
3. [Folder Structure](#3-folder-structure)
4. [Setup Guide](#4-setup-guide)
5. [Environment Variables](#5-environment-variables)
6. [API Integrations & Keys](#6-api-integrations--keys)
7. [Database Setup](#7-database-setup)
8. [How to Run](#8-how-to-run)
9. [Demo Credentials](#9-demo-credentials)
10. [All API Routes Reference](#10-all-api-routes-reference)
11. [Complete User Workflows](#11-complete-user-workflows)
12. [Feature List](#12-feature-list)
13. [Known Issues & Fixes](#13-known-issues--fixes)
14. [Improvements & Roadmap](#14-improvements--roadmap)
15. [Presenting This Project](#15-presenting-this-project)

---

## 1. Project Overview

### What is NexusMD?

**NexusMD** (branded as **CliniQ**) is an **AI-powered clinic management and clinical documentation platform** built for **Indian healthcare**.

Indian doctors currently spend 2–3 hours per day on manual documentation — writing prescriptions, filling out EMR forms, coding diagnoses. NexusMD eliminates this by listening to the live doctor-patient conversation, automatically extracting structured clinical data, and producing a complete Electronic Medical Record (EMR) in real time.

### Problem It Solves

| Problem                                    | NexusMD Solution                                       |
| ------------------------------------------ | ------------------------------------------------------ |
| Manual SOAP notes take 15 min per patient  | AI scribe extracts EMR in real time from voice         |
| Doctors miss dangerous drug combinations   | Real-time drug safety guard with clinical alternatives |
| Generic drugs ignored (Jan Aushadhi)       | Cost comparison panel — avg 70% savings                |
| Diagnosis ignores local disease season     | Epidemiology engine boosts seasonal Indian diseases    |
| Patients don't understand their diagnosis  | AI bot explains in plain language / Hindi              |
| No audit trail for medico-legal protection | SHA-256 tamper-evident chain on all events             |

### Who Uses It

| Role           | Portal          | Purpose                                           |
| -------------- | --------------- | ------------------------------------------------- |
| `doctor`       | `/doctor`       | Consultations, EMR, prescriptions, safety alerts  |
| `patient`      | `/patient`      | Appointments, prescriptions, AI chat, PDF reports |
| `admin`        | `/admin`        | Analytics, user management, audit logs, settings  |
| `receptionist` | `/receptionist` | Patient queue, appointment booking                |
| `research`     | `/research`     | Anonymised analytics, epidemiology dashboards     |
| `nurse`        | → `/doctor`     | Shared access with doctor portal                  |

---

## 2. Full Architecture

### 2.1 Frontend

**Framework:** Next.js 16 (App Router), React 19, TypeScript
**Styling:** Tailwind CSS v4, Framer Motion animations
**UI Primitives:** Radix UI (accessible headless components)
**Icons:** Lucide React
**Charts:** Recharts

#### Routing Logic

```
/                  → Server component → reads nehusmd_session cookie
                       No cookie  → redirect /login
                       Has cookie → redirect to role dashboard (/doctor, /patient, etc.)

/login             → Demo login form + one-click role buttons
                   → POST /api/auth/login → set cookie → redirect

/doctor            → layout.tsx: requireRole(['doctor','nurse']) gate
/patient           → layout.tsx: requireRole(['patient']) gate
/admin             → layout.tsx: requireRole(['admin']) gate
/receptionist      → layout.tsx: requireRole(['receptionist']) gate
/research          → layout.tsx: requireRole(['research']) gate
```

#### Component Pattern

Every page follows this pattern:

```
page.tsx (Server Component)
  → reads session cookie (server-side)
  → fetches initial data from Supabase (server-side)
  → passes props to <XxxClient> (Client Component)
      → Zustand store updates
      → Real-time UI updates
```

#### Data Flow

```
User interaction
  → Client Component (e.g. ActiveConsultationClient.tsx)
  → fetch('/api/extract', { transcript })
  → API route calls Groq / Supabase
  → Response → stored in Zustand consultationStore
  → All panels subscribed to store re-render automatically
       LiveTranscriptPanel  ← scribe state
       SafetyAlertModal     ← safety_alerts
       LiveBillingPanel     ← billing_draft
       DrugCostPanel        ← drug_costs
```

---

### 2.2 Backend (API Routes)

There is **no separate backend server**. All backend logic lives inside Next.js API Routes (`src/app/api/`). They run server-side in the same process as the frontend.

#### Architecture Pattern

```
Client (browser)
  → fetch('/api/...')
  → src/app/api/.../route.ts  (Next.js Route Handler)
      → reads auth cookie (getServerUser)
      → calls Supabase / Groq / Deepgram
      → returns NextResponse.json(...)
  → Client receives typed JSON
```

#### Auth System

The project uses **demo auth** — no real Supabase Auth.

```typescript
// Login: encode user as base64 JSON into cookie
const session = Buffer.from(JSON.stringify(user)).toString("base64");
cookies().set("nexusmd_session", session, { httpOnly: true, sameSite: "lax" });

// Server: decode and validate on every request
const raw = cookies().get("nexusmd_session")?.value;
const user = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
```

> **Security note:** This is sufficient for a demo/portfolio. For production, replace with JWT (`jsonwebtoken`) or real Supabase Auth, and add Row Level Security (RLS) in Supabase.

---

### 2.3 Database

**Database:** PostgreSQL hosted on **Supabase**
**Client:** `@supabase/supabase-js` v2 + `@supabase/ssr`

#### Core Schema

```
users
  id · email · role · name · language_pref · avatar_url · created_at

patients
  id · user_id(→users) · name · dob · gender · blood_group
  allergies[] · chronic_conditions[] · abha_id · phone · family_id

consultations
  id · doctor_id(→users) · patient_id(→patients)
  status · consultation_type · consent_recorded · fhir_bundle(jsonb)

emr_entries
  id · consultation_id(→consultations)
  vitals(jsonb) · symptoms[] · icd_codes(jsonb) · medications(jsonb)
  lab_tests_ordered[] · gap_prompts[] · clinical_summary · patient_summary

safety_alerts
  id · consultation_id · alert_type · severity · acknowledged
  drug_a · drug_b · alternatives[] · override_reason

prescriptions
  id · consultation_id · patient_id · medications(jsonb) · issued_at

appointments
  id · patient_id · doctor_id · scheduled_at · status · notes

billing_drafts
  id · consultation_id · line_items(jsonb) · subtotal · tax · total · status

audit_logs
  id · event_type · actor_id · actor_role · payload(jsonb) · hash · previous_hash

family_members
  id · family_id · patient_id · relationship

queue_entries
  id · patient_id · position · status · created_at

uploaded_documents  ← NEW (v2.0)
  id · patient_id · doctor_id · file_name · file_url · file_type
  extracted_text · ocr_confidence · structured_data(jsonb)
  consultation_id · document_date · processing_status · uploaded_at
```

#### Key Relationships

```
users (1) ────────── (1) patients
users (1) ────────── (N) consultations      [as doctor]
patients (1) ──────── (N) consultations
consultations (1) ─── (1) emr_entries
consultations (1) ─── (N) safety_alerts
consultations (1) ─── (N) prescriptions
consultations (1) ─── (1) billing_drafts
patients (N) ───────── (N) family_members   [via family_id]
```

---

### 2.4 State Management

**Library:** Zustand v5

The `consultationStore` (`src/store/consultationStore.ts`) is the central state for the doctor's active consultation session:

```typescript
ConsultationStoreState {
  active_consultation: Consultation | null   // current session
  patient: Patient | null                    // patient being seen
  scribe: ScribeState                        // Deepgram transcript + recording state
  emr_entry: Partial<EMREntry>               // AI-extracted clinical data
  safety_alerts: SafetyAlert[]               // drug interaction alerts
  differentials: Differential[]              // AI diagnosis probabilities
  drug_costs: DrugCost[]                     // Jan Aushadhi savings
  billing_draft: Partial<BillingDraft>       // auto-generated bill
  audit_entries: AuditEntry[]                // event chain
  is_extracting: boolean                     // loading state for Groq calls
  last_extraction_at: number | null
}
```

---

### 2.5 End-to-End Integration Flow

**Standard Consultation Flow:**

```
1. User → http://localhost:3000
         ↓
2. [/] Server page reads cookie
   No cookie → /login
   Has cookie → /doctor (or role dashboard)
         ↓
3. [/login] One-click "Doctor" button
   → POST /api/auth/login { email, password }
   → findUser() in DEMO_USERS array
   → Set httpOnly cookie: nexusmd_session = base64(userJSON)
   → Redirect → /doctor
         ↓
4. [/doctor/layout.tsx] Server component
   → getServerUser() decodes cookie
   → requireRole(['doctor']) ✓
   → Renders DashboardShell + AppSidebar + DoctorDashboardClient
         ↓
5. Doctor navigates to [/doctor/consultation]
   → Zustand: startConsultation()
   → useMedicalScribe hook fires:
       POST /api/transcribe → short-lived Deepgram token (30s TTL)
       Open WebSocket: wss://api.deepgram.com/v1/listen?model=nova-2-medical
       Microphone stream → WebSocket → live transcript segments
         ↓
6. Auto-extraction every 30 seconds (or manual trigger)
   → POST /api/extract { transcript, consultationId, location: "pune" }
   → Groq runs TWO parallel LLM calls:
       Call 1: Extract structured EMR
               { vitals, symptoms, diagnosis, icd_codes,
                 medications, lab_tests, gap_prompts }
       Call 2: Differential diagnosis
               + epidemiology context (monsoon→Dengue spike)
   → consultationStore.setEMR({ emr, differentials })
         ↓
7. Safety check fires on every medication change
   → POST /api/safety/live { meds[], allergies[] }
   → safety-guard.ts checks 13 drug-drug pairs + 8 allergy rules
   → If critical alert: SafetyAlertModal opens immediately
         ↓
8. Jan Aushadhi panel updates
   → jan-aushadhi.ts maps each medication → generic equivalent
   → Shows brand vs generic price + nearest Jan Aushadhi store
         ↓
9. Billing auto-generates
   → billing-engine.ts maps EMR procedures → BillingItem[]
   → Adds consultation fee + GST
   → LiveBillingPanel shows running total
         ↓
10. Consultation ends
    → EMR saved: POST /api/consultations/[id]/emr
    → Audit log: SHA-256(event + previous_hash) stored to Supabase
    → Patient summary generated (plain language)
    → Bill finalized
         ↓
11. Patient logs in → /patient
    → /patient/prescriptions: view medications
    → /patient/chat: AI bot explains diagnosis
    → /patient/reports: download PDF (jsPDF)
```

**New: Document Ingestion Flow (v2.0)** 🆕

```
1. Patient logs in → /patient/reports
         ↓
2. Clicks "Upload Document"
   → DocumentUploadModal opens
         ↓
3. Selects prescription image (JPEG/PNG)
   → File converted to base64
   → Preview shown
         ↓
4. Clicks "Upload & Extract"
   → POST /api/documents {
       patient_id,
       file_name,
       image_base64
     }
         ↓
 API Processing:
   Step 1: Groq Vision OCR
     → Extract raw text from image
     → Returns ~500-2000 characters

   Step 2: Groq LLaMA Extraction
     → Input: raw OCR text
     → Output: structured JSON {
         doctor_name, hospital, date,
         diagnosis[], medications[], lab_tests[]
       }

   Step 3: Database Storage
     → INSERT INTO uploaded_documents
     → Returns document_id + structured_data
         ↓
6. Modal shows extraction results
   → Medications: Metformin 500mg BD
   → Diagnosis: Type 2 Diabetes
   → OCR Confidence: 92%
         ↓
7. Timeline automatically refreshes
   → New document appears in chronological order
   → Expandable card shows extracted data
```

**New: Insurance Claim Flow (v2.0)** 🆕

```
1. Doctor completes consultation
   → EMR saved, billing finalized
         ↓
2. Doctor/Patient clicks "Generate Insurance Claim"
   → POST /api/insurance-claim { consultation_id }
         ↓
3. API fetches complete consultation data:
   → SELECT consultations + emr_entries + prescriptions + billing
         ↓
4. Build context for AI:
   → Patient: age, gender, chronic conditions
   → Clinical: diagnosis, ICD codes, vitals, symptoms
   → Treatment: medications, lab tests, procedures
   → Billing: itemized costs
         ↓
5. Groq AI generates claim:
   → Prompt: IRDA-compliant insurance claim generator
   → Returns structured claim with:
       - Clinical summary
       - Treatment details
       - Cost breakdown by category
       - Justification paragraph
       - Required supporting documents list
         ↓
6. Frontend receives claim data
   → Calls generateInsuranceClaimPDF(claim)
   → Opens new window with styled HTML form
         ↓
7. User can:
   → Print immediately
   → Save as PDF
   → Fill in policy number fields
   → Attach to insurance submission
```

---

## 3. Folder Structure

```
CliniQ-main/
├── .env.local                         ← Environment variables (NEVER commit)
├── .nvmrc                             ← Node version: 20
├── next.config.ts                     ← Next.js configuration
├── tsconfig.json                      ← TypeScript config
├── package.json                       ← Dependencies (name: "nexusmd")
├── components.json                    ← shadcn/ui config
│
├── public/                            ← Static assets
│
├── supabase/
│   └── migrations/
│       ├── 001_nexusmd_schema.sql     ← Core tables
│       ├── 002_family_members.sql     ← Family graph table
│       ├── 002_supplementary.sql      ← Additional tables
│       ├── 003_seed_data.sql          ← Demo data
│       └── 004_receptionist.sql       ← Queue + reception tables
│
└── src/
    ├── app/
    │   ├── layout.tsx                 ← Root layout (html, body, theme)
    │   ├── page.tsx                   ← Root → redirect based on auth
    │   ├── globals.css                ← Tailwind v4 + CSS variables
    │   ├── favicon.ico
    │   │
    │   ├── login/
    │   │   └── page.tsx               ← Login page + quick-login buttons
    │   │
    │   ├── doctor/
    │   │   ├── layout.tsx             ← requireRole(['doctor','nurse'])
    │   │   ├── page.tsx               ← Dashboard
    │   │   ├── consultation/page.tsx  ← Live scribe + EMR
    │   │   ├── patients/page.tsx      ← Patient list
    │   │   ├── emr/page.tsx           ← EMR records browser
    │   │   ├── billing/page.tsx       ← Billing drafts
    │   │   └── alerts/page.tsx        ← Safety alerts list
    │   │
    │   ├── patient/
    │   │   ├── layout.tsx             ← requireRole(['patient'])
    │   │   ├── page.tsx               ← Patient dashboard
    │   │   ├── appointments/page.tsx
    │   │   ├── prescriptions/page.tsx
    │   │   ├── reports/page.tsx       ← PDF downloads
    │   │   ├── chat/page.tsx          ← AI chatbot
    │   │   └── account/page.tsx
    │   │
    │   ├── admin/
    │   │   ├── layout.tsx             ← requireRole(['admin'])
    │   │   ├── page.tsx
    │   │   ├── analytics/page.tsx
    │   │   ├── users/page.tsx
    │   │   ├── consultations/page.tsx
    │   │   ├── audit/page.tsx
    │   │   └── settings/page.tsx
    │   │
    │   ├── receptionist/
    │   │   ├── layout.tsx
    │   │   └── page.tsx               ← Queue management
    │   │
    │   ├── research/
    │   │   ├── layout.tsx
    │   │   └── page.tsx               ← Anonymised analytics
    │   │
    │   └── api/                       ← ALL backend logic lives here
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   └── logout/route.ts
    │       ├── extract/route.ts        ← Groq AI: EMR + differentials
    │       ├── transcribe/route.ts     ← Deepgram token proxy
    │       ├── patient-bot/route.ts    ← AI patient chatbot
    │       ├── patient-summary/route.ts
    │       ├── safety/
    │       │   ├── route.ts
    │       │   └── live/route.ts       ← Real-time drug safety
    │       ├── patients/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── profile/route.ts
    │       │       ├── consultations/route.ts
    │       │       ├── appointments/route.ts
    │       │       └── prescriptions/route.ts
    │       ├── consultations/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── emr/route.ts
    │       │       ├── billing/route.ts
    │       │       └── prescriptions/route.ts
    │       ├── admin/
    │       │   ├── analytics/route.ts
    │       │   ├── users/route.ts
    │       │   └── consultations/route.ts
    │       ├── audit/route.ts
    │       ├── consent/route.ts
    │       ├── family/route.ts
    │       ├── queue/route.ts
    │       ├── prescription-scan/route.ts  ← OCR (Vision AI)
    │       ├── documents/route.ts          ← 🆕 Document ingestion
    │       ├── timeline/route.ts           ← 🆕 Timeline API    │       ├── generate-report/route.ts    ← 🆕 PDF reports
    │       ├── insurance-claim/route.ts    ← 🆕 Insurance claims
    │       └── seed/route.ts               ← Seed demo data
    │
    ├── components/
    │   ├── doctor/
    │   │   ├── ActiveConsultationClient.tsx   ← Main scribe + EMR panel
    │   │   ├── LiveTranscriptPanel.tsx        ← Real-time speech display
    │   │   ├── LiveBillingPanel.tsx           ← Auto-generated bill
    │   │   ├── PatientSummaryPanel.tsx        ← AI patient summary
    │   │   ├── SafetyAlertModal.tsx           ← Drug interaction popup
    │   │   ├── SafetyAlertsClient.tsx
    │   │   ├── DrugCostPanel.tsx              ← Jan Aushadhi comparison
    │   │   ├── TriagePanel.tsx                ← AI triage score
    │   │   ├── FamilyHealthGraph.tsx          ← Family disease graph
    │   │   ├── FlashbackCard.tsx              ← Last visit recap
    │   │   ├── BillingClient.tsx
    │   │   ├── EMRRecordsClient.tsx
    │   │   ├── PatientsClient.tsx
    │   │   ├── DoctorDashboardClient.tsx
    │   │   ├── AuditTrailPanel.tsx
    │   │   ├── ConsentRecorder.tsx
    │   │   └── ProtocolCreditBadge.tsx
    │   │
    │   ├── patient/
    │   │   ├── PatientDashboardClient.tsx
    │   │   ├── PatientAppointmentsClient.tsx
    │   │   ├── PatientPrescriptionsClient.tsx
    │   │   ├── PatientReportsClient.tsx
    │   │   ├── PatientChatClient.tsx
    │   │   └── PatientAccountClient.tsx
    │   │
    │   ├── admin/
    │   │   ├── AdminDashboardClient.tsx
    │   │   ├── AdminAnalyticsClient.tsx
    │   │   ├── AdminUsersClient.tsx
    │   │   ├── AdminConsultationsClient.tsx
    │   │   ├── AdminAuditClient.tsx
    │   │   └── AdminSettingsClient.tsx
    │   │
    │   ├── receptionist/
    │   │   └── ReceptionistDashboardClient.tsx
    │   │
    │   ├── research/
    │   │   └── ResearchDashboardClient.tsx
    │   │
    │   ├── shared/
    │   │   ├── AppSidebar.tsx             ← Animated role-aware sidebar
    │   │   ├── DashboardShell.tsx         ← Layout wrapper with sidebar
    │   │   ├── RuralModeIndicator.tsx     ← Low-bandwidth mode badge
    │   │   ├── VisionAnonymizer.tsx       ← Data anonymisation toggle
    │   │   ├── PatientTimeline.tsx        ← 🆕 Unified medical timeline
    │   │   └── DocumentUploadModal.tsx    ← 🆕 Document upload with OCR
    │   │
    │   └── ui/                            ← Radix UI primitives
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── progress.tsx
    │       ├── scroll-area.tsx
    │       └── separator.tsx
    │
    ├── hooks/
    │   ├── useMedicalScribe.ts    ← Deepgram WebSocket + transcript state
    │   └── useOfflineSync.ts      ← Offline queue sync for rural mode
    │
    ├── lib/
    │   ├── auth.ts                ← getServerUser(), requireRole()
    │   ├── demo-auth.ts           ← DEMO_USERS array, encode/decode session
    │   ├── types.ts               ← ALL TypeScript interfaces
    │   ├── utils.ts               ← cn(), getInitials(), formatters
    │   ├── supabase.ts            ← Browser Supabase client
    │   ├── supabase-server.ts     ← Server Supabase client (uses cookies)
    │   ├── safety-guard.ts        ← Drug interaction + allergy logic
    │   ├── epidemiology.ts        ← Indian seasonal disease profiles
    │   ├── billing-engine.ts      ← EMR → BillingDraft generator
    │   ├── audit-chain.ts         ← SHA-256 tamper-evident chain
    │   ├── audit.ts               ← Audit logging helper
    │   ├── triage.ts              ← AI triage scoring
    │   ├── jan-aushadhi.ts        ← Generic drug cost data
    │   ├── report-generator.ts    ← jsPDF report builder
    │   ├── offline-queue.ts       ← Offline action queue
    │   └── insurance-claim-generator.ts  ← 🆕 Insurance PDF generator
    │
    ├── store/
    │   └── consultationStore.ts   ← Zustand: full consultation state
    │
    └── proxy.ts                   ← (Internal proxy utility)
```

---

## 4. Setup Guide

### Requirements

| Requirement          | Version | Notes                             |
| -------------------- | ------- | --------------------------------- |
| **Node.js**          | 20+     | Check: `node -v`                  |
| **npm**              | 10+     | Included with Node 20             |
| **Git**              | Any     | For cloning                       |
| **VS Code**          | Latest  | Recommended editor                |
| **Supabase account** | Free    | Database                          |
| **Groq account**     | Free    | AI/LLM (14,400 tokens/min free)   |
| **Deepgram account** | Free    | Speech-to-text ($200 free credit) |

### Install Node.js 20 (if needed)

```bash
# Check version
node -v

# If below 20, install using nvm:
# Windows: https://github.com/coreybutler/nvm-windows
nvm install 20
nvm use 20
```

### Installation

```bash
# Step 1: Navigate to project
cd "C:\Users\vivek\OneDrive\Desktop\cursor projects\CliniQ-main"

# Step 2: Install dependencies (node_modules already exists, but run to verify)
npm install

# Step 3: Check for TypeScript/lint errors
npm run lint

# Step 4: Verify the build compiles
npm run build

# Step 5: Start development server
npm run dev
```

---

## 5. Environment Variables

Create or update `.env.local` in the project root:

```env
# ─── Supabase (PostgreSQL Database) ───────────────────────────────────────────
# Get from: https://supabase.com → Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── Groq (AI / Large Language Model) ─────────────────────────────────────────
# Get from: https://console.groq.com → API Keys → Create New Key
# Model used: llama-3.3-70b-versatile
GROQ_API_KEY=gsk_...

# ─── Deepgram (Real-time Speech-to-Text) ──────────────────────────────────────
# Get from: https://console.deepgram.com → API Keys → Create API Key
# Model used: nova-2-medical
DEEPGRAM_API_KEY=...
```

### Current Status of Your Keys

| Variable                        | Status      | Action Needed                  |
| ------------------------------- | ----------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Set         | Run migrations (see Section 7) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set         | Run migrations (see Section 7) |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Missing** | Get from Supabase dashboard    |
| `GROQ_API_KEY`                  | Set         | Ready                          |
| `DEEPGRAM_API_KEY`              | Set         | Ready                          |

> `SUPABASE_SERVICE_ROLE_KEY` is used by admin API routes. Without it, `/api/admin/users` and `/api/seed` will fail.

---

## 6. API Integrations & Keys

### Groq — AI / LLM

**What it powers:**

- EMR extraction from live transcripts (ICD-10, vitals, medications, symptoms)
- Differential diagnosis with epidemiological weighting
- Patient summary in plain language
- Patient AI chatbot

**Model:** `llama-3.3-70b-versatile`

**How to get your key:**

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → API Keys → Create New Key
3. Copy the key starting with `gsk_...`
4. Paste into `.env.local` as `GROQ_API_KEY`

**Free tier limits:** 14,400 tokens/min · 30 requests/min · 500,000 tokens/day
(Sufficient for full demo usage)

---

### Deepgram — Real-time Speech-to-Text

**What it powers:**

- `useMedicalScribe` hook: live doctor-patient conversation transcription
- WebSocket streaming to Deepgram Nova-2 Medical model
- Language detection (English/Hindi/Hinglish)

**How to get your key:**

1. Go to [console.deepgram.com](https://deepgram.com)
2. Sign up → API Keys → Create API Key (name: NexusMD)
3. Copy the key
4. Paste into `.env.local` as `DEEPGRAM_API_KEY`

**Free tier:** $200 credit (~55 hours of audio transcription)

**How it works in code:**

```
POST /api/transcribe
  → Requests 30s short-lived token from Deepgram
  → Client opens WebSocket with this token
  → Audio streams to Deepgram → text segments return in real time
  → If token grant fails (some plans) → falls back to API key directly
```

---

### Supabase — PostgreSQL Database

**What it powers:**

- All persistent data: patients, consultations, EMR, prescriptions, billing
- Server-side auth via cookies (using `@supabase/ssr`)
- Audit logs with SHA-256 chain

**How to get your keys:**

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region (select `ap-south-1` for India)
3. Go to Settings → API
4. Copy three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

> Keep `SUPABASE_SERVICE_ROLE_KEY` secret — never expose it to the browser.

---

## 7. Database Setup

### Option A: Supabase SQL Editor (Recommended for Quick Start)

1. Open your Supabase project → SQL Editor
2. Run each file in this exact order:

```
Step 1: supabase/migrations/001_nexusmd_schema.sql   ← Core tables
Step 2: supabase/migrations/002_family_members.sql   ← Family graph
Step 3: supabase/migrations/002_supplementary.sql    ← Extra tables
Step 4: supabase/migrations/003_seed_data.sql        ← Demo data
Step 5: supabase/migrations/004_receptionist.sql     ← Queue tables
Step 6: supabase/migrations/005_uploaded_documents.sql  ← 🆕 Document ingestion
```

### Option B: Seed API Endpoint

After starting the dev server with valid Supabase keys:

```bash
curl -X POST http://localhost:3000/api/seed
```

This runs the seed data programmatically.

### Option C: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

---

## 8. How to Run

### In VS Code

```
1. Open VS Code
2. File → Open Folder → CliniQ-main
3. Press Ctrl+` to open terminal
4. Run: npm run dev
5. Open browser: http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Development server (port 3000, hot reload)
npm run build    # Production build (checks for TypeScript errors)
npm run start    # Start production build (run after npm run build)
npm run lint     # ESLint check
```

### Ports

| Service                  | Port       | Notes                 |
| ------------------------ | ---------- | --------------------- |
| Next.js (frontend + API) | **3000**   | Main app              |
| Supabase                 | Cloud only | No local port         |
| Groq API                 | Cloud only | No local port         |
| Deepgram                 | Cloud only | WebSocket via browser |

---

## 9. Demo Credentials

All demo accounts use the same password. One-click login buttons are available on the login page.

| Role         | Email                      | Password   | Dashboard     |
| ------------ | -------------------------- | ---------- | ------------- |
| Doctor       | demo.doctor@nexusmd.app    | demo123456 | /doctor       |
| Patient      | demo.patient@nexusmd.app   | demo123456 | /patient      |
| Admin        | demo.admin@nexusmd.app     | demo123456 | /admin        |
| Receptionist | demo.reception@nexusmd.app | demo123456 | /receptionist |

> Research role is accessible via the Supabase seed data.

---

## 10. All API Routes Reference

### Auth

| Method | Route              | Body                  | Returns                      |
| ------ | ------------------ | --------------------- | ---------------------------- |
| POST   | `/api/auth/login`  | `{ email, password }` | `{ ok, user }` + sets cookie |
| POST   | `/api/auth/logout` | —                     | Clears cookie                |

### AI / Core

| Method | Route                  | Body                                        | Returns                                |
| ------ | ---------------------- | ------------------------------------------- | -------------------------------------- |
| POST   | `/api/extract`         | `{ transcript, consultationId, location? }` | `{ emr, differentials, epidemiology }` |
| POST   | `/api/transcribe`      | —                                           | `{ token }` (Deepgram 30s token)       |
| POST   | `/api/patient-bot`     | `{ message, history[] }`                    | `{ reply }`                            |
| POST   | `/api/patient-summary` | `{ consultationId }`                        | `{ summary }`                          |
| POST   | `/api/safety/live`     | `{ meds[], allergies[] }`                   | `{ alerts[] }`                         |
| GET    | `/api/safety`          | —                                           | All safety alerts                      |

### Patients

| Method    | Route                              | Description                   |
| --------- | ---------------------------------- | ----------------------------- |
| GET/POST  | `/api/patients`                    | List all / create patient     |
| GET/PATCH | `/api/patients/[id]/profile`       | Get or update patient profile |
| GET       | `/api/patients/[id]/consultations` | Patient consultation history  |
| GET       | `/api/patients/[id]/appointments`  | Patient appointments          |
| GET       | `/api/patients/[id]/prescriptions` | Patient prescriptions         |

### Consultations

| Method   | Route                                   | Description                    |
| -------- | --------------------------------------- | ------------------------------ |
| GET/POST | `/api/consultations`                    | List / create consultation     |
| GET/PUT  | `/api/consultations/[id]/emr`           | Get or update EMR entry        |
| GET/POST | `/api/consultations/[id]/billing`       | Get or create billing draft    |
| GET/POST | `/api/consultations/[id]/prescriptions` | Prescriptions for consultation |

### Admin

| Method    | Route                      | Description                |
| --------- | -------------------------- | -------------------------- |
| GET       | `/api/admin/analytics`     | System-wide analytics data |
| GET/PATCH | `/api/admin/users`         | User management            |
| GET       | `/api/admin/consultations` | All consultations          |

### Misc

| Method   | Route                    | Description                  |
| -------- | ------------------------ | ---------------------------- |
| GET/POST | `/api/audit`             | Audit log                    |
| POST     | `/api/consent`           | Record patient consent       |
| GET/POST | `/api/family`            | Family member records        |
| GET/POST | `/api/queue`             | Reception queue              |
| POST     | `/api/prescription-scan` | OCR scan (Vision AI)         |
| POST     | `/api/seed`              | Seed Supabase with demo data |

### **New Features (v2.0)** 🆕

| Method   | Route                  | Description                                          |
| -------- | ---------------------- | ---------------------------------------------------- |
| GET/POST | `/api/documents`       | Upload & retrieve medical documents with OCR         |
| GET      | `/api/timeline`        | Unified patient timeline (consultations + documents) |
| POST     | `/api/generate-report` | Generate printable HTML medical report               |
| POST     | `/api/insurance-claim` | AI-generated insurance claim (IRDA compliant)        |

---

## 11. Complete User Workflows

### Doctor — Full Consultation Workflow

```
Login → /doctor (dashboard shows today's stats)
  → Sidebar: Active Consult → /doctor/consultation
  → Click "Start Recording"
  → Microphone activates, Deepgram WebSocket opens
  → Speak: "35 year old male, fever for 3 days, 102°F, headache, body ache, no rash"

System response every 30 seconds:
  → EMR auto-fills:
      Chief complaint: Fever
      Symptoms: Fever 102°F, Headache, Myalgia, Duration 3 days
      ICD-10: A90 (Dengue fever) — boosted because current season is monsoon
      Differentials: Dengue 62% | Malaria 22% | Typhoid 12% | Viral fever 4%
      Gap prompts: "Travel history not asked", "Platelet count not ordered"

  → Jan Aushadhi shows:
      Paracetamol 650mg: Brand ₹45 → Generic ₹8 (82% savings)

  → If doctor types Aspirin (contraindicated for dengue):
      SafetyAlertModal (CRITICAL): "Aspirin increases bleeding risk in Dengue"
      Alternatives: Paracetamol, Tramadol (if pain severe)

End consultation:
  → Click "End & Save"
  → EMR saved to Supabase
  → Audit log entry with SHA-256 hash
  → Patient summary generated and visible in patient portal
```

### Patient — Self-Service Workflow

```
Login → /patient (shows upcoming appointments, last visit summary)
  → /patient/chat → Ask: "Doctor said I have dengue. What is it?"
    AI bot explains in plain English (or Hindi if language_pref = 'hi')
  → /patient/prescriptions → View medications + dosage instructions
  → /patient/reports → Download PDF discharge summary
```

### Admin — Oversight Workflow

```
Login → /admin (KPI cards: consultations today, active users, alert rate)
  → /admin/analytics → Charts: consultations/week, top diagnoses, alert trends
  → /admin/users → Add/deactivate users, change roles
  → /admin/audit → View SHA-256 chained audit log (tamper-evident)
  → /admin/consultations → Browse all consultations, filter by doctor/date
```

### Receptionist — Queue Workflow

```
Login → /receptionist
  → View patient queue with position numbers
  → Add walk-in patient to queue
  → Mark patient as "with doctor"
  → Book appointment for future date
```

---

## 12. Feature List

### Existing Features (Implemented)

**AI / Clinical Intelligence**

- Real-time medical scribe (Deepgram WebSocket + Nova-2 Medical model)
- Groq LLaMA EMR extraction (ICD-10-CM, vitals, symptoms, medications, lab orders)
- Parallel differential diagnosis with confidence percentages
- Indian epidemiology engine (11 cities × 5 seasons = seasonal disease weighting)
- Gap prompt engine (detects what the doctor forgot to ask/order)
- AI patient chatbot (plain language diagnosis explanation)
- Patient summary generator

**Safety & Compliance**

- Drug-drug interaction checker (13 interaction pairs)
- Allergy contraindication checker (8 allergy categories)
- Clinical alternative suggestions on alert
- Doctor override with mandatory reason field
- Patient consent recorder (timestamp + audio marker)
- ABHA ID field (Ayushman Bharat Health Account)
- ICD-10-CM diagnostic coding
- FHIR R4-lite structured data export
- SHA-256 tamper-evident audit chain

**Operations**

- Multi-role authentication (6 roles)
- Reception queue management with position tracking
- Appointment scheduling
- Auto-billing from EMR (procedures → line items → GST calculation)
- Jan Aushadhi generic drug cost comparison
- Family health graph (hereditary disease patterns)
- Flashback card (previous visit summary)
- Triage scoring panel

**Patient Portal**

- Appointment viewer
- Prescription browser
- PDF report download (jsPDF)
- AI health chatbot

**Analytics**

- Admin analytics dashboard (Recharts)
- Research portal with anonymised data
- Epidemiology-adjusted differentials

**Infrastructure**

- Offline sync queue (for low-connectivity rural settings)
- Rural mode indicator
- Vision anonymiser (hides PII for screen-sharing)

**New Features (v2.0)** 🆕

- **OCR Document Ingestion** — Upload prescriptions/reports, extract structured data via Groq Vision
- **Patient Medical Timeline** — Unified chronological view of consultations + uploaded documents
- **Insurance Claim Generator** — AI-powered IRDA-compliant claim forms with cost breakdown
- **Fixed PDF Reports** — Working medical report generation with printable HTML

---

### Missing / Stub Features

| Feature                    | Status                    | Location                        |
| -------------------------- | ------------------------- | ------------------------------- |
| Prescription OCR scan      | ✅ **Implemented (v2.0)** | `/api/documents/route.ts`       |
| Patient Timeline           | ✅ **Implemented (v2.0)** | `/api/timeline/route.ts`        |
| Insurance Claim Gen        | ✅ **Implemented (v2.0)** | `/api/insurance-claim/route.ts` |
| PDF Report Download        | ✅ **Fixed (v2.0)**       | `/api/generate-report/route.ts` |
| Real-time Supabase updates | Polling-only, no Realtime | Could use `supabase.channel()`  |
| Email notifications        | Not implemented           | Needs Resend/Nodemailer         |
| SMS/WhatsApp for patients  | Not implemented           | Needs MSG91/Twilio              |
| Real ABDM API integration  | ABHA stored, not verified | NHA Sandbox API needed          |
| Video teleconsultation     | Not implemented           | Needs WebRTC/Daily.co           |
| Unit/integration tests     | Zero test files           | Needs Vitest + Playwright       |
| Hindi transcription        | Deepgram supports it      | Just pass `language=hi`         |

---

## 13. Known Issues & Fixes

### Issue 1: `SUPABASE_SERVICE_ROLE_KEY` missing

**Symptom:** `/api/admin/users` and `/api/seed` return 500 errors

**Fix:** Get the service role key from Supabase → Settings → API → `service_role`, add to `.env.local`

---

### Issue 2: Deepgram WebSocket fails silently

**Symptom:** Recording starts but no transcript appears

**Fix:** Check browser console for WebSocket errors. Verify:

```bash
# Test your Deepgram key
curl -X GET "https://api.deepgram.com/v1/auth/token" \
  -H "Authorization: Token YOUR_DEEPGRAM_KEY"
```

---

### Issue 3: Groq extraction returns empty EMR

**Symptom:** AI extraction fires but EMR panels stay empty

**Fix 1:** Verify Groq key is valid:

```bash
node test_extract.js
```

**Fix 2:** Transcript must be > 20 words before extraction fires (minimum threshold check)

---

### Issue 4: Supabase data not persisting between refreshes

**Symptom:** Consultations disappear on page refresh

**Cause:** Zustand store is in-memory only; Supabase keys may not be configured

**Fix:** Confirm `.env.local` has real Supabase URL and anon key, then run migrations

---

### Issue 5: `next-themes` dark mode not working

**Symptom:** Theme toggle exists but has no effect

**Cause:** `ThemeProvider` from `next-themes` is installed but may not be wrapping the app root

**Fix:** Wrap `src/app/layout.tsx` body with `<ThemeProvider attribute="class">`:

```tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 14. Improvements & Roadmap

### High Priority (Production Readiness)

```
1. Replace base64 cookie auth with real Supabase Auth (or JWT)
   - Current cookie is trivially decodable (just atob() it)
   - Supabase Auth gives you email verification, OAuth, MFA

2. Add Row Level Security (RLS) in Supabase
   - Doctors should only see their own patients
   - Patients should only see their own records
   Example:
   CREATE POLICY "doctors own patients" ON emr_entries
     FOR ALL USING (consultation_id IN (
       SELECT id FROM consultations WHERE doctor_id = auth.uid()
     ));

3. Add rate limiting on /api/extract
   - Groq calls are expensive — add minimum word threshold
   - Use Upstash Redis for IP-based rate limiting

4. Add input sanitisation on all Groq prompts
   - Prevent prompt injection from malicious transcript content
```

### Medium Priority (Feature Completeness)

```
5. Enable Hindi/Hinglish transcription:
   In useMedicalScribe.ts, pass language param to Deepgram:
   wss://api.deepgram.com/v1/listen?model=nova-2&language=hi

6. Implement prescription OCR:
   /api/prescription-scan is stubbed — implement with Tesseract.js
   npm install tesseract.js

7. Add toast notifications system:
   @radix-ui/react-toast is already installed — wire it up for:
   - Extraction success/failure
   - Safety alert dismissed
   - Save confirmation

8. Add Supabase Realtime for queue updates:
   const channel = supabase.channel('queue')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' },
       (payload) => setQueue(prev => [...]))
     .subscribe()

9. WhatsApp prescription delivery:
   Integrate MSG91 or Twilio WhatsApp API to send prescription PDF to patient
```

### Low Priority (Nice to Have)

```
10. Dark mode: next-themes already installed, just needs ThemeProvider setup
11. Mobile responsive consultation room (currently desktop-only)
12. Expand epidemiology to 50+ Indian cities (currently 11)
13. Government scheme eligibility check (Ayushman Bharat coverage)
14. Video teleconsultation (Daily.co or LiveKit WebRTC)
15. Drug stock alerts (pharmacy inventory integration)
16. Referral letter PDF generator
17. Lab report upload + auto-parsing
```

---

## 15. Presenting This Project

### Elevator Pitch (30 seconds)

> "NexusMD is an AI-powered medical scribe for Indian clinics. A doctor speaks naturally during a consultation — our system listens in real-time, extracts the complete medical record, maps ICD-10 diagnoses, checks for dangerous drug combinations, and generates a patient-friendly summary. It also accounts for India's disease seasonality — so during monsoon it automatically flags dengue as a top differential for fever. Everything is built on Next.js, Groq AI, and Supabase."

### Demo Script (5 minutes)

```
1. Open http://localhost:3000
2. Click "Doctor" quick login
3. Go to Active Consult (sidebar)
4. Click Start Recording
5. Say: "35-year-old male, fever for 3 days, 102 degrees, headache,
         no rash, came from Mumbai last week"
6. Show real-time transcript panel
7. Click "Extract Now"
8. Show: ICD-10 Dengue (boosted by monsoon epidemiology)
9. Show differentials: Dengue 65%, Malaria 22%
10. Type a medication → show safety alert fire
11. Show Jan Aushadhi savings panel
12. Show: bill auto-generated
13. Login as patient → show portal + AI chatbot
14. Login as admin → show analytics + audit chain
```

### Key Talking Points

- **AI + Voice:** First Indian clinical documentation system with live voice-to-EMR
- **Epidemiology-aware:** Diagnoses are weighted by Indian city + season (unique feature)
- **Jan Aushadhi:** Saves patients ₹100s–₹1000s per prescription
- **Audit chain:** Medico-legal protection with SHA-256 tamper-evident logs
- **Multi-role:** Covers the full clinic workflow from reception to discharge
- **ABDM compliant:** ABHA, ICD-10, FHIR-lite — ready for government integration

---

_Built with Next.js 16 · Groq llama-3.3-70b-versatile · Deepgram Nova-2 Medical · Supabase · Tailwind CSS v4_
