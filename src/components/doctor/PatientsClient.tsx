"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Search, Plus, ChevronRight, Filter, Phone,
  Stethoscope, AlertTriangle, Calendar, Heart, Droplets,
  Shield, FileText, Activity, Clock, MapPin, X,
  ChevronDown, ChevronUp, Eye, Edit3, Download, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientType {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  phone: string;
  blood_group: string;
  dob: string;
  abha_id: string;
  address: string;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contact: string;
  last_visit: string | null;
  total_visits: number;
  status: "active" | "inactive";
  risk_level: "low" | "high" | "critical";
  upcoming_appointment: string | null;
}

// ─── Helper functions ────────────────────────────────────────────────────────

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function determineRiskLevel(allergies: string[], chronicConditions: string[]): "low" | "high" | "critical" {
  const criticalConditions = ["Coronary Artery Disease", "COPD", "Atrial Fibrillation", "Chronic Kidney Disease Stage 3", "Heart Failure"];
  const highRiskConditions = ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"];

  const hasCritical = chronicConditions.some(c => criticalConditions.some(cc => c.includes(cc)));
  if (hasCritical) return "critical";

  const highRiskCount = chronicConditions.filter(c => highRiskConditions.some(hrc => c.includes(hrc))).length;
  if (highRiskCount >= 2 || allergies.length >= 2) return "high";

  return "low";
}

// ─── Risk level config ────────────────────────────────────────────────────────

const RISK_CONFIG = {
  low: { label: "Low Risk", variant: "success" as const, dot: "bg-green-400" },
  high: { label: "High Risk", variant: "warning" as const, dot: "bg-amber-400" },
  critical: { label: "Critical", variant: "destructive" as const, dot: "bg-red-400" },
};

// ─── Filter options ───────────────────────────────────────────────────────────

type FilterKey = "all" | "critical" | "high" | "low" | "active" | "inactive";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High Risk" },
  { key: "low", label: "Low Risk" },
];

