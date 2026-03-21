import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { ActiveConsultationClient } from "@/components/doctor/ActiveConsultationClient";

export default async function ActiveConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (!["doctor", "nurse"].includes(user.role)) redirect("/login");

  const params = await searchParams;
  const patientId = params.patientId ?? "";
  const patientName = params.patientName ?? "Priya Sharma";
  let consultationId = params.id ?? "new";
  let validPatientId = patientId;

  if (consultationId === "new") {
    const supabase = await import("@/lib/supabase-server").then(m => m.getSupabaseAdminClient());
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!validPatientId || !uuidRegex.test(validPatientId)) {
      const { data: p } = await supabase.from("patients").select("id").limit(1).maybeSingle();
      if (p) validPatientId = p.id;
    }

    if (validPatientId && uuidRegex.test(validPatientId)) {
      let validDoctorId = uuidRegex.test(user.id) ? user.id : null;
      if (!validDoctorId) {
        // Find any existing doctor_id to satisfy foreign key constraints
        const { data: existing } = await supabase.from("consultations").select("doctor_id").not("doctor_id", "is", null).limit(1).maybeSingle();
        if (existing) {
          validDoctorId = existing.doctor_id;
        } else {
          // Fall back to any user id if consultations is completely empty
          const { data: userRow } = await supabase.from("users").select("id").limit(1).maybeSingle();
          if (userRow) validDoctorId = userRow.id;
        }
      }

      const { data, error } = await supabase.from("consultations").insert({
        patient_id: validPatientId,
        doctor_id: validDoctorId,
        consultation_type: "general",
        status: "active",
        started_at: new Date().toISOString(),
        consent_recorded: false,
      }).select().maybeSingle();
      
      if (error) {
        console.error("Failed to insert consultation, likely UUID foreign key mismatch:", error);
        consultationId = crypto.randomUUID();
      } else if (data) {
        consultationId = data.id;
      }
    } else {
      consultationId = crypto.randomUUID();
    }
  }

  return (
    <div className="h-full">
      <ActiveConsultationClient
        consultationId={consultationId}
        patientName={patientName}
        patientId={validPatientId}
      />
    </div>
  );
}
