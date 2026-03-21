-- ============================================================
-- Fix RLS Policies for Development
-- Run this in Supabase SQL Editor to enable full access
-- ============================================================

-- Drop old restrictive policies and create permissive ones
-- This allows unauthenticated access for development

-- ─── Patients ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Doctors can read all patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can read own record" ON public.patients;

CREATE POLICY "Allow all read access to patients"
  ON public.patients FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to patients"
  ON public.patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to patients"
  ON public.patients FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete access to patients"
  ON public.patients FOR DELETE
  USING (true);

-- ─── Consultations ─────────────────────────────────────────
DROP POLICY IF EXISTS "Doctor can access own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Patient can read own consultations" ON public.consultations;

CREATE POLICY "Allow all read access to consultations"
  ON public.consultations FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to consultations"
  ON public.consultations FOR UPDATE
  USING (true);

-- ─── Appointments ─────────────────────────────────────────
-- These should already exist from migration 002, but ensure they're there
DROP POLICY IF EXISTS "appointments_read" ON public.appointments;
DROP POLICY IF EXISTS "appointments_write" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update" ON public.appointments;

CREATE POLICY "Allow all read access to appointments"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to appointments"
  ON public.appointments FOR UPDATE
  USING (true);

-- ─── Safety Alerts ─────────────────────────────────────────
DROP POLICY IF EXISTS "Doctor can manage safety alerts" ON public.safety_alerts;

CREATE POLICY "Allow all read access to safety_alerts"
  ON public.safety_alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to safety_alerts"
  ON public.safety_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to safety_alerts"
  ON public.safety_alerts FOR UPDATE
  USING (true);

-- ─── EMR Entries ───────────────────────────────────────────
DROP POLICY IF EXISTS "Doctor can manage EMR entries" ON public.emr_entries;
DROP POLICY IF EXISTS "Patient can read own EMR entries" ON public.emr_entries;

CREATE POLICY "Allow all read access to emr_entries"
  ON public.emr_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to emr_entries"
  ON public.emr_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to emr_entries"
  ON public.emr_entries FOR UPDATE
  USING (true);

-- ─── Billing Drafts ────────────────────────────────────────
CREATE POLICY "Allow all read access to billing_drafts"
  ON public.billing_drafts FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to billing_drafts"
  ON public.billing_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to billing_drafts"
  ON public.billing_drafts FOR UPDATE
  USING (true);

-- ─── Users ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

CREATE POLICY "Allow all read access to users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ─── Prescriptions ─────────────────────────────────────────
CREATE POLICY "Allow all read access to prescriptions"
  ON public.prescriptions FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (true);

-- ─── Transcripts ───────────────────────────────────────────
DROP POLICY IF EXISTS "Doctor can manage transcripts" ON public.transcripts;

CREATE POLICY "Allow all read access to transcripts"
  ON public.transcripts FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to transcripts"
  ON public.transcripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to transcripts"
  ON public.transcripts FOR UPDATE
  USING (true);

-- ─── Audit Log ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert audit events" ON public.audit_log;
DROP POLICY IF EXISTS "Doctors and admins can read audit log" ON public.audit_log;

CREATE POLICY "Allow all read access to audit_log"
  ON public.audit_log FOR SELECT
  USING (true);

CREATE POLICY "Allow all write access to audit_log"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Verification: Check if policies are applied
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'consultations', 'appointments', 'safety_alerts', 'emr_entries')
ORDER BY tablename, policyname;
