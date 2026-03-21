"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Calendar,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Pill,
  FlaskConical,
  Scan,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

interface PatientTimelineProps {
  patientId: string;
}

export function PatientTimeline({ patientId }: PatientTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  async function fetchTimeline() {
    try {
      setLoading(true);
      const res = await fetch(`/api/timeline?patient_id=${patientId}`);
      const data = await res.json();

      if (data.timeline) {
        setTimeline(data.timeline);
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (iconName: string, eventType: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      stethoscope: Stethoscope,
      pill: Pill,
      flask: FlaskConical,
      scan: Scan,
      file: FileText,
      "file-text": FileText,
    };

    const IconComponent =
      iconMap[iconName] ||
      (eventType === "consultation" ? Stethoscope : FileText);
    return IconComponent;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
      pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colorMap[status] || colorMap.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        <span className="ml-2 text-sm text-[var(--foreground-subtle)]">
          Loading timeline...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Medical Timeline
          </h2>
          <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
            Complete history of consultations and uploaded documents
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[21px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

        {/* Events */}
        <div className="space-y-4">
          {timeline.map((event, index) => {
            const isExpanded = expandedId === event.event_id;
            const IconComponent = getIcon(event.icon, event.event_type);
            const isConsultation = event.event_type === "consultation";

            return (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-12"
              >
                {/* Icon circle */}
                <div
                  className={`absolute left-0 w-11 h-11 rounded-full flex items-center justify-center ${
                    isConsultation
                      ? "bg-blue-500/10 border-2 border-blue-500/30"
                      : "bg-purple-500/10 border-2 border-purple-500/30"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${isConsultation ? "text-blue-400" : "text-purple-400"}`}
                  />
                </div>

                <Card>
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : event.event_id)
                    }
                    className="w-full text-left"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                              {event.title}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[8px] ${getStatusColor(event.status)}`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-[var(--foreground-subtle)]">
                            {event.subtitle}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3 h-3 text-[var(--foreground-subtle)]" />
                            <span className="text-[10px] text-[var(--foreground-subtle)]">
                              {new Date(event.event_date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-[var(--border)]"
                    >
                      <CardContent className="p-4 space-y-3">
                        {isConsultation ? (
                          <ConsultationDetails data={event.data} />
                        ) : (
                          <DocumentDetails data={event.data} />
                        )}

                        <div className="flex gap-2 pt-2">
                          {isConsultation ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() =>
                                handleDownloadReport(event.event_id)
                              }
                            >
                              <Download className="w-3 h-3" />
                              Download Report
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => handleViewDocument(event.data)}
                            >
                              <Eye className="w-3 h-3" />
                              View Document
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {timeline.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-[var(--foreground-subtle)] mx-auto mb-3 opacity-30" />
            <p className="text-sm text-[var(--foreground-subtle)]">
              No medical history yet
            </p>
            <p className="text-xs text-[var(--foreground-subtle)] mt-1">
              Upload documents or complete a consultation to start building your
              medical timeline
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  function handleDownloadReport(consultationId: string) {
    window.open(
      `/api/generate-report?consultation_id=${consultationId}`,
      "_blank",
    );
  }

  function handleViewDocument(data: Record<string, unknown>) {
    if (data.file_url) {
      window.open(data.file_url as string, "_blank");
    }
  }
}

function ConsultationDetails({ data }: { data: Record<string, unknown> }) {
  const diagnosis = (data.diagnosis as string[]) || [];
  const medications = (data.medications as Array<{ name: string }>) || [];
  const labTests = (data.lab_tests as string[]) || [];
  const vitals = (data.vitals as Record<string, number>) || {};

  return (
    <div className="space-y-3">
      {diagnosis.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Diagnosis
          </p>
          <div className="flex flex-wrap gap-1.5">
            {diagnosis.map((d, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Object.keys(vitals).length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Vitals
          </p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(vitals)
              .slice(0, 4)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="bg-[var(--surface)] rounded-md p-2 text-center"
                >
                  <p className="text-[9px] text-[var(--foreground-subtle)]">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {value}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {medications.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
              Medications ({medications.length})
            </p>
            <div className="space-y-1">
              {medications.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Pill className="w-3 h-3 text-green-400 shrink-0" />
                  <span className="text-[11px] text-[var(--foreground)] truncate">
                    {m.name}
                  </span>
                </div>
              ))}
              {medications.length > 3 && (
                <p className="text-[10px] text-[var(--foreground-subtle)] pl-5">
                  +{medications.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {labTests.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
              Lab Tests ({labTests.length})
            </p>
            <div className="space-y-1">
              {labTests.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FlaskConical className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="text-[11px] text-[var(--foreground)] truncate">
                    {t}
                  </span>
                </div>
              ))}
              {labTests.length > 3 && (
                <p className="text-[10px] text-[var(--foreground-subtle)] pl-5">
                  +{labTests.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentDetails({ data }: { data: Record<string, unknown> }) {
  const structuredData = data as {
    file_type?: string;
    ocr_confidence?: number;
    doctor_name?: string;
    diagnosis?: string[];
    medications?: Array<{ name: string }>;
    lab_tests?: Array<{ test_name: string }>;
    notes?: string;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1">
            Document Type
          </p>
          <Badge variant="secondary" className="text-[10px]">
            {structuredData.file_type?.replace(/_/g, " ") || "Other"}
          </Badge>
        </div>

        {structuredData.ocr_confidence && (
          <div>
            <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1">
              OCR Confidence
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={structuredData.ocr_confidence * 100}
                className="h-1.5"
              />
              <span className="text-xs font-semibold">
                {Math.round(structuredData.ocr_confidence * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {structuredData.doctor_name && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1">
            Prescribed By
          </p>
          <p className="text-xs text-[var(--foreground)]">
            {structuredData.doctor_name}
          </p>
        </div>
      )}

      {structuredData.diagnosis && structuredData.diagnosis.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Diagnosis
          </p>
          <div className="flex flex-wrap gap-1.5">
            {structuredData.diagnosis.map((d, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {structuredData.medications && structuredData.medications.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Medications Extracted
          </p>
          <div className="space-y-1">
            {structuredData.medications.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Pill className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-[11px] text-[var(--foreground)]">
                  {m.name}
                </span>
              </div>
            ))}
            {structuredData.medications.length > 3 && (
              <p className="text-[10px] text-[var(--foreground-subtle)] pl-5">
                +{structuredData.medications.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}

      {structuredData.notes && (
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-2.5">
          <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
            Notes
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
            {structuredData.notes}
          </p>
        </div>
      )}
    </div>
  );
}
