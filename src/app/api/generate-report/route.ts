import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getServerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { consultation_id, patient_id } = await request.json();

        if (!consultation_id) {
            return NextResponse.json(
                { error: "Missing required field: consultation_id" },
                { status: 400 }
            );
        }

        const supabase = await createServerClient();

        // Fetch consultation data
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
                patients:patient_id (name, dob, gender, blood_group, phone),
                emr_entries (
                    diagnosis,
                    icd_codes,
                    medications,
                    lab_tests_ordered,
                    vitals,
                    symptoms,
                    physical_examination,
                    patient_summary,
                    clinical_summary,
                    created_at
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
                ),
                safety_alerts (
                    alert_type,
                    severity,
                    title,
                    acknowledged
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

        // Authorization check
        if (user.role === "patient") {
            const { data: patientData } = await supabase
                .from("patients")
                .select("user_id")
                .eq("id", consultation.patient_id)
                .single();

            if (patientData?.user_id !== user.id) {
                return NextResponse.json(
                    { error: "You can only generate reports for your own consultations" },
                    { status: 403 }
                );
            }
        }

        // Extract data
        const emr = Array.isArray(consultation.emr_entries) && consultation.emr_entries.length > 0
            ? consultation.emr_entries[0]
            : null;

        const doctor = consultation.users as { name?: string } | null;
        const patient = consultation.patients as { name?: string; dob?: string; gender?: string; blood_group?: string; phone?: string } | null;

        const durationMs = consultation.ended_at
            ? new Date(consultation.ended_at).getTime() - new Date(consultation.started_at).getTime()
            : null;

        // Build report data
        const reportData = {
            patientName: patient?.name || "Patient",
            patientDOB: patient?.dob,
            patientGender: patient?.gender,
            patientBloodGroup: patient?.blood_group,
            patientPhone: patient?.phone,
            consultationId: consultation.id,
            doctorName: doctor?.name || "Doctor",
            startedAt: consultation.started_at,
            endedAt: consultation.ended_at,
            durationMs: durationMs,
            chiefComplaint: consultation.chief_complaint || (emr as any)?.chief_complaint,
            symptoms: (emr?.symptoms || []) as string[],
            vitals: (emr?.vitals || {}) as Record<string, string | number>,
            physicalExamination: emr?.physical_examination as string,
            diagnosis: (emr?.diagnosis || []) as string[],
            icdCodes: ((emr?.icd_codes || []) as Array<{ code: string; description: string }>),
            medications: ((emr?.medications || []) as Array<{
                name: string;
                dose?: string;
                frequency?: string;
                duration?: string;
                route?: string;
            }>).length > 0
                ? (emr?.medications as Array<{
                    name: string;
                    dose?: string;
                    frequency?: string;
                    duration?: string;
                    route?: string;
                }>)
                : (consultation.prescriptions || []).map((p: Record<string, unknown>) => ({
                    name: p.medication_name as string,
                    dose: p.dosage as string,
                    frequency: p.frequency as string,
                    duration: p.duration as string,
                    route: p.route as string,
                })),
            labTestsOrdered: (emr?.lab_tests_ordered || []) as string[],
            clinicalSummary: emr?.clinical_summary as string,
            patientSummary: emr?.patient_summary as string,
            safetyAlerts: ((consultation.safety_alerts || []) as Array<{ title: string; severity: string; acknowledged: boolean }>).map((a) => ({
                title: a.title,
                severity: a.severity,
                acknowledged: a.acknowledged,
            })),
            billing: consultation.billing
                ? {
                    items: ((consultation.billing as { line_items?: unknown }).line_items || []) as Array<{ description: string; fee: number }>,
                    subtotal: (consultation.billing as { subtotal?: number }).subtotal || 0,
                    gst: (consultation.billing as { gst_amount?: number }).gst_amount || 0,
                    total: (consultation.billing as { total?: number }).total || 0,
                }
                : undefined,
        };

        // Generate HTML report (use same format as report-generator.ts)
        const html = generateMedicalReportHTML(reportData);

        // Return HTML that auto-downloads when opened
        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `inline; filename="medical_report_${consultation_id.substring(0, 8)}.html"`,
            },
        });
    } catch (error) {
        console.error("[Generate Report API] Error:", error);
        return NextResponse.json(
            { error: "Report generation failed", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// Re-use the same HTML template from report-generator.ts
function generateMedicalReportHTML(data: Record<string, unknown>): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const durationMin = data.durationMs
        ? Math.round((data.durationMs as number) / 60000)
        : null;

    const medications = data.medications as Array<{
        name: string;
        dose?: string;
        frequency?: string;
        duration?: string;
        route?: string;
    }> || [];

    const diagnosis = data.diagnosis as string[] || [];
    const icdCodes = data.icdCodes as Array<{ code: string; description: string }> || [];
    const symptoms = data.symptoms as string[] || [];
    const labTests = data.labTestsOrdered as string[] || [];
    const vitals = data.vitals as Record<string, string | number> || {};
    const safetyAlerts = data.safetyAlerts as Array<{ title: string; severity: string; acknowledged: boolean }> || [];
    const billing = data.billing as { items: Array<{ description: string; fee: number }>; subtotal: number; gst: number; total: number } | undefined;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Medical Report — ${data.patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
      padding: 0;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 48px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e40af;
      letter-spacing: -0.3px;
    }
    .header-left p {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #6b7280;
    }
    .header-right .doc-name {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 13px;
    }

    .patient-bar {
      display: flex;
      gap: 24px;
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .patient-bar .field {
      display: flex;
      flex-direction: column;
    }
    .patient-bar .field-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      font-weight: 600;
    }
    .patient-bar .field-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
    }

    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #2563eb;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .section-body {
      padding-left: 4px;
    }

    ul { padding-left: 18px; }
    li { margin-bottom: 2px; }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
    }
    .vital-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .vital-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      font-weight: 600;
    }
    .vital-value {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f3f4f6;
      text-align: left;
      padding: 6px 10px;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 6px 10px;
      border-bottom: 1px solid #f3f4f6;
    }

    .alert-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .alert-critical { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
    .alert-high { background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; }
    .alert-medium { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
    .alert-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-critical { background: #ef4444; }
    .dot-high { background: #f97316; }
    .dot-medium { background: #eab308; }

    .billing-total {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 14px;
      padding-top: 6px;
      border-top: 2px solid #1e40af;
      margin-top: 4px;
      color: #1e40af;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-left {
      font-size: 10px;
      color: #9ca3af;
    }
    .footer-right {
      text-align: right;
    }
    .signature-line {
      width: 180px;
      border-bottom: 1px solid #1a1a1a;
      margin-bottom: 4px;
      margin-left: auto;
    }
    .signature-label {
      font-size: 10px;
      color: #6b7280;
    }

    .patient-summary {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #166534;
      line-height: 1.7;
    }
    .patient-summary-title {
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      color: #15803d;
    }

    @media print {
      body { padding: 0; }
      .page { padding: 24px 32px; }
      .no-print { display: none !important; }
    }

    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1e40af;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 10px;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .print-bar button {
      padding: 8px 20px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-print {
      background: #fff;
      color: #1e40af;
    }
    .btn-print:hover {
      background: #f0f7ff;
    }
    .print-bar span {
      color: #bfdbfe;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span>📋 Medical Report Ready</span>
    <button class="btn-print" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <div class="page" style="margin-top: 52px;">
    <div class="header">
      <div class="header-left">
        <h1>CliniQ</h1>
        <p>AI-Powered Clinical Report · Smart EMR System</p>
      </div>
      <div class="header-right">
        <p class="doc-name">${data.doctorName ?? "Dr. Arjun Sharma"}</p>
        <p>MBBS, MD (General Medicine)</p>
        <p>Reg. No: MH-12345</p>
      </div>
    </div>

    <div class="patient-bar">
      <div class="field">
        <span class="field-label">Patient</span>
        <span class="field-value">${data.patientName}</span>
      </div>
      <div class="field">
        <span class="field-label">Date</span>
        <span class="field-value">${dateStr}</span>
      </div>
      <div class="field">
        <span class="field-label">Time</span>
        <span class="field-value">${timeStr}</span>
      </div>
      ${durationMin ? `
      <div class="field">
        <span class="field-label">Duration</span>
        <span class="field-value">${durationMin} min</span>
      </div>` : ""}
      <div class="field">
        <span class="field-label">Consultation ID</span>
        <span class="field-value" style="font-size:10px;font-family:monospace">${(data.consultationId as string).substring(0, 8)}</span>
      </div>
    </div>

    ${data.chiefComplaint ? `
    <div class="section">
      <div class="section-title">Chief Complaint</div>
      <div class="section-body">
        <p>${data.chiefComplaint}</p>
      </div>
    </div>` : ""}

    ${symptoms.length > 0 ? `
    <div class="section">
      <div class="section-title">Symptoms</div>
      <div class="section-body">
        <ul>
          ${symptoms.map((s) => `<li>${s}</li>`).join("\n")}
        </ul>
      </div>
    </div>` : ""}

    ${Object.keys(vitals).length > 0 ? `
    <div class="section">
      <div class="section-title">Vitals</div>
      <div class="vitals-grid">
        ${Object.entries(vitals)
                .filter(([, v]) => v !== "" && v !== null && v !== undefined)
                .map(([k, v]) => `
        <div class="vital-card">
          <div class="vital-label">${k.replace(/_/g, " ")}</div>
          <div class="vital-value">${v}</div>
        </div>`).join("")}
      </div>
    </div>` : ""}

    ${data.physicalExamination ? `
    <div class="section">
      <div class="section-title">Physical Examination</div>
      <div class="section-body">
        <p>${data.physicalExamination}</p>
      </div>
    </div>` : ""}

    ${diagnosis.length > 0 ? `
    <div class="section">
      <div class="section-title">Diagnosis</div>
      <div class="section-body">
        <ul>
          ${diagnosis.map((d) => `<li><strong>${d}</strong></li>`).join("\n")}
        </ul>
        ${icdCodes.length > 0 ? `
        <p style="margin-top:6px;font-size:11px;color:#6b7280">
          ICD-10: ${icdCodes.map((c) => `${c.code} (${c.description})`).join(", ")}
        </p>` : ""}
      </div>
    </div>` : ""}

    ${medications.length > 0 ? `
    <div class="section">
      <div class="section-title">Prescribed Medications</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medication</th>
            <th>Dose</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Route</th>
          </tr>
        </thead>
        <tbody>
          ${medications.map((m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.dose ?? "—"}</td>
            <td>${m.frequency ?? "—"}</td>
            <td>${m.duration ?? "—"}</td>
            <td>${m.route ?? "Oral"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>` : ""}

    ${labTests.length > 0 ? `
    <div class="section">
      <div class="section-title">Lab Tests Ordered</div>
      <div class="section-body">
        <ul>
          ${labTests.map((t) => `<li>${t}</li>`).join("\n")}
        </ul>
      </div>
    </div>` : ""}

    ${safetyAlerts.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠ Safety Alerts</div>
      <div class="section-body">
        ${safetyAlerts.map((a) => `
        <div class="alert-row alert-${a.severity}">
          <div class="alert-dot dot-${a.severity}"></div>
          <span>${a.title}</span>
          ${a.acknowledged ? '<span style="margin-left:auto;font-size:10px;color:#16a34a">✓ Acknowledged</span>' : ''}
        </div>`).join("")}
      </div>
    </div>` : ""}

    ${data.clinicalSummary ? `
    <div class="section">
      <div class="section-title">Clinical Summary</div>
      <div class="section-body">
        <p>${data.clinicalSummary}</p>
      </div>
    </div>` : ""}

    ${data.patientSummary ? `
    <div class="section">
      <div class="patient-summary">
        <div class="patient-summary-title">📝 Patient's Summary (in simple language)</div>
        <p>${data.patientSummary}</p>
      </div>
    </div>` : ""}

    ${billing && billing.total > 0 ? `
    <div class="section">
      <div class="section-title">Billing Summary</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:right">Fee (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${billing.items.map((item) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align:right">₹${item.fee.toFixed(2)}</td>
          </tr>`).join("")}
          <tr>
            <td>GST (18%)</td>
            <td style="text-align:right">₹${billing.gst.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div class="billing-total">
        <span>Total</span>
        <span>₹${billing.total.toFixed(2)}</span>
      </div>
    </div>` : ""}

    <div class="footer">
      <div class="footer-left">
        <p>Generated by CliniQ Smart EMR</p>
        <p>Report ID: ${(data.consultationId as string).substring(0, 8)} · ${dateStr} ${timeStr}</p>
        <p style="margin-top:4px;font-size:9px">This is a computer-generated report. Verify with a healthcare provider.</p>
      </div>
      <div class="footer-right">
        <div class="signature-line"></div>
        <p class="signature-label">${data.doctorName ?? "Dr. Arjun Sharma"}</p>
        <p class="signature-label">Signature</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
