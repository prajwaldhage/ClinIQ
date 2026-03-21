-- Quick diagnostic query to check tables and RLS
-- Run this in Supabase SQL Editor

-- Check if appointments table exists
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('patients', 'consultations', 'appointments', 'safety_alerts', 'emr_entries')
ORDER BY table_name;

-- Check RLS status
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'consultations', 'appointments', 'safety_alerts', 'emr_entries');

-- Check policies for these tables
SELECT
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'consultations', 'appointments')
ORDER BY tablename, policyname;

-- Check actual data counts
SELECT 'patients' as table_name, COUNT(*) as count FROM public.patients
UNION ALL
SELECT 'consultations', COUNT(*) FROM public.consultations
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments;
