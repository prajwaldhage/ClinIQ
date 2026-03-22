<div align="center">

# CliniQ

### AI-Powered Clinical Documentation & Healthcare Management for India

**Transform doctor-patient conversations into complete Electronic Medical Records in real-time**

CliniQ eliminates 2-3 hours of daily documentation burden for Indian doctors through intelligent voice recognition, clinical AI, and epidemiological awareness — built specifically for Indian healthcare workflows.

---

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=flat)](https://groq.com/)
[![Deepgram](https://img.shields.io/badge/Deepgram-Nova_2-13EF93?style=flat)](https://deepgram.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](https://opensource.org/licenses/MIT)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/vivek-agrawal/cliniq/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

</div>
---
Team Members:
1. Hardik Rokde(Team Leader)
2. Prajwal Dhage
3. Harsh Singh
4. Vivek Agrawal
---

## **Table of Contents**

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)
- [Folder Structure](#-folder-structure)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## **Problem Statement**

Indian healthcare is facing a critical documentation crisis that affects both physicians and patients:

### **The Numbers**

- Doctors spend **2-3 hours per day** on manual documentation instead of patient care
- **15 minutes per patient** is lost to paperwork, SOAP notes, and EMR forms
- **45-63% of physicians** report burnout from Electronic Health Record (EHR) burden
- **6.7% of hospital admissions** in India are due to preventable Adverse Drug Reactions
- **70% of Indian patients** pay for expensive branded drugs, unaware that Jan Aushadhi generics are 50-90% cheaper
- **75% of malpractice cases** involve inadequate or incomplete medical documentation

### **Real-World Impact**

| Pain Point                   | Consequence                                                         |
| ---------------------------- | ------------------------------------------------------------------- |
| **Manual transcription**     | Incomplete records, missed billable procedures, physician fatigue   |
| **Cognitive overload**       | Dangerous drug combinations missed during prescribing               |
| **Generic drug awareness**   | Patients paying ₹450 when ₹65 generic exists at Jan Aushadhi stores |
| **Generic diagnostic tools** | No context for Indian disease seasonality (monsoon = dengue spike)  |
| **Poor audit trails**        | Medico-legal vulnerability, no tamper-evident documentation         |
| **Language barriers**        | Patients don't understand medical jargon in prescriptions           |

This administrative burden reduces consultation capacity, increases physician burnout, and directly compromises patient safety.

---

## **Solution**

CliniQ transforms clinical documentation from a manual burden into an **automated, intelligent, and safe** process through four key innovations:

### **1. Voice-to-EMR Pipeline**

```
🎙️ Doctor Speaks  →  🧠 AI Understands  →  📋 EMR Auto-Fills
   (Deepgram STT)      (Llama 3.3 70B)      (ICD-10, Rx, Vitals)
```

- **Deepgram WebSocket** captures live doctor-patient conversation
- **Groq LLaMA 3.3 (70B)** extracts structured clinical data in real-time
- **Zero manual data entry** required

### **2. Indian Healthcare Context**

- **55 epidemiological profiles**: 11 cities × 5 seasons (Winter, Summer, Monsoon, etc.)
- **Monsoon in Mumbai** → Dengue probability automatically boosted by 30%
- **ABHA ID** (Ayushman Bharat Health Account) integration
- **Multi-language support**: English, Hindi, Hinglish medical conversations

### **3. Clinical Safety Layer**

- **13 drug-drug interaction rules** (e.g., Warfarin + Aspirin = bleeding risk)
- **8 allergy contraindication checks** (e.g., Aspirin allergy → flag all NSAIDs)
- **Severity-based alerts**: Critical → High → Medium → Low
- **Mandatory override justification** with full audit trail

### **4. Jan Aushadhi Intelligence**

- **60+ medication database** with brand vs. generic pricing
- Real-time cost comparison: Brand ₹450 → Generic ₹65 (**86% savings**)
- **Nearest Jan Aushadhi pharmacy** location with distance

### **5. Medico-Legal Compliance**

- **SHA-256 hash-chained audit trail** (blockchain-style, tamper-evident)
- **ICD-10-CM coding** with confidence scores
- **FHIR R4-lite** data export compatibility
- **INSERT-only audit logs** (no UPDATE or DELETE possible)

---

## **Features**

### **Doctor Portal**

#### **Real-time Medical Scribe**

- Live voice transcription using **Deepgram Nova-2 Medical** model
- WebSocket streaming with interim (grey) and finalized (white) text
- Language auto-detection: English, Hindi, Hinglish
- Word count and duration tracking

#### **AI-Powered EMR Extraction**

- Automatic extraction every 30 seconds (or manual trigger)
- Extracts: **Vitals** (BP, HR, SpO₂, temp, weight, height)
- **Symptoms**, **Physical Examination**, **Diagnosis**
- **ICD-10-CM codes** with confidence percentages
- **Medications** with dosage, frequency, duration
- **Lab tests** ordered (CBC, LFT, X-ray, etc.)
- **Gap Prompts**: AI detects missing clinical questions

#### **Differential Diagnosis AI**

- Top 5 differential diagnoses ranked by probability
- Clinical reasoning for each diagnosis
- Recommended confirmatory tests
- ICD-10 coding for each differential
- **Epidemiology-adjusted**: Seasonal disease probability boosts

#### **Drug Safety Guard**

- Real-time prescription safety checks on every medication added
- Drug-drug interaction detection (13 interaction pairs)
- Allergy cross-reaction checks (8 allergy categories)
- **SafetyAlertModal** opens immediately for critical alerts
- Override requires mandatory documentation of reason

#### **Jan Aushadhi Cost Panel**

- Brand medicine vs. generic price comparison
- **Average 70% savings** highlighted
- Nearest Jan Aushadhi store with distance
- Database covers 60+ common molecules

#### **Auto-Billing Engine**

- Real-time procedure detection from transcript
- Automatic line item generation (consultation, tests, procedures)
- **GST calculation** (5% on medications, 18% on procedures)
- Zero revenue leakage

#### **Family Health Graph**

- Visualize hereditary disease patterns across family members
- Quick identification of genetic risk factors

#### **Flashback Cards**

- Summary of patient's last consultation
- Quick context for follow-up visits

---

### **Patient Portal**

#### **Appointment Management**

- View upcoming appointments
- Reschedule or cancel appointments
- Appointment history

#### **Prescription Browser**

- Access all prescriptions with dosage instructions
- Medication schedules and reminders
- Download prescription PDFs

#### **PDF Report Download**

- Download discharge summaries
- Lab reports and consultation records
- **jsPDF** generated with clinic branding

#### **AI Health Chatbot**

- Ask questions about your diagnosis in plain language
- Context-aware responses based on your medical records
- Available in English or Hindi
- Medical disclaimers included

#### **Family Member Management**

- Link family accounts for unified health records
- View family health graph

---

### **Admin Portal**

#### **Analytics Dashboard**

- Consultation trends (line charts)
- Alert rate analysis
- Top diagnoses (bar charts)
- User activity heatmaps
- Powered by **Recharts**

#### **User Management**

- Add/remove doctors, receptionists, nurses
- Role assignment and access control
- User activity logs

#### **System-Wide Audit Logs**

- Complete tamper-evident event chain
- SHA-256 hash verification
- Filter by event type, user, date
- Export audit logs

#### **Consultation Oversight**

- Browse all consultations across doctors
- Filter by doctor, patient, date range
- Consultation status tracking

---

### **Receptionist Portal**

- **Real-time patient queue** with position tracking
- **Walk-in registration** workflow
- **Appointment booking** and scheduling
- Patient demographic entry

---

### **Research Portal**

- **Anonymized health data** for epidemiological research
- **Disease trend analysis** across populations
- Population-level health insights
- Data de-identification compliance

---

## **Tech Stack**

### **Frontend**

| Technology    | Version | Purpose                         |
| ------------- | ------- | ------------------------------- |
| Next.js       | 16      | React framework with App Router |
| React         | 19      | UI library                      |
| TypeScript    | 5       | Type-safe JavaScript            |
| Tailwind CSS  | v4      | Utility-first CSS framework     |
| Framer Motion | 12      | Animation library               |
| Radix UI      | Latest  | Accessible headless components  |
| Lucide React  | Latest  | Icon library                    |
| Recharts      | 3       | Data visualization              |
| next-themes   | Latest  | Dark/light mode support         |

### **Backend**

| Technology         | Purpose                      |
| ------------------ | ---------------------------- | ------------------- |
| Next.js API Routes | Serverless backend functions |
| Node.js            | 20+                          | Runtime environment |

### **Database**

| Technology            | Purpose                       |
| --------------------- | ----------------------------- |
| Supabase              | PostgreSQL hosting            |
| @supabase/supabase-js | Database client               |
| @supabase/ssr         | Server-side rendering support |

### **AI & Voice**

| Service  | Model/API               | Purpose                            |
| -------- | ----------------------- | ---------------------------------- |
| Groq     | llama-3.3-70b-versatile | EMR extraction, diagnosis, chatbot |
| Deepgram | Nova-2 Medical          | Real-time speech-to-text           |

### **State Management & Utilities**

| Library               | Purpose                 |
| --------------------- | ----------------------- |
| Zustand               | Global state management |
| date-fns              | Date formatting         |
| jsPDF                 | PDF report generation   |
| clsx / tailwind-merge | Conditional class names |

---

## **Architecture Overview**

### **High-Level System Design**

```
┌─────────────────────────────────────────────────────────────────┐
│                       User (Browser)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Doctor  │  │ Patient  │  │  Admin   │  │Reception │        │
│  │  Portal  │  │  Portal  │  │  Panel   │  │   Desk   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼───────────────┐
│       │                 Next.js 16 (Frontend)                    │
│  ┌────▼─────────────────────────────────────────────────┐       │
│  │           Zustand Store (Global State)                │       │
│  │  EMR · Safety Alerts · Billing · Audit · Transcript  │       │
│  └────┬─────────────────────────────────────────────────┘       │
│       │                                                          │
│  ┌────▼──────────────────────────────────────────────────┐      │
│  │              React 19 Components                       │      │
│  │  Radix UI · Framer Motion · Tailwind CSS v4          │      │
│  └────┬──────────────────────────────────────────────────┘      │
└───────┼──────────────────────────────────────────────────────────┘
        │
┌───────┼──────────────────────────────────────────────────────────┐
│       │          Next.js API Routes (Backend)                    │
│  ┌────▼─────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐      │
│  │ /extract │  │  /safety   │  │/transcri-│  │/patient- │      │
│  │ (Groq)   │  │ (Guard)    │  │be (Deep- │  │bot (AI)  │      │
│  │          │  │            │  │ gram)    │  │          │      │
│  └────┬─────┘  └────┬───────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼───────────────┼─────────────┼─────────────┘
        │             │               │             │
   ┌────▼────┐   ┌────▼──────┐  ┌────▼────────┐  ┌─▼──────────┐
   │ Groq AI │   │ Supabase  │  │  Deepgram   │  │ Audit DB   │
   │ Llama   │   │PostgreSQL │  │  WebSocket  │  │ SHA-256    │
   │ 3.3 70B │   │  + RLS    │  │ Nova-2 Med  │  │ Chain      │
   └─────────┘   └───────────┘  └─────────────┘  └────────────┘
```

### **Data Flow: Doctor Consultation**

```
1. Doctor clicks "Start Recording"
   └─> Microphone stream → Deepgram WebSocket → Live transcript updates

2. Auto-extraction every 30 seconds
   └─> POST /api/extract { transcript, consultationId, location }
       └─> Groq LLaMA processes in parallel:
           ├─> Call 1: EMR extraction (vitals, symptoms, ICD, meds, labs)
           └─> Call 2: Differential diagnosis + epidemiology weighting
       └─> Returns structured JSON → Zustand store updates

3. If medications detected in EMR
   └─> POST /api/safety/live { medications, allergies }
       └─> safety-guard.ts checks 13 drug-drug + 8 allergy rules
           └─> If CRITICAL alert → SafetyAlertModal opens immediately

4. Billing engine auto-runs
   └─> billing-engine.ts { emr.procedures } → line items with GST

5. End consultation
   └─> EMR saved to Supabase (emr_entries table)
   └─> SHA-256 hash added to audit_log chain
   └─> Patient summary generated (plain language)
```

---

## **Installation & Setup**

### **Prerequisites**

Ensure you have the following installed:

| Requirement | Version | Download Link                       |
| ----------- | ------- | ----------------------------------- |
| **Node.js** | 20+     | [nodejs.org](https://nodejs.org/)   |
| **npm**     | 10+     | Included with Node.js               |
| **Git**     | Any     | [git-scm.com](https://git-scm.com/) |

### **External Services Required**

You'll need free accounts for:

1. **Supabase** (Database)
   - Sign up: [supabase.com](https://supabase.com)
   - Create new project → Select region `ap-south-1` (India)
   - Free tier: Unlimited API requests, 500 MB database

2. **Groq** (AI/LLM)
   - Sign up: [console.groq.com](https://console.groq.com)
   - Create API key
   - Free tier: 14,400 tokens/min, 30 requests/min

3. **Deepgram** (Speech-to-Text)
   - Sign up: [console.deepgram.com](https://console.deepgram.com)
   - Create API key
   - Free tier: $200 credit (~55 hours of audio)

---

### **Step-by-Step Installation**

#### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/cliniq.git
cd cliniq
```

#### **2. Install Dependencies**

```bash
npm install
```

This will install all packages from `package.json` including Next.js 16, React 19, Tailwind v4, etc.

#### **3. Set Up Environment Variables**

Create a `.env.local` file in the project root (see next section for details):

```bash
# Create the file
touch .env.local

# Or on Windows
type nul > .env.local
```

#### **4. Configure Supabase Database**

You have three options to set up the database:

**Option A: Supabase SQL Editor (Recommended)**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in this exact order:

```sql
-- Step 1: Core schema
-- Copy/paste: supabase/migrations/001_nexusmd_schema.sql

-- Step 2: Family members
-- Copy/paste: supabase/migrations/002_family_members.sql

-- Step 3: Supplementary tables
-- Copy/paste: supabase/migrations/002_supplementary.sql

-- Step 4: Demo seed data
-- Copy/paste: supabase/migrations/003_seed_data.sql

-- Step 5: Queue tables
-- Copy/paste: supabase/migrations/004_receptionist.sql
```

**Option B: API Seed Endpoint**

After setting up `.env.local` and running the dev server:

```bash
curl -X POST http://localhost:3000/api/seed
```

**Option C: Supabase CLI**

```bash
# Install Supabase CLI globally
npm install -g supabase

# Link your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

#### **5. Run Development Server**

```bash
npm run dev
```

#### **6. Open in Browser**

Navigate to [http://localhost:3000](http://localhost:3000)

You'll be redirected to the login page. Use the demo credentials below.

---

## **Environment Variables**

Create a `.env.local` file in your project root with the following variables:

```env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Supabase (PostgreSQL Database)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Get from: https://supabase.com → Your Project → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Groq (AI / Large Language Model)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Get from: https://console.groq.com → API Keys → Create New Key
# Used for: EMR extraction, differential diagnosis, patient chatbot
# Model: llama-3.3-70b-versatile

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Deepgram (Real-time Speech-to-Text)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Get from: https://console.deepgram.com → API Keys → Create API Key
# Used for: Medical scribe real-time transcription
# Model: Nova-2 Medical

DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **How to Get Each Key**

#### **Supabase Keys**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project dashboard
3. Navigate to **Settings** → **API**
4. Copy three values:
   - **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon** `public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** `secret` key → paste as `SUPABASE_SERVICE_ROLE_KEY`

> **⚠️ Important:** Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Never commit it to Git or expose it in client-side code.

#### **Groq API Key**

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys** in sidebar
4. Click **Create API Key**
5. Copy the key (starts with `gsk_`)
6. Paste as `GROQ_API_KEY`

**Free Tier Limits:** 14,400 tokens/min · 30 requests/min · 500,000 tokens/day (sufficient for full demo)

#### **Deepgram API Key**

1. Visit [console.deepgram.com](https://console.deepgram.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create a New API Key**
5. Name it "CliniQ" or similar
6. Copy the key
7. Paste as `DEEPGRAM_API_KEY`

**Free Tier:** $200 credit (~55 hours of audio transcription)

---

## **Usage Guide**

### **Demo Credentials**

CliniQ includes demo accounts for all user roles:

| Role             | Email                        | Password     | Dashboard       |
| ---------------- | ---------------------------- | ------------ | --------------- |
| **Doctor**       | `demo.doctor@nexusmd.app`    | `demo123456` | `/doctor`       |
| **Patient**      | `demo.patient@nexusmd.app`   | `demo123456` | `/patient`      |
| **Admin**        | `demo.admin@nexusmd.app`     | `demo123456` | `/admin`        |
| **Receptionist** | `demo.reception@nexusmd.app` | `demo123456` | `/receptionist` |

> **One-Click Login:** The login page includes quick-login buttons for each role — no need to type credentials.

---

### **Doctor Workflow: Complete Consultation**

#### **Step 1: Login**

1. Navigate to `http://localhost:3000`
2. Click **"Doctor"** quick-login button
3. You'll be redirected to `/doctor` (Doctor Dashboard)

#### **Step 2: View Dashboard**

The dashboard shows:

- Today's consultation stats
- Pending safety alerts
- Recent patients
- Quick actions

#### **Step 3: Start a Consultation**

1. Click **"Active Consult"** in the sidebar
2. Select an existing patient OR create a new one
3. Click **"Start Recording"**

#### **Step 4: Speak Naturally**

Microphone activates and Deepgram WebSocket opens. Example conversation:

```
Doctor: "35-year-old male, presenting with fever for 3 days.
Temperature 102°F. Complains of severe headache and body ache.
No rash visible. Patient returned from Mumbai last week."
```

#### **Step 5: Watch AI Extract Data**

Every 30 seconds (or click **"Extract Now"**), Groq AI processes the transcript:

- **EMR Panel** auto-fills:
  - Chief Complaint: Fever
  - Symptoms: Fever (102°F), Headache, Myalgia, Duration 3 days
  - ICD-10: A90 (Dengue fever) — boosted because monsoon season

- **Differentials Panel** shows:
  - Dengue: 62% (boosted by epidemiology)
  - Malaria: 22%
  - Typhoid: 12%
  - Viral fever: 4%

- **Gap Prompts** appear:
  - "Travel history not documented"
  - "Platelet count not ordered — recommended for dengue"

#### **Step 6: Prescribe Medication**

Type medication in the prescription field. If you enter **Aspirin** (contraindicated for dengue):

- **SafetyAlertModal** opens immediately
- Alert: **"CRITICAL: Aspirin increases bleeding risk in dengue patients"**
- Alternatives suggested: Paracetamol, Tramadol (if severe pain)

You must either:

- Remove Aspirin
- Override with mandatory justification (logged in audit trail)

#### **Step 7: Review Cost Savings**

**Jan Aushadhi Panel** shows:

- Paracetamol 650mg:
  - Brand price: ₹45
  - Generic price: ₹8
  - **Savings: 82%**
- Nearest Jan Aushadhi store: 1.2 km away

#### **Step 8: Check Auto-Generated Bill**

**Live Billing Panel** displays:

- Consultation fee: ₹500
- CBC test: ₹350
- Platelet count: ₹200
- Subtotal: ₹1,050
- GST (5%): ₹52.50
- **Total: ₹1,102.50**

#### **Step 9: End Consultation**

1. Click **"End & Save"**
2. EMR is saved to Supabase `emr_entries` table
3. Audit log entry created with SHA-256 hash
4. Patient summary generated in plain language
5. Patient can now view their consultation in the Patient Portal

---

### **Patient Workflow**

#### **Step 1: Login**

1. Navigate to `http://localhost:3000`
2. Click **"Patient"** quick-login button
3. Redirected to `/patient` (Patient Dashboard)

#### **Step 2: View Dashboard**

See:

- Upcoming appointments
- Last consultation summary
- Quick stats (prescriptions count, reports count)

#### **Step 3: Navigate Portal**

Use sidebar to access:

**Appointments**

- View scheduled appointments
- Reschedule or cancel

**Prescriptions**

- View all medications with dosage instructions
- Download prescription PDFs

**Reports**

- Download lab reports
- Download discharge summaries (jsPDF generated)

**AI Health Chat**

- Ask: _"What is dengue fever?"_
- Ask: _"Can I exercise with fever?"_
- Ask: _"What are the side effects of Paracetamol?"_
- Bot responds in plain language with medical disclaimers

**Account**

- Update profile
- Change language preference (English/Hindi)
- Add family members

---

### **Admin Workflow**

#### **Step 1: Login**

Click **"Admin"** on login page → `/admin` dashboard

#### **Step 2: View Analytics**

Dashboard shows:

- **KPI Cards**: Consultations today, active users, alert rate
- **Charts**:
  - Consultations per week (line chart)
  - Top 10 diagnoses (bar chart)
  - Safety alert breakdown (pie chart)

#### **Step 3: User Management**

Navigate to **Users** in sidebar:

- View all users by role (Doctor, Patient, Admin, etc.)
- Click **"Add User"** to create new doctor/receptionist
- Deactivate accounts
- Change user roles

#### **Step 4: Audit Trail**

Navigate to **Audit** in sidebar:

- Browse all system events (consultation started, EMR updated, alert overridden, etc.)
- Verify SHA-256 hash chain integrity
- Filter by:
  - Event type
  - User/actor
  - Date range
- Export audit logs as CSV

#### **Step 5: Consultation Oversight**

Navigate to **Consultations** in sidebar:

- View all consultations across all doctors
- Filter by doctor, patient, status, date
- Click any consultation to view full EMR

---


## **Folder Structure**

```
CliniQ-main/
├── .env.local                      # Environment variables (DO NOT COMMIT)
├── .nvmrc                          # Node version: 20
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
├── components.json                 # shadcn/ui config
│
├── public/                         # Static assets (images, fonts)
│
├── supabase/
│   └── migrations/                 # Database migrations
│       ├── 001_nexusmd_schema.sql  # Core schema (users, patients, emr, etc.)
│       ├── 002_family_members.sql  # Family graph table
│       ├── 002_supplementary.sql   # Additional tables
│       ├── 003_seed_data.sql       # Demo data
│       └── 004_receptionist.sql    # Queue tables
│
└── src/
    ├── app/                        # Next.js 16 App Router
    │   ├── layout.tsx              # Root layout (HTML, body, theme)
    │   ├── page.tsx                # Root page (auth redirect)
    │   ├── globals.css             # Tailwind v4 + CSS variables
    │   │
    │   ├── login/
    │   │   └── page.tsx            # Login page with quick-login buttons
    │   │
    │   ├── doctor/                 # Doctor portal
    │   │   ├── layout.tsx          # requireRole(['doctor', 'nurse'])
    │   │   ├── page.tsx            # Dashboard
    │   │   ├── consultation/       # Live scribe + EMR extraction
    │   │   ├── patients/           # Patient list
    │   │   ├── emr/                # EMR records browser
    │   │   ├── billing/            # Billing drafts
    │   │   └── alerts/             # Safety alerts dashboard
    │   │
    │   ├── patient/                # Patient portal
    │   │   ├── layout.tsx          # requireRole(['patient'])
    │   │   ├── page.tsx            # Patient dashboard
    │   │   ├── appointments/       # Appointment viewer
    │   │   ├── prescriptions/      # Prescription browser
    │   │   ├── reports/            # PDF downloads
    │   │   ├── chat/               # AI chatbot
    │   │   └── account/            # Profile settings
    │   │
    │   ├── admin/                  # Admin panel
    │   │   ├── layout.tsx          # requireRole(['admin'])
    │   │   ├── page.tsx            # Admin dashboard
    │   │   ├── analytics/          # Recharts analytics
    │   │   ├── users/              # User management
    │   │   ├── consultations/      # All consultations
    │   │   ├── audit/              # Audit trail viewer
    │   │   └── settings/           # System settings
    │   │
    │   ├── receptionist/
    │   │   ├── layout.tsx
    │   │   └── page.tsx            # Queue management
    │   │
    │   ├── research/
    │   │   ├── layout.tsx
    │   │   └── page.tsx            # Anonymized analytics
    │   │
    │   └── api/                    # Backend API routes
    │       ├── auth/
    │       │   ├── login/route.ts  # Demo login
    │       │   └── logout/route.ts # Session clear
    │       ├── extract/route.ts    # Groq: EMR + differentials
    │       ├── transcribe/route.ts # Deepgram token proxy
    │       ├── patient-bot/route.ts # AI chatbot
    │       ├── patient-summary/route.ts
    │       ├── safety/
    │       │   ├── route.ts
    │       │   └── live/route.ts   # Real-time safety check
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
    │       ├── prescription-scan/route.ts
    │       └── seed/route.ts       # Seed demo data
    │
    ├── components/
    │   ├── doctor/                 # Doctor-specific UI
    │   │   ├── ActiveConsultationClient.tsx
    │   │   ├── LiveTranscriptPanel.tsx
    │   │   ├── SafetyAlertModal.tsx
    │   │   ├── DrugCostPanel.tsx
    │   │   ├── LiveBillingPanel.tsx
    │   │   ├── PatientSummaryPanel.tsx
    │   │   ├── TriagePanel.tsx
    │   │   ├── FamilyHealthGraph.tsx
    │   │   ├── FlashbackCard.tsx
    │   │   └── ...
    │   │
    │   ├── patient/                # Patient-specific UI
    │   │   ├── PatientDashboardClient.tsx
    │   │   ├── PatientAppointmentsClient.tsx
    │   │   ├── PatientPrescriptionsClient.tsx
    │   │   ├── PatientReportsClient.tsx
    │   │   ├── PatientChatClient.tsx
    │   │   └── PatientAccountClient.tsx
    │   │
    │   ├── admin/                  # Admin-specific UI
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
    │   ├── shared/                 # Shared components
    │   │   ├── AppSidebar.tsx      # Role-aware sidebar
    │   │   ├── DashboardShell.tsx  # Layout wrapper
    │   │   ├── RuralModeIndicator.tsx
    │   │   └── VisionAnonymizer.tsx
    │   │
    │   └── ui/                     # Radix UI primitives
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── progress.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── switch.tsx
    │       ├── tabs.tsx
    │       ├── toast.tsx
    │       └── tooltip.tsx
    │
    ├── hooks/
    │   ├── useMedicalScribe.ts     # Deepgram WebSocket + transcript state
    │   └── useOfflineSync.ts       # Offline queue sync for rural mode
    │
    ├── lib/
    │   ├── auth.ts                 # getServerUser(), requireRole()
    │   ├── demo-auth.ts            # DEMO_USERS array, session encode/decode
    │   ├── types.ts                # All TypeScript interfaces
    │   ├── utils.ts                # cn(), getInitials(), formatters
    │   ├── supabase.ts             # Browser Supabase client
    │   ├── supabase-server.ts      # Server Supabase client (uses cookies)
    │   ├── safety-guard.ts         # Drug interaction + allergy logic (13+8 rules)
    │   ├── epidemiology.ts         # Indian seasonal disease profiles (11 cities × 5 seasons)
    │   ├── billing-engine.ts       # EMR → BillingDraft generator
    │   ├── audit-chain.ts          # SHA-256 tamper-evident chain builder
    │   ├── audit.ts                # Audit logging helper
    │   ├── triage.ts               # AI triage scoring
    │   ├── jan-aushadhi.ts         # Generic drug cost database (60+ molecules)
    │   ├── report-generator.ts     # jsPDF report builder
    │   └── offline-queue.ts        # Offline action queue (localStorage)
    │
    └── store/
        └── consultationStore.ts    # Zustand: consultation global state
```

---

## **Deployment**

CliniQ is built with Next.js 16 and optimized for **Vercel** deployment.

### **Deploy to Vercel (Recommended)**

#### **Method 1: Vercel CLI**

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? cliniq
# - Directory? ./
# - Override settings? No

# 4. Add environment variables in Vercel Dashboard
# Go to: Project Settings → Environment Variables
# Add all variables from .env.local:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   GROQ_API_KEY
#   DEEPGRAM_API_KEY

# 5. Redeploy after adding env vars
vercel --prod
```

#### **Method 2: One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cliniq&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GROQ_API_KEY,DEEPGRAM_API_KEY)

_You will be prompted to add environment variables during deployment._

#### **Method 3: GitHub Integration**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add environment variables (see list above)
5. Click **Deploy**

---

### **Deploy to Netlify**

```bash
# 1. Build the project
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Login
netlify login

# 4. Deploy
netlify deploy --prod

# 5. Add environment variables in Netlify Dashboard
# Site Settings → Build & Deploy → Environment
```

---

### **Deploy to Railway**

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add environment variables
5. Deploy

---

### **Environment Variables for Production**

Ensure all the following are added to your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
DEEPGRAM_API_KEY
```

> **Security:** Never commit `.env.local` to Git. Use your platform's environment variable settings.

---

## **Future Improvements**

### **High Priority (Production Readiness)**

1. **Replace demo auth with Supabase Auth**
   - Current cookie-based auth is insecure (base64 encoded, trivially decodable)
   - Implement Supabase Auth for email verification, OAuth, MFA
   - Add JWT token-based authentication

2. **Add Row Level Security (RLS) policies**
   - Restrict database access so doctors only see their own patients
   - Patients only access their own records
   - Example policy:
     ```sql
     CREATE POLICY "doctors own patients" ON emr_entries
       FOR ALL USING (
         consultation_id IN (
           SELECT id FROM consultations WHERE doctor_id = auth.uid()
         )
       );
     ```

3. **Implement rate limiting**
   - Prevent abuse of `/api/extract`, `/api/patient-bot`
   - Use Upstash Redis or Vercel KV for IP-based rate limiting
   - Add minimum word threshold before extraction fires

4. **Add input sanitization**
   - Prevent prompt injection from malicious transcript content
   - Sanitize all user inputs before passing to LLM

5. **Add comprehensive testing**
   - Unit tests with Vitest
   - Integration tests with Playwright
   - API route testing
   - Component testing with React Testing Library

---

### **Feature Enhancements**

6. **Enable Hindi/Hinglish transcription**
   - Deepgram already supports it
   - In `useMedicalScribe.ts`, pass language parameter:
     ```typescript
     wss://api.deepgram.com/v1/listen?model=nova-2&language=hi
     ```

7. **Implement prescription OCR**
   - Current `/api/prescription-scan` is stubbed
   - Implement with Tesseract.js or Google Vision API
   - Auto-parse existing paper prescriptions

8. **Add real-time Supabase subscriptions**
   - Replace polling with Supabase Realtime
   - Live queue updates for receptionist
   - Real-time notification system
   - Example:
     ```typescript
     const channel = supabase
       .channel("queue")
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "queue_entries" },
         (payload) => updateQueue(payload),
       )
       .subscribe();
     ```

9. **WhatsApp prescription delivery**
   - Integrate MSG91 or Twilio WhatsApp Business API
   - Send prescription PDFs directly to patient's phone
   - Appointment reminders via WhatsApp

10. **Email notifications**
    - Send appointment confirmations
    - Lab report ready notifications
    - Prescription refill reminders
    - Integrate Resend or Nodemailer

11. **Video teleconsultation**
    - Integrate Daily.co or LiveKit WebRTC
    - Enable remote consultations with screen sharing
    - Record consultations for documentation

12. **Mobile responsive design**
    - Optimize consultation room UI for tablets
    - Progressive Web App (PWA) for mobile devices
    - Offline-first mobile experience

---

### **Advanced Features**

13. **Dark mode implementation**
    - `next-themes` already installed
    - Wire up ThemeProvider in root layout
    - Add theme toggle button

14. **Expand epidemiology database**
    - Current: 11 cities
    - Target: 50+ Indian cities with granular seasonal profiles
    - Include rural disease patterns

15. **ABDM integration**
    - Connect to National Health Authority's ABDM APIs
    - ABHA ID verification
    - Health data exchange with other ABDM-compliant systems

16. **Lab report upload & auto-parsing**
    - Upload PDF lab reports
    - Auto-extract values using GPT-4 Vision or OCR
    - Populate EMR with lab results

17. **Referral letter generator**
    - Generate formatted specialist referral letters
    - Include patient history, diagnosis, treatment plan
    - Export as PDF

18. **Pharmacy inventory integration**
    - Real-time stock checking
    - Low-stock alerts for prescribed medications
    - Auto-reorder suggestions

19. **Government scheme eligibility check**
    - Check Ayushman Bharat coverage
    - Auto-apply subsidies to billing
    - Insurance claim generation

20. **Multi-language support**
    - Full UI translation (English, Hindi, regional languages)
    - Language-aware AI responses
    - Regional disease name mapping

---

## **Contributing**

Contributions are welcome! We appreciate your interest in improving CliniQ.

### **How to Contribute**

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/cliniq.git
   cd cliniq
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code patterns
   - Use TypeScript best practices
   - Add comments for complex logic

4. **Test thoroughly**

   ```bash
   npm run build  # Check for TypeScript errors
   npm run lint   # Check for linting issues
   ```

5. **Commit your changes**

   ```bash
   git commit -m "Add amazing feature: detailed description"
   ```

6. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Provide a clear description of changes
   - Link related issues (if applicable)

---

### **Reporting Bugs**

Found a bug? Help us improve!

1. Check if the issue already exists in [Issues](https://github.com/yourusername/cliniq/issues)
2. If not, create a new issue with:
   - **Clear title** and description
   - **Steps to reproduce** the bug
   - **Expected behavior** vs **actual behavior**
   - **Screenshots** (if applicable)
   - **Environment details**:
     - OS (Windows/macOS/Linux)
     - Node version (`node -v`)
     - Browser (Chrome/Firefox/Safari)

---

### **Feature Requests**

Have an idea? We'd love to hear it!

1. Open an issue with the `enhancement` label
2. Describe:
   - **The problem** you're trying to solve
   - **Proposed solution**
   - **Alternative solutions** you've considered
   - **Why this feature is important**

---

### **Development Guidelines**

- **Code Style:** Follow existing patterns in the codebase
- **Components:** Use Radix UI for new UI components (see `src/components/ui/`)
- **TypeScript:** Add proper type definitions (see `src/lib/types.ts`)
- **Comments:** Add comments for complex algorithms or business logic
- **Functions:** Keep functions small, focused, and single-purpose
- **Testing:** Test changes in both doctor and patient portals before submitting

---

### **Code of Conduct**

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project and community
- Report unacceptable behavior to [project maintainers]

---

## **License**

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Vivek Agrawal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](./LICENSE) file for full details.

---

## **Acknowledgments**

This project wouldn't be possible without these amazing technologies and organizations:

- **[Deepgram](https://deepgram.com)** — Medical-grade real-time speech recognition (Nova-2 Medical model)
- **[Groq](https://groq.com)** — Ultra-fast LLM inference (sub-second response times with LLaMA 3.3 70B)
- **[Supabase](https://supabase.com)** — Seamless PostgreSQL hosting with Row-Level Security
- **[Vercel](https://vercel.com)** — Best-in-class Next.js deployment platform
- **[Next.js Team](https://nextjs.org)** — For the incredible React framework
- **[Radix UI](https://radix-ui.com)** — Accessible headless component library
- **[Tailwind Labs](https://tailwindcss.com)** — For the amazing CSS framework

### **Data & Standards**

- **Indian Council of Medical Research (ICMR)** — Epidemiological data and disease surveillance
- **National Health Authority (NHA)** — ABHA/ABDM specifications and guidelines
- **WHO ICD-10** — International Classification of Diseases coding system
- **Jan Aushadhi Scheme** — Generic drug accessibility and pricing data
- **HL7 FHIR** — Healthcare interoperability standards

---

## **Key Metrics**

| Metric               | Count                                              |
| -------------------- | -------------------------------------------------- |
| **React Components** | 36+                                                |
| **API Routes**       | 13                                                 |
| **Database Tables**  | 9 (all with RLS)                                   |
| **Drug Database**    | 60+ molecules                                      |
| **Supported Cities** | 11 Indian cities                                   |
| **User Roles**       | 5 (Doctor, Patient, Admin, Receptionist, Research) |
| **Safety Rules**     | 13 drug-drug + 8 allergy checks                    |
| **Languages**        | 2 (English, Hindi/Hinglish)                        |

---

<div align="center">

## **Built With**

**Next.js 16** · **React 19** · **TypeScript 5** · **Tailwind CSS v4**
**Groq LLaMA 3.3 70B** · **Deepgram Nova-2 Medical** · **Supabase PostgreSQL**

---

### **CliniQ — Every Word Heals**

_Transforming Indian Healthcare, One Consultation at a Time_

Made with ❤️ for Indian Healthcare

</div>
