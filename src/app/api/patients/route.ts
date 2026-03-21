import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

// POST — Register a new patient
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, dob, gender, blood_group, abha_id, allergies, chronic_conditions, emergency_contact, address } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
        }

        const supabase = getSupabaseAdminClient();

        // 1. Generate a real UUID for the user
        const userId = crypto.randomUUID();

        // 2. Upsert user entry
        const email = `${phone.replace(/\D/g, "")}@patient.nexusmd.app`;
        const { data: userData, error: userError } = await supabase.from("users").upsert({
            id: userId,
            email,
            name,
            phone: phone,
            role: "patient",
            is_active: true,
        }, { onConflict: 'email' }).select('id').single();

        if (userError) {
            console.error("User creation/fetch error:", userError.message);
            return NextResponse.json({ error: userError.message, details: userError }, { status: 500 });
        }

        const actualUserId = userData.id;

        // 3. Find if patient already exists
        const { data: existingPatient } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", actualUserId)
            .maybeSingle();

        const patientData = {
            user_id: actualUserId,
            name,
            phone: phone ?? "",
            dob: dob || "1900-01-01",
            gender: (gender === 'M' || gender === 'F') ? gender : 'Other',
            blood_group: blood_group || "Unknown",
            abha_id: abha_id || null,
            allergies: Array.isArray(allergies) ? allergies : [],
            chronic_conditions: Array.isArray(chronic_conditions) ? chronic_conditions : [],
            address: address || "",
            emergency_contact: emergency_contact || "",
        };

        let result;
        if (existingPatient) {
            result = await supabase
                .from("patients")
                .update(patientData)
                .eq("id", existingPatient.id)
                .select()
                .single();
        } else {
            result = await supabase
                .from("patients")
                .insert(patientData)
                .select()
                .single();
        }

        if (result.error) {
            console.error("Patient operation error:", result.error.message);
            return NextResponse.json({ error: result.error.message, details: result.error }, { status: 500 });
        }

        return NextResponse.json({ patient: result.data });
    } catch (err: any) {
        console.error("API Error [patients POST]:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error", details: err }, { status: 500 });
    }
}

// GET — Search patients by phone, name, or ABHA ID
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";
        const doctor_id = searchParams.get("doctor_id");

        const supabase = getSupabaseAdminClient();

        let dbQuery = supabase.from("patients").select("*, users(email, role, is_active)").order("created_at", { ascending: false });

        if (query.length > 0) {
            // Search across name, phone, abha_id
            dbQuery = dbQuery.or(`name.ilike.%${query}%,phone.ilike.%${query}%,abha_id.ilike.%${query}%`);
        }

        if (doctor_id) {
            // Filter patients who have had consultations with this doctor
            // For now, return all patients (doctor filter would need a join)
        }

        const { data, error } = await dbQuery.limit(50);

        if (error) {
            return NextResponse.json({ patients: [], error: error.message });
        }

        return NextResponse.json({ patients: data ?? [] });
    } catch {
        return NextResponse.json({ patients: [] });
    }
}
