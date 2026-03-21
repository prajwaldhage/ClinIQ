import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getServerUser } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INSURANCE_CLAIM_PROMPT = `You are an expert insurance claim document generator for Indian healthcare insurance (IRDA, TPA, Mediclaim, Ayushman Bharat).

Given consultation data (EMR, prescriptions, billing), generate a complete insurance claim summary.

RULES:
- Use formal medical language suitable for insurance審査
- Include ICD-10 codes for all diagnoses
- Summarize treatment plan clearly
- Break down costs by category
- Add clinical justification for procedures
- Follow IRDA guidelines for claim documentation
- Include emergency/planned admission details if applicable
- Mention pre-existing conditions if relevant

Return ONLY valid JSON matching this schema:
{
  "claim_summary": {
    "patient_name": "string",
    "patient_age": "number | null",
    "patient_gender": "M | F | Other",
    "policy_holder": "Self | Spouse | Parent | Child",
    "admission_type": "OPD | IPD | Emergency | Day Care",
    "hospitalization_duration": "string | null - e.g., '3 days' or null for OPD"
  },

  "clinical_summary": {
    "chief_complaint": "string",
    "diagnosis": ["string"],
    "icd_codes": ["string - e.g., E11.9"],
    "severity": "Mild | Moderate | Severe | Critical",
    "complications": "string | null",
    "comorbidities": ["string"] or []
  },

  "treatment_summary": {
    "investigations_performed": ["string - lab tests, imaging"],
    "medications_prescribed": ["string - name + dose + duration"],
    "procedures_performed": ["string"] or [],
    "clinical_outcome": "Improved | Stabilized | Referred | Under Treatment",
    "follow_up_required": "Yes | No",
    "follow_up_duration": "string | null - e.g., '2 weeks'"
  },

  "cost_breakdown": {
    "consultation_fee": number,
    "diagnostic_tests": number,
    "medications": number,
    "procedures": number,
    "other_charges": number,
    "subtotal": number,
    "gst": number,
    "total_claim_amount": number,
    "currency": "INR"
  },

  "justification": "string - 2-3 sentences explaining medical necessity of treatment",

  "supporting_documents_required": ["string - list of documents patient should attach"],

  "claim_eligibility_notes": "string - any notes about coverage, exclusions, or special conditions"
}
`;

interface InsuranceClaimRequest {
    consultation_id: string;
    policy_number?: string;
    insurance_provider?: string;
    policy_holder_relation?: string;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: InsuranceClaimRequest = await request.json();
        const { consultation_id, policy_number, insurance_provider, policy_holder_relation } = body;

        if (!consultation_id) {
            return NextResponse.json(
                { error: "Missing required field: consultation_id" },
                { status: 400 }
            );
        }

        const supabase = await createServerClient();

        // Fetch complete consultation data
        const { data: consultation, error: consultError } = await supabase
            .from("consultations")
            .select(`
                id,
                started_at,
                ended_at,
                status,
                consultation_type,
                chief_complaint,
                doctor_id,
                patient_id,
                users:doctor_id (name, email),
                patients:patient_id (name, dob, gender, blood_group, chronic_conditions, allergies),
                emr_entries (
                    diagnosis,
                    icd_codes,
                    medications,
                    lab_tests_ordered,
                    vitals,
                    symptoms,
                    physical_examination,
                    clinical_summary
                ),
                prescriptions (
                    medication_name,
                    dosage,
                    frequency,
                    duration,
                    route
                ),
                billing (
                    line_items,
                    subtotal,
                    gst_amount,
                    total
                )
            `)
            .eq("id", consultation_id)
            .single();

        if (consultError || !consultation) {
            return NextResponse.json(
                { error: "Consultation not found", details: consultError?.message },
                { status: 404 }
            );
        }

        // Authorization: doctors and patients (of that consultation) only
        if (user.role === "patient") {
            const { data: patientData } = await supabase
                .from("patients")
                .select("user_id")
                .eq("id", consultation.patient_id)
                .single();

            if (patientData?.user_id !== user.id) {
                return NextResponse.json(
                    { error: "You can only generate claims for your own consultations" },
                    { status: 403 }
                );
            }
        } else if (user.role !== "doctor" && user.role !== "admin") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Extract nested data
        const emr = Array.isArray(consultation.emr_entries) && consultation.emr_entries.length > 0
            ? consultation.emr_entries[0]
            : null;

