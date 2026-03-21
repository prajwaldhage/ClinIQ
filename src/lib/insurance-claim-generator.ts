// ─── Insurance Claim PDF Generator ────────────────────────────────────────────
// Generates a styled HTML insurance claim form for printing/PDF

interface InsuranceClaimData {
    claim_summary: {
        patient_name: string;
        patient_age?: number | null;
        patient_gender?: string;
        policy_holder: string;
        admission_type: string;
        hospitalization_duration?: string | null;
    };
    clinical_summary: {
        chief_complaint: string;
        diagnosis: string[];
        icd_codes: string[];
        severity: string;
        complications?: string | null;
        comorbidities?: string[];
    };
    treatment_summary: {
        investigations_performed: string[];
        medications_prescribed: string[];
        procedures_performed?: string[];
        clinical_outcome: string;
        follow_up_required: string;
        follow_up_duration?: string | null;
    };
    cost_breakdown: {
        consultation_fee: number;
        diagnostic_tests: number;
        medications: number;
        procedures: number;
        other_charges: number;
        subtotal: number;
        gst: number;
        total_claim_amount: number;
        currency: string;
    };
    justification: string;
    supporting_documents_required: string[];
    claim_eligibility_notes?: string;
    insurance_details?: {
        policy_number?: string;
        insurance_provider?: string;
        policy_holder_relation?: string;
    };
    doctor_name?: string;
    consultation_id?: string;
    generated_at?: string;
}

