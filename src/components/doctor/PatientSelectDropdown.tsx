"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PatientSelectDropdownProps {
  patients: any[];
  currentPatientId: string;
  onSelect: (id: string, name: string) => void;
  disabled?: boolean;
}

export function PatientSelectDropdown({ patients, currentPatientId, onSelect, disabled }: PatientSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredPatients = useMemo(() => {
    return patients.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone_number?.includes(searchQuery)
    );
  }, [patients, searchQuery]);

  const currentPatient = patients.find(p => p.id === currentPatientId);

  // Helper to calculate age from DOB
  const getAge = (dob: string | undefined) => {
    if (!dob) return "--";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "--";
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age;
  };

  // Helper to format gender
  const getGenderLabel = (gender: string | undefined) => {
    if (!gender) return "U";
    return gender.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors pointer-events-auto",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-blue-500/20 border-blue-300"
        )}
      >
        <User className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 min-w-24 text-left truncate">
          {currentPatient ? currentPatient.name : "Select Patient"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden z-[100]"
          >
            {/* Search header */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400 text-gray-800"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto w-full">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 italic">
                  No patients found
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredPatients.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelect(p.id, p.name);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-center justify-between hover:bg-blue-50/50 transition-colors group",
                        i !== filteredPatients.length - 1 && "border-b border-gray-50",
                        currentPatientId === p.id && "bg-blue-50/50"
                      )}
                    >
                      <div>
                        <p className={cn(
                          "text-sm font-semibold transition-colors",
                          currentPatientId === p.id ? "text-blue-700" : "text-gray-800 group-hover:text-black"
                        )}>
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium flex gap-1">
                          <span>{getAge(p.dob)}{getGenderLabel(p.gender)}</span>
                          <span className="text-gray-300">•</span>
                          <span>{p.phone_number || "+91 —"}</span>
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm shadow-blue-500/10">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close footer */}
            <div className="p-2 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
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
