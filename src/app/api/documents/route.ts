import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getServerUser } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DOCUMENT_EXTRACTION_PROMPT = `You are a medical document OCR and extraction engine for an Indian healthcare platform.

You will receive extracted text from a medical document (prescription, lab report, or discharge summary).

Extract ALL relevant medical information and structure it as JSON.

RULES:
- Extract EVERY medication, test, and diagnosis mentioned
- For medications: name, dose/strength, frequency, duration, route, instructions
- For lab tests: test name and result (if visible)
- Infer document type: prescription, lab_report, discharge_summary, or other
- Extract doctor details, hospital/clinic, date, patient name (if visible)
- If any field is unclear, use null
- Be thorough but accurate

Return ONLY valid JSON matching this schema:
{
  "document_type": "prescription" | "lab_report" | "discharge_summary" | "other",
  "doctor_name": "string | null",
  "hospital": "string | null",
  "date": "YYYY-MM-DD | null",
  "patient_name": "string | null",

  "diagnosis": ["string"] or [],

  "medications": [
    {
      "name": "medication name",
      "dose": "e.g., 500mg",
      "frequency": "e.g., Twice daily / BD / TDS",
      "duration": "e.g., 7 days / 2 weeks",
      "route": "Oral | IV | Topical | null",
      "instructions": "string | null"
    }
  ] or [],

  "lab_tests": [
    {
      "test_name": "string",
      "result": "string | null",
      "unit": "string | null",
      "normal_range": "string | null"
    }
  ] or [],

  "vitals": {
    "bp": "string | null",
    "heart_rate": "number | null",
    "temperature": "number | null",
    "weight": "number | null"
  } or null,

  "notes": "string | null - any additional instructions or remarks",
  "follow_up": "string | null - follow-up instructions",
  "confidence": "high" | "medium" | "low"
}`;

interface UploadDocumentRequest {
    patient_id: string;
    file_name: string;
    file_type?: string;
    extracted_text?: string;  // If OCR already done client-side
    image_base64?: string;    // If image needs OCR
    document_date?: string;
    consultation_id?: string;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: UploadDocumentRequest = await request.json();
        const {
            patient_id,
            file_name,
            file_type = "other",
            extracted_text,
            image_base64,
            document_date,
            consultation_id,
        } = body;

        if (!patient_id || !file_name) {
            return NextResponse.json(
                { error: "Missing required fields: patient_id, file_name" },
                { status: 400 }
            );
        }

        // Validate patient access
        const supabase = await createServerClient();

        // Check if user has access to this patient
        if (user.role === "patient") {
            const { data: patientData } = await supabase
                .from("patients")
                .select("user_id")
                .eq("id", patient_id)
                .single();

            if (patientData?.user_id !== user.id) {
                return NextResponse.json(
                    { error: "You can only upload documents for your own account" },
                    { status: 403 }
                );
            }
        }

        let rawText = extracted_text || "";
        let ocrConfidence = extracted_text ? 1.0 : 0;