        const doctor = consultation.users as { name?: string; email?: string } | null;
        const patient = consultation.patients as {
            name?: string;
            dob?: string;
            gender?: string;
            chronic_conditions?: string[];
            allergies?: string[];
        } | null;

        const billing = consultation.billing as {
            line_items?: Array<{ description: string; fee: number; category: string }>;
            subtotal?: number;
            gst_amount?: number;
            total?: number;
        } | null;

        const medications = (emr?.medications as Array<{
            name: string;
            dose?: string;
            frequency?: string;
            duration?: string;
        }>) || [];

        const prescriptions = (consultation.prescriptions || []) as Array<{
            medication_name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;

        // Calculate patient age from DOB
        const patientAge = patient?.dob
            ? Math.floor(
                (new Date().getTime() - new Date(patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            )
            : null;

        // Build context for AI
        const contextForAI = {
            patient: {
                name: patient?.name || "Patient",
                age: patientAge,
                gender: patient?.gender,
                chronic_conditions: patient?.chronic_conditions || [],
                allergies: patient?.allergies || [],
            },
            consultation: {
                type: consultation.consultation_type,
                chief_complaint: consultation.chief_complaint || emr?.chief_complaint,
                started_at: consultation.started_at,
                ended_at: consultation.ended_at,
                duration_minutes: consultation.ended_at
                    ? Math.round(
                        (new Date(consultation.ended_at).getTime() -
                            new Date(consultation.started_at).getTime()) /
                        60000
                    )
                    : null,
            },
            clinical: {
                symptoms: emr?.symptoms || [],
                vitals: emr?.vitals || {},
                physical_examination: emr?.physical_examination,
                diagnosis: emr?.diagnosis || [],
                icd_codes: (emr?.icd_codes as Array<{ code: string; description: string }>) || [],
                clinical_summary: emr?.clinical_summary,
            },
            treatment: {
                medications: medications.length > 0
                    ? medications
                    : prescriptions.map((p) => ({
                        name: p.medication_name,
                        dose: p.dosage,
                        frequency: p.frequency,
                        duration: p.duration,
                    })),
                lab_tests_ordered: emr?.lab_tests_ordered || [],
            },
            billing: {
                line_items: billing?.line_items || [],
                subtotal: billing?.subtotal || 0,
                gst: billing?.gst_amount || 0,
                total: billing?.total || 0,
            },
        };

        // Call Groq AI to generate insurance claim document
        console.log("[Insurance Claim] Generating claim with Groq AI...");

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 3000,
            messages: [
                { role: "system", content: INSURANCE_CLAIM_PROMPT },
                {
                    role: "user",
                    content: `Generate insurance claim document from this consultation data:\n\n${JSON.stringify(contextForAI, null, 2)}`,
                },
            ],
        });

        const rawContent = response.choices[0]?.message?.content ?? "{}";

        // Parse JSON response
        let claimData: Record<string, unknown>;
        try {
            const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
            claimData = JSON.parse(jsonMatch[1]?.trim() ?? rawContent);
        } catch (parseError) {
            console.error("[Insurance Claim] JSON parse failed:", parseError);
            return NextResponse.json(
                {
                    error: "Failed to parse AI response",
                    raw_response: rawContent.substring(0, 500),
                },
                { status: 500 }
            );
        }

        // Enrich with user-provided insurance details
        const enrichedClaim = {
            ...claimData,
            insurance_details: {
                policy_number: policy_number || null,
                insurance_provider: insurance_provider || null,
                policy_holder_relation: policy_holder_relation || "Self",
            },
            consultation_id: consultation_id,
            doctor_name: doctor?.name,
            doctor_email: doctor?.email,
            generated_at: new Date().toISOString(),
            generated_by: user.id,
        };

        // Store claim in database (optional: create insurance_claims table for tracking)
        // For now, we'll just return it without storage

        console.log("[Insurance Claim] Claim generated successfully");

        return NextResponse.json({
            success: true,
            claim: enrichedClaim,
            message: "Insurance claim generated successfully",
        });
    } catch (error) {
        console.error("[Insurance Claim API] Error:", error);
        return NextResponse.json(
            {
                error: "Insurance claim generation failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