export function generateInsuranceClaimPDF(claim: InsuranceClaimData): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Insurance Claim — ${claim.claim_summary.patient_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.5;
      padding: 0;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 36px 48px;
    }

    .header {
      text-align: center;
      border-bottom: 3px solid #059669;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #047857;
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }

    .form-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      text-align: center;
      margin-bottom: 20px;
      padding: 8px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 32px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .info-row {
      display: flex;
      gap: 8px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      min-width: 120px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
      flex: 1;
    }

    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 2px solid #d1fae5;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    .section-body {
      padding-left: 8px;
    }

    ul { padding-left: 20px; }
    li { margin-bottom: 3px; }

    .icd-codes {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .icd-badge {
      background: #eff6ff;
      border: 1px solid #93c5fd;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: monospace;
      color: #1e40af;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
    }
    th {
      background: #f0fdf4;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #047857;
      border: 1px solid #86efac;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #e5e7eb;
    }

    .cost-total-row {
      background: #f0fdf4;
      font-weight: 700;
      font-size: 13px;
      color: #047857;
    }

    .justification-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 8px;
      font-size: 11px;
      color: #78350f;
      line-height: 1.7;
    }

    .documents-required {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 8px;
    }
    .documents-required-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #991b1b;
      margin-bottom: 6px;
    }
    .documents-required ul {
      padding-left: 18px;
      color: #7f1d1d;
      font-size: 11px;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    .footer-left {
      font-size: 9px;
      color: #9ca3af;
    }
    .signature-section {
      display: flex;
      gap: 48px;
      margin-top: 24px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      width: 160px;
      border-bottom: 1px solid #1a1a1a;
      margin-bottom: 6px;
      height: 40px;
    }
    .signature-label {
      font-size: 10px;
      color: #6b7280;
      font-weight: 600;
    }

    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #059669;
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
      background: #fff;
      color: #059669;
    }
    .print-bar button:hover {
      background: #f0fdf4;
    }
    .print-bar span {
      color: #d1fae5;
      font-size: 12px;
      font-weight: 500;
    }

    @media print {
      body { padding: 0; }
      .page { padding: 24px 36px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span>📋 Insurance Claim Form Ready</span>
    <button onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <div class="page" style="margin-top: 52px;">
    <div class="header">
      <h1>HEALTH INSURANCE CLAIM FORM</h1>
      <p class="subtitle">As per IRDA (Health Insurance) Regulations</p>
    </div>

    <div class="form-title">MEDICAL REIMBURSEMENT CLAIM</div>

    <!-- Section 1: Patient & Policy Details -->
    <div class="section">
      <div class="section-title">1. Patient & Policy Information</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Patient Name:</span>
          <span class="info-value">${claim.claim_summary.patient_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Age / Gender:</span>
          <span class="info-value">${claim.claim_summary.patient_age ? `${claim.claim_summary.patient_age} years` : "—"} / ${claim.claim_summary.patient_gender || "—"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Policy Holder:</span>
          <span class="info-value">${claim.claim_summary.policy_holder}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Policy Number:</span>
          <span class="info-value">${claim.insurance_details?.policy_number || "______________________"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Insurance Provider:</span>
          <span class="info-value">${claim.insurance_details?.insurance_provider || "______________________"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Admission Type:</span>
          <span class="info-value">${claim.claim_summary.admission_type}</span>
        </div>
        ${claim.claim_summary.hospitalization_duration ? `
        <div class="info-row">
          <span class="info-label">Duration:</span>
          <span class="info-value">${claim.claim_summary.hospitalization_duration}</span>
        </div>` : ""}
        <div class="info-row">
          <span class="info-label">Claim Date:</span>
          <span class="info-value">${dateStr}</span>
        </div>
      </div>
    </div>

    <!-- Section 2: Clinical Details -->
    <div class="section">
      <div class="section-title">2. Clinical Details</div>
      <div class="section-body">
        <p><strong>Chief Complaint:</strong> ${claim.clinical_summary.chief_complaint}</p>

        <p style="margin-top:10px"><strong>Diagnosis:</strong></p>
        <ul>
          ${claim.clinical_summary.diagnosis.map((d) => `<li>${d}</li>`).join("\n")}
        </ul>

        <div class="icd-codes">
          ${claim.clinical_summary.icd_codes.map((code) => `<span class="icd-badge">${code}</span>`).join("")}
        </div>

        <p style="margin-top:10px"><strong>Severity:</strong> ${claim.clinical_summary.severity}</p>

        ${claim.clinical_summary.complications ? `
        <p style="margin-top:6px"><strong>Complications:</strong> ${claim.clinical_summary.complications}</p>
        ` : ""}

        ${claim.clinical_summary.comorbidities && claim.clinical_summary.comorbidities.length > 0 ? `
        <p style="margin-top:6px"><strong>Pre-existing Conditions:</strong> ${claim.clinical_summary.comorbidities.join(", ")}</p>
        ` : ""}
      </div>
    </div>

    <!-- Section 3: Treatment Details -->
    <div class="section">
      <div class="section-title">3. Treatment Provided</div>
      <div class="section-body">
        ${claim.treatment_summary.investigations_performed.length > 0 ? `
        <p style="margin-bottom:4px"><strong>Investigations:</strong></p>
        <ul>
          ${claim.treatment_summary.investigations_performed.map((inv) => `<li>${inv}</li>`).join("\n")}
        </ul>
        ` : ""}

        ${claim.treatment_summary.medications_prescribed.length > 0 ? `
        <p style="margin-top:10px;margin-bottom:4px"><strong>Medications Prescribed:</strong></p>
        <ul>
          ${claim.treatment_summary.medications_prescribed.map((med) => `<li>${med}</li>`).join("\n")}
        </ul>
        ` : ""}

        ${claim.treatment_summary.procedures_performed && claim.treatment_summary.procedures_performed.length > 0 ? `
        <p style="margin-top:10px;margin-bottom:4px"><strong>Procedures:</strong></p>
        <ul>
          ${claim.treatment_summary.procedures_performed.map((proc) => `<li>${proc}</li>`).join("\n")}
        </ul>
        ` : ""}

        <p style="margin-top:10px"><strong>Clinical Outcome:</strong> ${claim.treatment_summary.clinical_outcome}</p>
        <p style="margin-top:4px"><strong>Follow-up Required:</strong> ${claim.treatment_summary.follow_up_required} ${claim.treatment_summary.follow_up_duration ? `(${claim.treatment_summary.follow_up_duration})` : ""}</p>
      </div>
    </div>

    <!-- Section 4: Cost Breakdown -->
    <div class="section">
      <div class="section-title">4. Cost Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Expense Category</th>
            <th style="text-align:right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Consultation Fee</td>
            <td style="text-align:right">₹${claim.cost_breakdown.consultation_fee.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Diagnostic Tests & Imaging</td>
            <td style="text-align:right">₹${claim.cost_breakdown.diagnostic_tests.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Medications</td>
            <td style="text-align:right">₹${claim.cost_breakdown.medications.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Procedures</td>
            <td style="text-align:right">₹${claim.cost_breakdown.procedures.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Other Charges</td>
            <td style="text-align:right">₹${claim.cost_breakdown.other_charges.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Subtotal</strong></td>
            <td style="text-align:right"><strong>₹${claim.cost_breakdown.subtotal.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td>GST (18%)</td>
            <td style="text-align:right">₹${claim.cost_breakdown.gst.toFixed(2)}</td>
          </tr>
          <tr class="cost-total-row">
            <td><strong>TOTAL CLAIM AMOUNT</strong></td>
            <td style="text-align:right"><strong>₹${claim.cost_breakdown.total_claim_amount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 5: Medical Justification -->
    <div class="section">
      <div class="section-title">5. Medical Necessity Justification</div>
      <div class="justification-box">
        ${claim.justification}
      </div>
    </div>

    <!-- Section 6: Supporting Documents -->
    <div class="section">
      <div class="section-title">6. Supporting Documents to be Attached</div>
      <div class="documents-required">
        <div class="documents-required-title">📎 Required Attachments</div>
        <ul>
          ${claim.supporting_documents_required.map((doc) => `<li>${doc}</li>`).join("\n")}
        </ul>
      </div>
    </div>

    ${claim.claim_eligibility_notes ? `
    <div class="section">
      <div class="section-title">7. Eligibility Notes</div>
      <div class="section-body">
        <p style="font-size:11px;color:#6b7280;line-height:1.6">${claim.claim_eligibility_notes}</p>
      </div>
    </div>
    ` : ""}

    <!-- Declaration -->
    <div class="section" style="margin-top:32px">
      <div class="section-title">Declaration</div>
      <div class="section-body">
        <p style="font-size:10px;line-height:1.7;color:#4b5563">
          I hereby declare that the information provided above is true and correct to the best of my knowledge.
          I understand that any false or misleading information may result in rejection of the claim and/or cancellation of the policy.
          I authorize the insurance company to access my medical records as necessary for claim processing.
        </p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <p class="signature-label">Patient / Claimant Signature</p>
        <p class="signature-label" style="margin-top:2px;font-size:9px">Date: _______________</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <p class="signature-label">${claim.doctor_name || "Treating Physician"}</p>
        <p class="signature-label" style="margin-top:2px;font-size:9px">Date: ${dateStr}</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <p>Generated by CliniQ Smart EMR System</p>
        <p>Consultation ID: ${claim.consultation_id?.substring(0, 8) || "N/A"}</p>
        <p>Generated on: ${dateStr}</p>
        <p style="margin-top:6px;font-size:8px">This is a computer-generated document. For official claims, attach original bills and medical records.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
        reportWindow.document.write(html);
        reportWindow.document.close();
    } else {
        alert("Pop-up blocked. Please allow pop-ups for this site to generate the claim form.");
    }
}
