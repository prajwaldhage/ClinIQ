import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getServerUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patient_id");

        if (!patientId) {
            return NextResponse.json(
                { error: "Missing required parameter: patient_id" },
                { status: 400 }
            );
        }

        const supabase = await createServerClient();

        // Auth check: patients can only view their own timeline
        if (user.role === "patient") {
            const { data: patientData } = await supabase
                .from("patients")
                .select("user_id")
                .eq("id", patientId)
                .single();

            if (patientData?.user_id !== user.id) {
                return NextResponse.json(
                    { error: "You can only view your own medical timeline" },
                    { status: 403 }
                );
            }
        }

        // Fetch consultations
        const { data: consultations, error: consultError } = await supabase
            .from("consultations")
            .select(`
                id,
                started_at,
                ended_at,
                status,
                consultation_type,
                chief_complaint,
                doctor_id,
                users:doctor_id (name, email),
                emr_entries (
                    diagnosis,
                    icd_codes,
                    medications,
                    lab_tests_ordered,
                    vitals,
                    symptoms,
                    physical_examination
                ),
                prescriptions (
                    id,
                    medication_name,
                    dosage,
                    frequency
                )
            `)
            .eq("patient_id", patientId)
            .order("started_at", { ascending: false });

        if (consultError) {
            console.error("[Timeline API] Consultation query failed:", consultError);
        }

        // Fetch uploaded documents
        const { data: documents, error: docError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("patient_id", patientId)
            .order("document_date", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false });

        if (docError) {
            console.error("[Timeline API] Documents query failed:", docError);
        }

        // Combine and sort by date
        const timelineEvents: TimelineEvent[] = [];

        // Add consultations
        (consultations || []).forEach((c) => {
            const emr = Array.isArray(c.emr_entries) && c.emr_entries.length > 0
                ? c.emr_entries[0]
                : null;

            timelineEvents.push({
                event_type: "consultation",
                event_id: c.id,
                event_date: c.started_at,
                title: c.chief_complaint || "Consultation",
                subtitle: `Dr. ${(c.users as { name?: string })?.name || "Doctor"}`,
                status: c.status,
                icon: "stethoscope",
                data: {
                    consultation_type: c.consultation_type,
                    diagnosis: emr?.diagnosis || [],
                    icd_codes: emr?.icd_codes || [],
                    medications: emr?.medications || [],
                    lab_tests: emr?.lab_tests_ordered || [],
                    vitals: emr?.vitals || {},
                    symptoms: emr?.symptoms || [],
                    physical_examination: emr?.physical_examination || "",
                    prescription_count: Array.isArray(c.prescriptions) ? c.prescriptions.length : 0,
                },
            });
        });

        // Add uploaded documents
        (documents || []).forEach((d) => {
            const structuredData = d.structured_data as Record<string, unknown> || {};

            timelineEvents.push({
                event_type: "document",
                event_id: d.id,
                event_date: d.document_date || d.uploaded_at,
                title: d.file_name,
                subtitle: structuredData.hospital as string || d.file_type,
                status: d.processing_status,
                icon: getDocumentIcon(d.file_type),
                data: {
                    file_type: d.file_type,
                    file_url: d.file_url,
                    ocr_confidence: d.ocr_confidence,
                    doctor_name: structuredData.doctor_name as string,
                    diagnosis: structuredData.diagnosis as string[] || [],
                    medications: structuredData.medications || [],
                    lab_tests: structuredData.lab_tests || [],
                    notes: structuredData.notes as string,
                },
            });
        });

        // Sort by date descending
        timelineEvents.sort((a, b) => {
            const dateA = new Date(a.event_date).getTime();
            const dateB = new Date(b.event_date).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({
            timeline: timelineEvents,
            total_events: timelineEvents.length,
            consultations_count: consultations?.length || 0,
            documents_count: documents?.length || 0,
        });
    } catch (error) {
        console.error("[Timeline API] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch timeline",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// Helper types
interface TimelineEvent {
    event_type: "consultation" | "document";
    event_id: string;
    event_date: string;
    title: string;
    subtitle: string;
    status: string;
    icon: string;
    data: Record<string, unknown>;
}

function getDocumentIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
        prescription: "pill",
        lab_report: "flask",
        discharge_summary: "file-text",
        xray: "scan",
        mri: "scan",
        ct_scan: "scan",
        other: "file",
    };
    return iconMap[fileType] || "file";
}