        // Step 1: If image provided, perform OCR using Groq Vision
        if (image_base64 && !extracted_text) {
            console.log("[Document Ingestion] Performing OCR with Groq Vision...");

            try {
                const visionResponse = await groq.chat.completions.create({
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature: 0.1,
                    max_tokens: 3000,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "Extract ALL text from this medical document. Include everything: doctor name, hospital, date, patient name, diagnosis, medications, dosages, lab results, instructions. Return raw text only, no formatting.",
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${image_base64}`,
                                    },
                                },
                            ],
                        },
                    ],
                });

                rawText = visionResponse.choices[0]?.message?.content ?? "";
                ocrConfidence = 0.85; // Estimated confidence for Groq Vision

                console.log(`[Document Ingestion] OCR extracted ${rawText.length} characters`);
            } catch (ocrError) {
                console.error("[Document Ingestion] OCR failed:", ocrError);
                return NextResponse.json(
                    {
                        error: "OCR processing failed",
                        details: ocrError instanceof Error ? ocrError.message : "Unknown error",
                    },
                    { status: 500 }
                );
            }
        }

        if (!rawText || rawText.trim().length === 0) {
            return NextResponse.json(
                { error: "No text extracted from document. Please provide extracted_text or image_base64." },
                { status: 400 }
            );
        }

        // Step 2: AI Extraction - Convert raw text to structured JSON
        console.log("[Document Ingestion] Performing AI extraction...");

        let structuredData: Record<string, unknown> = {};
        let extractionError: string | null = null;

        try {
            const extractionResponse = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                max_tokens: 2048,
                messages: [
                    { role: "system", content: DOCUMENT_EXTRACTION_PROMPT },
                    { role: "user", content: `Extracted Text:\n\n${rawText}` },
                ],
            });

            const rawContent = extractionResponse.choices[0]?.message?.content ?? "{}";

            // Parse JSON (handle markdown code blocks)
            try {
                const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
                structuredData = JSON.parse(jsonMatch[1]?.trim() ?? rawContent);
                console.log("[Document Ingestion] Structured data extracted successfully");
            } catch (parseError) {
                console.error("[Document Ingestion] JSON parse failed:", parseError);
                extractionError = "Failed to parse AI extraction result";
                structuredData = { raw_response: rawContent };
            }
        } catch (aiError) {
            console.error("[Document Ingestion] AI extraction failed:", aiError);
            extractionError = aiError instanceof Error ? aiError.message : "AI extraction error";
        }

        // Step 3: Determine file type and processing status
        const inferredFileType =
            (structuredData.document_type as string) || file_type;

        const inferredDocumentDate =
            document_date ||
            (structuredData.date as string) ||
            null;

        const processingStatus = extractionError ? "failed" : "completed";

        // Step 4: Store in database
        const { data: uploadedDoc, error: dbError } = await supabase
            .from("uploaded_documents")
            .insert({
                patient_id,
                doctor_id: user.role === "doctor" ? user.id : null,
                file_name,
                file_url: image_base64
                    ? `data:image/jpeg;base64,${image_base64.substring(0, 100)}...` // Truncated for storage
                    : "no-image",
                file_type: inferredFileType,
                file_size_bytes: image_base64 ? image_base64.length : rawText.length,
                mime_type: image_base64 ? "image/jpeg" : "text/plain",
                extracted_text: rawText,
                ocr_confidence: ocrConfidence,
                structured_data: structuredData,
                consultation_id: consultation_id || null,
                document_date: inferredDocumentDate,
                processing_status: processingStatus,
                error_message: extractionError,
                uploaded_by: user.id,
                processed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (dbError) {
            console.error("[Document Ingestion] Database insert failed:", dbError);
            return NextResponse.json(
                { error: "Failed to save document", details: dbError.message },
                { status: 500 }
            );
        }

        console.log(`[Document Ingestion] Document saved successfully: ${uploadedDoc?.id}`);

        // Step 5: Return success response
        return NextResponse.json({
            success: true,
            document_id: uploadedDoc?.id,
            extracted_text: rawText,
            structured_data: structuredData,
            ocr_confidence: ocrConfidence,
            processing_status: processingStatus,
            file_type: inferredFileType,
            document_date: inferredDocumentDate,
            message: extractionError
                ? `Document uploaded but extraction had errors: ${extractionError}`
                : "Document uploaded and processed successfully",
        });
    } catch (error) {
        console.error("[Document Ingestion API] Error:", error);
        return NextResponse.json(
            {
                error: "Document ingestion failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve uploaded documents
export async function GET(request: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patient_id");
        const consultationId = searchParams.get("consultation_id");
        const fileType = searchParams.get("file_type");

        const supabase = await createServerClient();

        let query = supabase
            .from("uploaded_documents")
            .select("*")
            .order("document_date", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false });

        if (patientId) {
            query = query.eq("patient_id", patientId);
        }

        if (consultationId) {
            query = query.eq("consultation_id", consultationId);
        }

        if (fileType) {
            query = query.eq("file_type", fileType);
        }

        // For patients, only show their own documents
        if (user.role === "patient") {
            const { data: patientData } = await supabase
                .from("patients")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (patientData) {
                query = query.eq("patient_id", patientData.id);
            } else {
                return NextResponse.json({ documents: [] });
            }
        }

        const { data: documents, error } = await query;

        if (error) {
            console.error("[Get Documents] Query failed:", error);
            return NextResponse.json(
                { error: "Failed to fetch documents", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            documents: documents || [],
            count: documents?.length || 0,
        });
    } catch (error) {
        console.error("[Get Documents API] Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve documents", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
