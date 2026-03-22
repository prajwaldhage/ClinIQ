"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Patient } from "@/lib/types";

interface PatientDropdownProps {
  onSelect: (patient: Patient) => void;
  selectedPatientName: string;
}

export function PatientDropdown({ onSelect, selectedPatientName }: PatientDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch patients
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const url = search ? `/api/patients?q=${encodeURIComponent(search)}` : `/api/patients`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (active) setPatients(data.patients || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPatients, 300);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [search, isOpen]);

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const today = new Date();
    const dob = new Date(dobString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors border-[var(--border)] shadow-sm"
      >
        <User className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
        <span className="text-xs font-medium text-[var(--foreground)] pr-1">
          {selectedPatientName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-[var(--surface-elevated)] rounded-xl shadow-xl border border-[var(--border)] z-50 flex flex-col pt-2"
          >
            {/* Search Input */}
            <div className="px-3 pb-2 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-blue-500 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)]"
                  autoFocus
                />
              </div>
            </div>

            {/* Patient List */}
            <div className="max-h-64 overflow-y-auto">
              {loading && patients.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--foreground-subtle)]">Loading...</div>
              ) : patients.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--foreground-subtle)]">No patients found.</div>
              ) : (
                <div className="flex flex-col">
                  {patients.map((patient) => {
                    const initial = patient.name.charAt(0).toUpperCase();
                    const age = calculateAge(patient.dob);
                    const genderLabel = patient.gender === "M" ? "M" : patient.gender === "F" ? "F" : "O";

                    return (
                      <button
                        key={patient.id}
                        onClick={() => {
                          onSelect(patient);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-3 hover:bg-[var(--surface)] border-b border-[var(--border)] transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {patient.name}
                          </p>
                          <p className="text-[11px] text-[var(--foreground-subtle)] mt-1">
                            {age ? `${age}${genderLabel}` : genderLabel} · {patient.phone}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-500">{initial}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-xl border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-xs font-medium text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
