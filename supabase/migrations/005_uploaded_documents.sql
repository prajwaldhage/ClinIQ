-- ============================================================
-- Document Ingestion & Timeline System
-- Migration: 005_uploaded_documents.sql
-- ============================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ─── Uploaded Documents Table ────────────────────────────────────────────────
-- Stores OCR-scanned prescriptions, reports, and medical documents
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- File metadata
  file_name           TEXT NOT NULL,
  file_url            TEXT NOT NULL,  -- Supabase Storage URL or base64
  file_type           TEXT NOT NULL CHECK (file_type IN ('prescription', 'lab_report', 'discharge_summary', 'xray', 'mri', 'ct_scan', 'other')),
  file_size_bytes     INTEGER,
  mime_type           TEXT,

  -- OCR extraction
  extracted_text      TEXT,  -- Raw OCR output
  ocr_confidence      NUMERIC(3, 2) CHECK (ocr_confidence BETWEEN 0 AND 1),  -- 0.00 to 1.00

  -- Structured data (JSON extracted by AI)
  structured_data     JSONB DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "doctor_name": "Dr. Sharma",
  --   "hospital": "Apollo Hospital",
  --   "date": "2026-03-15",
  --   "diagnosis": ["Type 2 Diabetes"],
  --   "medications": [
  --     {"name": "Metformin", "dose": "500mg", "frequency": "Twice daily"}
  --   ],
  --   "lab_tests": ["HbA1c", "FBS"],
  --   "notes": "Follow-up in 3 months"
  -- }

  -- Timeline integration
  consultation_id     UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  document_date       DATE,  -- Date on the document (may differ from upload date)

  -- Processing status
  processing_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message       TEXT,

  -- Metadata
  uploaded_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ,

  -- Tags for categorization
  tags                TEXT[] DEFAULT '{}',

  -- Audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_uploaded_documents_patient ON public.uploaded_documents(patient_id);
CREATE INDEX idx_uploaded_documents_doctor ON public.uploaded_documents(doctor_id);
CREATE INDEX idx_uploaded_documents_consultation ON public.uploaded_documents(consultation_id);
CREATE INDEX idx_uploaded_documents_date ON public.uploaded_documents(document_date DESC);
CREATE INDEX idx_uploaded_documents_type ON public.uploaded_documents(file_type);
CREATE INDEX idx_uploaded_documents_status ON public.uploaded_documents(processing_status);

-- Full-text search on extracted text
CREATE INDEX idx_uploaded_documents_extracted_text_gin
  ON public.uploaded_documents
  USING gin(to_tsvector('english', COALESCE(extracted_text, '')));

-- JSONB index for structured data queries
CREATE INDEX idx_uploaded_documents_structured_data_gin
  ON public.uploaded_documents
  USING gin(structured_data);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients can view own documents"
  ON public.uploaded_documents FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Patients can upload their own documents
CREATE POLICY "Patients can upload own documents"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Doctors can view documents of their patients
CREATE POLICY "Doctors can view patient documents"
  ON public.uploaded_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('doctor', 'nurse', 'admin')
    )
  );

-- Doctors can update processing status
CREATE POLICY "Doctors can update document processing"
  ON public.uploaded_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('doctor', 'nurse', 'admin')
    )
  );

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON public.uploaded_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- ─── Updated Trigger ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_uploaded_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER uploaded_documents_update_timestamp
  BEFORE UPDATE ON public.uploaded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_uploaded_documents_timestamp();

-- ─── Views for Timeline ──────────────────────────────────────────────────────
-- Unified patient timeline view combining consultations and documents
CREATE OR REPLACE VIEW public.patient_timeline AS
SELECT
  'consultation' AS event_type,
  c.id AS event_id,
  c.patient_id,
  c.doctor_id,
  c.started_at AS event_date,
  c.chief_complaint AS title,
  c.status,
  json_build_object(
    'consultation_type', c.consultation_type,
    'diagnosis', (SELECT array_agg(diagnosis) FROM unnest(emr.diagnosis) AS diagnosis),
    'medications_count', (SELECT count(*) FROM jsonb_array_elements(emr.medications::jsonb))
  ) AS metadata,
  c.created_at
FROM public.consultations c
LEFT JOIN LATERAL (
  SELECT * FROM public.emr_entries WHERE consultation_id = c.id ORDER BY created_at DESC LIMIT 1
) emr ON TRUE

UNION ALL

SELECT
  'document' AS event_type,
  ud.id AS event_id,
  ud.patient_id,
  ud.doctor_id,
  COALESCE(ud.document_date, ud.uploaded_at::date)::timestamptz AS event_date,
  ud.file_name AS title,
  ud.processing_status AS status,
  json_build_object(
    'file_type', ud.file_type,
    'ocr_confidence', ud.ocr_confidence,
    'has_structured_data', (ud.structured_data IS NOT NULL AND ud.structured_data != '{}'::jsonb)
  ) AS metadata,
  ud.created_at
FROM public.uploaded_documents ud

ORDER BY event_date DESC;

-- ─── Helper Functions ────────────────────────────────────────────────────────
-- Function to search documents by text
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT,
  p_patient_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_type TEXT,
  document_date DATE,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ud.id,
    ud.file_name,
    ud.file_type,
    ud.document_date,
    ts_rank(
      to_tsvector('english', COALESCE(ud.extracted_text, '') || ' ' || COALESCE(ud.file_name, '')),
      plainto_tsquery('english', search_query)
    ) AS relevance
  FROM public.uploaded_documents ud
  WHERE
    (p_patient_id IS NULL OR ud.patient_id = p_patient_id)
    AND (
      to_tsvector('english', COALESCE(ud.extracted_text, '') || ' ' || COALESCE(ud.file_name, '')) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY relevance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Sample Data (for testing) ───────────────────────────────────────────────
-- Insert a sample uploaded document for demo patient
DO $$
DECLARE
  demo_patient_id UUID;
BEGIN
  -- Get demo patient ID
  SELECT id INTO demo_patient_id
  FROM public.patients
  WHERE phone = '+91-98765-43210'
  LIMIT 1;

  IF demo_patient_id IS NOT NULL THEN
    INSERT INTO public.uploaded_documents (
      patient_id,
      file_name,
      file_url,
      file_type,
      extracted_text,
      ocr_confidence,
      structured_data,
      document_date,
      processing_status,
      processed_at
    ) VALUES (
      demo_patient_id,
      'prescription_jan_2026.jpg',
      'https://placeholder.com/prescription.jpg',
      'prescription',
      'Dr. Arjun Sharma, Apollo Hospital, Date: 15-Jan-2026. Diagnosis: Type 2 Diabetes. Medications: Metformin 500mg BD, Glimepiride 1mg OD. Follow-up: 3 months.',
      0.92,
      jsonb_build_object(
        'doctor_name', 'Dr. Arjun Sharma',
        'hospital', 'Apollo Hospital',
        'date', '2026-01-15',
        'diagnosis', jsonb_build_array('Type 2 Diabetes'),
        'medications', jsonb_build_array(
          jsonb_build_object('name', 'Metformin', 'dose', '500mg', 'frequency', 'Twice daily'),
          jsonb_build_object('name', 'Glimepiride', 'dose', '1mg', 'frequency', 'Once daily')
        ),
        'notes', 'Follow-up in 3 months'
      ),
      '2026-01-15'::date,
      'completed',
      NOW()
    );
  END IF;
END $$;

-- ─── Grants ──────────────────────────────────────────────────────────────────
-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.uploaded_documents TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- End of migration
-- ============================================================
