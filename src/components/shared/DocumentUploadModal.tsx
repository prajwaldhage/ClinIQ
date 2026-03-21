"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  Image,
  Check,
  AlertCircle,
  Loader2,
  Pill,
  FlaskConical as Flask,
  FileCheck,
  Scan,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onUploadSuccess?: () => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  patientId,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a valid image (JPEG, PNG) or PDF file");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Generate preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    },
    [],
  );

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Upload to API
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          file_name: file.name,
          image_base64: base64.split(",")[1], // Remove data:image/... prefix
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);

      // Call success callback
      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setUploadProgress(0);
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl mx-4"
        >
          <Card className="border-blue-500/20">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Upload Medical Document
                  </h2>
                  <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                    Upload prescription, lab report, or scan (JPEG, PNG, PDF)
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-elevated)] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--foreground-subtle)]" />
                </button>
              </div>

              {/* Upload Area */}
              {!file && (
                <label className="block">
                  <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors">
                    <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      JPEG, PNG, or PDF (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              {/* Preview */}
              {file && !result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        {(file.size / 1024).toFixed(1)} KB ·{" "}
                        {file.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="w-7 h-7 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  {preview && file.type.startsWith("image/") && (
                    <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-contain bg-[var(--surface)]"
                      />
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--foreground-subtle)]">
                          Processing document...
                        </span>
                        <span className="font-semibold text-blue-400">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                      <p className="text-[10px] text-[var(--foreground-subtle)] text-center">
                        Running OCR and AI extraction...
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpload}
                        className="gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload & Extract
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Success Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-400">
                        Document Processed Successfully!
                      </p>
                      <p className="text-xs text-green-400/70 mt-0.5">
                        {result.message as string}
                      </p>
                    </div>
                  </div>

                  {/* Extracted Data Preview */}
                  {!!result.structured_data && (
                    <Card className="border-blue-500/20">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          Extracted Information
                        </p>

                        {renderExtractedData(
                          result.structured_data as Record<string, unknown>,
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleClose}>
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">
                      Upload Failed
                    </p>
                    <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function renderExtractedData(data: Record<string, unknown>) {
  const diagnosis = (data.diagnosis as string[]) || [];
  const medications =
    (data.medications as Array<{
      name: string;
      dose?: string;
      frequency?: string;
    }>) || [];
  const labTests =
    (data.lab_tests as Array<{ test_name: string; result?: string }>) || [];

  return (
    <div className="space-y-3">
      {!!data.doctor_name && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1">
            Doctor
          </p>
          <p className="text-xs font-semibold text-[var(--foreground)]">
            {data.doctor_name as string}
            {!!data.hospital && (
              <span className="text-[var(--foreground-subtle)] font-normal">
                {" "}
                · {data.hospital as string}
              </span>
            )}
          </p>
        </div>
      )}

      {!!data.date && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1">
            Document Date
          </p>
          <p className="text-xs font-semibold text-[var(--foreground)]">
            {data.date as string}
          </p>
        </div>
      )}

      {diagnosis.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Diagnosis Extracted
          </p>
          <div className="flex flex-wrap gap-1.5">
            {diagnosis.map((d, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {medications.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Medications ({medications.length})
          </p>
          <div className="space-y-1">
            {medications.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <Pill className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--foreground)]">
                    {m.name}
                  </span>
                  {m.dose && (
                    <span className="text-[var(--foreground-subtle)]">
                      {" "}
                      — {m.dose}
                      {m.frequency && ` · ${m.frequency}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {labTests.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider mb-1.5">
            Lab Tests ({labTests.length})
          </p>
          <div className="space-y-1">
            {labTests.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <Flask className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--foreground)]">
                    {t.test_name}
                  </span>
                  {t.result && (
                    <span className="text-[var(--foreground-subtle)]">
                      {" "}
                      — {t.result}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!data.notes && (
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-2.5">
          <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
            Notes
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
            {data.notes as string}
          </p>
        </div>
      )}

      {!!data.confidence && (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[9px] ${
              data.confidence === "high"
                ? "border-green-500/30 text-green-400"
                : data.confidence === "medium"
                  ? "border-amber-500/30 text-amber-400"
                  : "border-red-500/30 text-red-400"
            }`}
          >
            {data.confidence as string} confidence
          </Badge>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
