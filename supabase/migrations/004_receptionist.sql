-- =====================================================================
-- NexusMD Migration 004: Receptionist Workflow & Patient Queue
-- =====================================================================

CREATE TABLE IF NOT EXISTS patient_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,          -- ✅ FIXED (was TEXT)
  patient_name TEXT NOT NULL DEFAULT '',
  doctor_id UUID,                   -- ✅ FIXED
  doctor_name TEXT DEFAULT '',
  queue_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting',
  priority TEXT NOT NULL DEFAULT 'normal',
  check_in_time TIMESTAMPTZ DEFAULT now(),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  consultation_id UUID,             -- ✅ FIXED
  reason TEXT DEFAULT '',
  visit_type TEXT DEFAULT 'walk-in',
  registered_by UUID,               -- ✅ FIXED
  vitals_recorded JSONB DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_queue_status ON patient_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_doctor ON patient_queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_queue_date ON patient_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_queue_patient ON patient_queue(patient_id);

-- RLS
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to queue"
ON patient_queue FOR ALL USING (true) WITH CHECK (true);

-- =============================
-- FIXED DEMO USERS (UUIDs)
-- =============================

INSERT INTO users (id, email, name, role, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'rajesh.kumar@email.com', 'Rajesh Kumar', 'patient', true),
  ('22222222-2222-2222-2222-222222222222', 'anita.verma@email.com', 'Anita Verma', 'patient', true),
  ('33333333-3333-3333-3333-333333333333', 'demo.reception@nexusmd.app', 'Kavita (Receptionist)', 'receptionist', true),
  ('44444444-4444-4444-4444-444444444444', 'neha.patel@nexusmd.app', 'Dr. Neha Patel', 'doctor', true)
ON CONFLICT (id) DO NOTHING;

-- =============================
-- FIXED PATIENTS
-- =============================

INSERT INTO patients (id, user_id, name, dob, gender, blood_group, phone, allergies, chronic_conditions)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', '1975-08-22', 'M', 'A+', '+91 87654 32109', ARRAY['Sulfa drugs'], ARRAY['Hypertension', 'Obesity']),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Anita Verma', '1992-11-08', 'F', 'O+', '+91 76543 21098', ARRAY[]::TEXT[], ARRAY['Asthma'])
ON CONFLICT DO NOTHING;

-- =============================
-- FIXED QUEUE DATA
-- =============================

INSERT INTO patient_queue (
  patient_id, patient_name, doctor_id, doctor_name,
  queue_number, status, priority, reason, visit_type, registered_by, vitals_recorded
)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Sharma',
   '44444444-4444-4444-4444-444444444444', 'Dr. Neha Patel',
   1, 'waiting', 'normal', 'Follow-up: Diabetes', 'appointment',
   '33333333-3333-3333-3333-333333333333',
   '{"bp_systolic": 138, "bp_diastolic": 88}'::jsonb),

  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rajesh Kumar',
   '44444444-4444-4444-4444-444444444444', 'Dr. Neha Patel',
   2, 'waiting', 'urgent', 'Chest pain', 'walk-in',
   '33333333-3333-3333-3333-333333333333',
   '{"bp_systolic": 156, "bp_diastolic": 98}'::jsonb)

ON CONFLICT DO NOTHING;