// ─── Add Patient Modal ───────────────────────────────────────────────────────

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "M",
    blood_group: "",
    phone: "",
    abha_id: "",
    address: "",
    emergency_contact: "",
    allergies: "",
    chronic_conditions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase.from("patients").insert({
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group || null,
        phone: formData.phone || null,
        abha_id: formData.abha_id || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(Boolean) : [],
        chronic_conditions: formData.chronic_conditions ? formData.chronic_conditions.split(",").map(c => c.trim()).filter(Boolean) : [],
      });

      if (error) throw error;

      // Reset form
      setFormData({
        name: "",
        dob: "",
        gender: "M",
        blood_group: "",
        phone: "",
        abha_id: "",
        address: "",
        emergency_contact: "",
        allergies: "",
        chronic_conditions: "",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to add patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Add New Patient</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--foreground-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name & DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                Gender <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Phone & ABHA ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">ABHA ID</label>
              <input
                type="text"
                value={formData.abha_id}
                onChange={(e) => setFormData({ ...formData, abha_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
                placeholder="ABHA-XXXX-XXXX-XXXX"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              placeholder="Full address"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              placeholder="+91 98765 43211 (Relation - Name)"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Allergies <span className="text-[var(--foreground-subtle)]">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              placeholder="Penicillin, Sulfa drugs"
            />
          </div>

          {/* Chronic Conditions */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Chronic Conditions <span className="text-[var(--foreground-subtle)]">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.chronic_conditions}
              onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-blue-500/50"
              placeholder="Type 2 Diabetes, Hypertension"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Patient
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Patient Detail Drawer ────────────────────────────────────────────────────

function PatientDetail({ patient, onClose }: { patient: PatientType; onClose: () => void }) {
  const risk = RISK_CONFIG[patient.risk_level];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg bg-[var(--background)] border-l border-[var(--border)] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-6 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold",
                patient.risk_level === "critical" ? "bg-red-500/20 text-red-400" :
                patient.risk_level === "high" ? "bg-amber-500/20 text-amber-400" :
                "bg-blue-500/20 text-blue-400"
              )}>
                {getInitials(patient.name)}
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">{patient.name}</h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {patient.age}{patient.gender} · {patient.blood_group || "—"} · ID: {patient.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--foreground-subtle)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={risk.variant}>{risk.label}</Badge>
            {patient.abha_id && <Badge variant="outline" className="font-mono text-[10px]">{patient.abha_id}</Badge>}
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link href={`/doctor/consultation/new?patientId=${patient.id}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Stethoscope className="w-3.5 h-3.5" /> Consult
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> EMR
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5" /> Call
            </Button>
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider">Contact Information</h3>
            <div className="space-y-1.5">
              {patient.phone && (
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <Phone className="w-3 h-3 text-[var(--foreground-subtle)]" /> {patient.phone}
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <MapPin className="w-3 h-3 text-[var(--foreground-subtle)]" /> {patient.address}
                </div>
              )}
              {patient.emergency_contact && (
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <Shield className="w-3 h-3 text-[var(--foreground-subtle)]" /> Emergency: {patient.emergency_contact}
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Allergies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {patient.chronic_conditions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3" /> Chronic Conditions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {patient.chronic_conditions.map((c) => (
                  <Badge key={c} variant="warning" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider">Visit History</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--foreground-muted)]">Total Visits</span>
                <span className="text-[var(--foreground)] font-medium">{patient.total_visits}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--foreground-muted)]">Last Visit</span>
                <span className="text-[var(--foreground)] font-medium">
                  {patient.last_visit ? formatDate(patient.last_visit) : "No visits yet"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--foreground-muted)]">Date of Birth</span>
                <span className="text-[var(--foreground)] font-medium">{formatDate(patient.dob)}</span>
              </div>
              {patient.upcoming_appointment && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--foreground-muted)]">Next Appointment</span>
                  <span className="text-green-400 font-medium">{patient.upcoming_appointment}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Patient Row ──────────────────────────────────────────────────────────────

function PatientRow({ patient, index, onClick }: { patient: PatientType; index: number; onClick: () => void }) {
  const risk = RISK_CONFIG[patient.risk_level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer group",
        patient.risk_level === "critical"
          ? "border-red-500/25 bg-red-500/5 hover:bg-red-500/10"
          : patient.risk_level === "high"
          ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-[var(--border)] hover:bg-[var(--surface-elevated)]"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0",
        patient.risk_level === "critical" ? "bg-red-500/20 text-red-400" :
        patient.risk_level === "high" ? "bg-amber-500/20 text-amber-400" :
        "bg-blue-500/20 text-blue-400"
      )}>
        {getInitials(patient.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">{patient.name}</p>
          <span className="text-[10px] text-[var(--foreground-subtle)]">{patient.age}{patient.gender}</span>
          <Badge variant={risk.variant} className="text-[9px] py-0 px-1.5 h-3.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", risk.dot)} />
            {risk.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs text-[var(--foreground-muted)] truncate">
            {patient.chronic_conditions.length > 0 ? patient.chronic_conditions.join(", ") : "No chronic conditions"}
          </p>
        </div>
      </div>

      {/* Allergies indicator */}
      {patient.allergies.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400">{patient.allergies.length}</span>
        </div>
      )}

      {/* Blood group */}
      {patient.blood_group && (
        <div className="shrink-0">
          <Badge variant="outline" className="text-[10px] font-mono">
            <Droplets className="w-2.5 h-2.5 mr-0.5" />
            {patient.blood_group}
          </Badge>
        </div>
      )}

      {/* Last visit */}
      <div className="text-right shrink-0">
        <p className="text-[10px] text-[var(--foreground-subtle)]">Last visit</p>
        <p className="text-xs font-medium text-[var(--foreground-muted)]">
          {patient.last_visit ? formatDate(patient.last_visit) : "—"}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PatientsClientProps {
  user: { id: string; name: string; email: string; role: string };
}

export function PatientsClient({ user }: PatientsClientProps) {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "risk" | "lastVisit">("risk");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPatients = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    try {
      // Fetch patients with their consultations and appointments
      const { data: patientsData, error } = await supabase
        .from("patients")
        .select(`
          id, name, dob, gender, blood_group, allergies, chronic_conditions,
          abha_id, phone, address, emergency_contact, created_at,
          consultations(id, started_at),
          appointments(id, date, time_slot, status)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (patientsData) {
        const mapped: PatientType[] = patientsData.map((p) => {
          const allergies = (p.allergies ?? []) as string[];
          const chronicConditions = (p.chronic_conditions ?? []) as string[];
          const consultations = (p.consultations ?? []) as Array<{ id: string; started_at: string }>;
          const appointments = (p.appointments ?? []) as Array<{ id: string; date: string; time_slot: string; status: string }>;

          // Calculate last visit from consultations
          const sortedConsultations = consultations.sort(
            (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          );
          const lastVisit = sortedConsultations.length > 0 ? sortedConsultations[0].started_at : null;

          // Find upcoming appointment
          const today = new Date().toISOString().split("T")[0];
          const upcomingAppts = appointments
            .filter((a) => a.status !== "cancelled" && a.date >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const nextAppt = upcomingAppts.length > 0
            ? `${new Date(upcomingAppts[0].date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} ${upcomingAppts[0].time_slot}`
            : null;

          return {
            id: p.id as string,
            name: (p.name ?? "Patient") as string,
            age: p.dob ? calculateAge(p.dob as string) : 0,
            gender: ((p.gender ?? "M") as string).toUpperCase() as "M" | "F",
            phone: (p.phone ?? "") as string,
            blood_group: (p.blood_group ?? "") as string,
            dob: (p.dob ?? "") as string,
            abha_id: (p.abha_id ?? "") as string,
            address: (p.address ?? "") as string,
            allergies,
            chronic_conditions: chronicConditions,
            emergency_contact: (p.emergency_contact ?? "") as string,
            last_visit: lastVisit,
            total_visits: consultations.length,
            status: "active" as const,
            risk_level: determineRiskLevel(allergies, chronicConditions),
            upcoming_appointment: nextAppt,
          };
        });

        setPatients(mapped);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    let list = patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.abha_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.chronic_conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "critical": return p.risk_level === "critical";
        case "high": return p.risk_level === "high";
        case "low": return p.risk_level === "low";
        case "active": return p.status === "active";
        case "inactive": return p.status === "inactive";
        default: return true;
      }
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "lastVisit") {
        const aTime = a.last_visit ? new Date(a.last_visit).getTime() : 0;
        const bTime = b.last_visit ? new Date(b.last_visit).getTime() : 0;
        return bTime - aTime;
      }
      // risk: critical > high > low
      const riskOrder = { critical: 0, high: 1, low: 2 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });

    return list;
  }, [patients, searchQuery, activeFilter, sortBy]);

  // Stats
  const stats = useMemo(() => [
    { label: "Total Patients", value: patients.length.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "High Risk", value: patients.filter(p => p.risk_level === "critical" || p.risk_level === "high").length.toString(), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "With Appointments", value: patients.filter(p => p.upcoming_appointment).length.toString(), icon: Calendar, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Active Cases", value: patients.filter(p => p.status === "active").length.toString(), icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
  ], [patients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Patient Registry
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
            {patients.length} patients · {patients.filter(p => p.status === "active").length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-[var(--border)]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5">{stat.value}</p>
                    </div>
                    <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", stat.bg)}>
                      <Icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-subtle)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, ABHA ID, or condition..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                activeFilter === f.key
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] focus:outline-none cursor-pointer"
        >
          <option value="risk">Sort: Risk Level</option>
          <option value="name">Sort: Name</option>
          <option value="lastVisit">Sort: Last Visit</option>
        </select>
      </div>

      {/* Patient List */}
      <div className="space-y-2">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--foreground-subtle)]">
            <Users className="w-12 h-12 mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">No patients yet</h3>
            <p className="text-sm mt-1">Add your first patient to get started</p>
            <Button className="mt-4 gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--foreground-subtle)]">
            <Search className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No patients match your search</p>
            <p className="text-xs mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredPatients.map((patient, i) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              index={i}
              onClick={() => setSelectedPatient(patient)}
            />
          ))
        )}
      </div>

      {/* Patient Detail Drawer */}
      <AnimatePresence>
        {selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddPatientModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchPatients}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
