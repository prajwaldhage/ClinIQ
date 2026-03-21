DO $$
DECLARE
  doc1_id UUID;
  doc2_id UUID;
  pat_user_id UUID;
  pat_id  UUID;
  c1 UUID;
  c2 UUID;
  c3 UUID;
BEGIN

  -- ✅ Ensure doctors exist
  INSERT INTO public.users (email, name, role)
  VALUES
    ('demo.doctor@nexusmd.app', 'Dr. Demo One', 'doctor'),
    ('demo.doctor2@nexusmd.app', 'Dr. Demo Two', 'doctor')
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO doc1_id FROM public.users WHERE email = 'demo.doctor@nexusmd.app';
  SELECT id INTO doc2_id FROM public.users WHERE email = 'demo.doctor2@nexusmd.app';

  -- ✅ Ensure patient user exists
  INSERT INTO public.users (email, name, role, phone, language_pref)
  VALUES ('demo.patient@nexusmd.app', 'Priya Sharma', 'patient', '+91-9876543211', 'hi')
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO pat_user_id FROM public.users WHERE email = 'demo.patient@nexusmd.app';

  -- ✅ Create patient if not exists
  INSERT INTO public.patients (
    user_id, name, dob, gender, blood_group,
    allergies, chronic_conditions, abha_id, phone, address, emergency_contact
  )
  VALUES (
    pat_user_id, 'Priya Sharma', '1981-03-15', 'F', 'B+',
    ARRAY['Sulfonamides', 'Penicillin'],
    ARRAY['Type 2 Diabetes', 'Hypertension'],
    'DEMO-ABHA-12345', '+91 98765 43211',
    'Gurugram',
    '{"name": "Rajesh Sharma", "relation": "Spouse", "phone": "+91 98765 43210"}'
  )
  ON CONFLICT (abha_id) DO NOTHING
  RETURNING id INTO pat_id;

  -- If already exists
  IF pat_id IS NULL THEN
    SELECT id INTO pat_id FROM public.patients WHERE abha_id = 'DEMO-ABHA-12345';
  END IF;

  -- SAFETY CHECK
  IF pat_id IS NULL THEN
    RAISE EXCEPTION 'Patient creation failed';
  END IF;

  -- ═══ Consultations ═══
  INSERT INTO public.consultations (patient_id, doctor_id, status, consultation_type)
  VALUES (pat_id, doc1_id, 'completed', 'followup') RETURNING id INTO c1;

  INSERT INTO public.consultations (patient_id, doctor_id, status, consultation_type)
  VALUES (pat_id, doc1_id, 'completed', 'followup') RETURNING id INTO c2;

  INSERT INTO public.consultations (patient_id, doctor_id, status, consultation_type)
  VALUES (pat_id, doc2_id, 'completed', 'general') RETURNING id INTO c3;

  -- ═══ EMR ═══
  INSERT INTO public.emr_entries (consultation_id, chief_complaint)
  VALUES
    (c1, 'Diabetes follow-up'),
    (c2, 'Hypertension review'),
    (c3, 'Flu symptoms');

  -- ═══ Prescriptions ═══
  INSERT INTO public.prescriptions (consultation_id, medication_name)
  VALUES
    (c1, 'Metformin'),
    (c2, 'Amlodipine'),
    (c3, 'Paracetamol');

  -- ═══ Billing ═══
  INSERT INTO public.billing_drafts (consultation_id, subtotal, tax, total)
  VALUES
    (c1, 1000, 180, 1180),
    (c2, 800, 144, 944),
    (c3, 500, 90, 590);

  RAISE NOTICE '✅ Seed data inserted successfully';

END $$;